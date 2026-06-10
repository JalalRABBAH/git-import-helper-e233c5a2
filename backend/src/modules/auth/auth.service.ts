import {
  Injectable, UnauthorizedException, BadRequestException, ForbiddenException, ConflictException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { User } from '@modules/users/entities/user.entity';
import { MfaSetting } from '@modules/users/entities/mfa-setting.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { UserRoleAssignment } from '@modules/roles/entities/user-role-assignment.entity';
import { Actor } from '@modules/actors/entities/actor.entity';
import { ActorStatus, AgreementStatus } from '@shared/enums/actor-type.enum';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { MfaSetupDto, MfaSetupResponseDto } from './dto/mfa-verify.dto';
import { TokenRefreshResponseDto } from './dto/refresh.dto';
import { OauthCallbackDto } from './dto/oauth-callback.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { AuthTokens, TokenPayload } from '@shared/interfaces/auth.interface';
import { HashUtil } from '@common/utils/hash.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(MfaSetting) private mfaRepo: Repository<MfaSetting>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(UserRoleAssignment) private userRoleRepo: Repository<UserRoleAssignment>,
    @InjectRepository(Actor) private actorRepo: Repository<Actor>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  // ─── REGISTER ─────────────────────────────────────────
  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Check email uniqueness
      const existing = await this.userRepo.findOne({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }

      // 2. Hash password
      const bcryptRounds = this.configService.get('auth.password.bcryptRounds') || 12;
      const passwordHash = await bcrypt.hash(dto.password, bcryptRounds);

      // 3. Create user
      const user = this.userRepo.create({
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isActive: true,
        emailVerified: false,
      });
      const savedUser = await queryRunner.manager.save(user);

      // 4. Find or create role
      let roleName = dto.role;
      const role = await this.roleRepo.findOne({ where: { name: roleName } });
      if (!role) {
        throw new BadRequestException(`Rôle ${roleName} non trouvé. Contactez l'administrateur.`);
      }

      // 5. Assign role to user
      const userRole = this.userRoleRepo.create({
        userId: savedUser.id,
        roleId: role.id,
        isPrimaryRole: true,
      });
      await queryRunner.manager.save(userRole);

      let enterpriseId: string | undefined;

      // 6. If ENTERPRISE_ADMIN, create enterprise
      if (dto.role === 'ENTERPRISE_ADMIN') {
        if (!dto.enterpriseName || !dto.rccm || !dto.ifu) {
          throw new BadRequestException('enterpriseName, rccm et ifu sont requis pour le rôle ENTERPRISE_ADMIN');
        }

        const actor = this.actorRepo.create({
          companyName: dto.enterpriseName,
          tradeName: dto.enterpriseName,
          nif: dto.ifu,
          rccm: dto.rccm,
          legalRepresentativeName: `${dto.firstName} ${dto.lastName}`,
          legalRepresentativePhone: '',
          email: dto.email.toLowerCase(),
          phone: '',
          addressLine1: '',
          city: 'Ouagadougou',
          region: 'Centre',
          status: ActorStatus.ACTIVE,
          agreementStatus: AgreementStatus.APPROVED,
          complianceScore: 100,
          actorTypeId: '', // Will be set by admin later
        });
        const savedActor = await queryRunner.manager.save(actor);
        enterpriseId = savedActor.id;

        // Link userRole to actor
        userRole.actorId = savedActor.id;
        await queryRunner.manager.save(userRole);
      }

      await queryRunner.commitTransaction();

      // 7. Generate tokens
      const tokens = await this.generateTokensForUser(savedUser, [roleName]);

      this.logger.log(`User registered: ${savedUser.email} with role ${roleName}`);

      return {
        ...tokens,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          roles: [roleName],
        },
        enterpriseId,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── LOGIN ────────────────────────────────────────────
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: ['roleAssignments', 'roleAssignments.role', 'roleAssignments.role.permissions'],
    });

    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');
    if (!user.isActive) throw new ForbiddenException('Compte suspendu ou désactivé');
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(`Compte verrouillé jusqu'à ${user.lockedUntil.toISOString()}`);
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    await this.resetFailedAttempts(user);

    // Check MFA
    const mfa = await this.mfaRepo.findOne({ where: { userId: user.id, isEnabled: true } });
    if (mfa && !dto.mfaCode) {
      const tempToken = this.generateTempToken(user);
      return { accessToken: '', refreshToken: '', expiresIn: 0, tokenType: 'Bearer', mfaRequired: true, tempToken };
    }

    if (mfa && dto.mfaCode) {
      const verified = this.verifyTOTP(mfa.secret!, dto.mfaCode);
      if (!verified) throw new UnauthorizedException('Code MFA invalide');
      await this.mfaRepo.update(mfa.id, { lastUsedAt: new Date() });
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roleAssignments.map(ra => ra.role.name),
      },
    };
  }

  // ─── MFA VERIFY ───────────────────────────────────────
  async verifyMfa(dto: MfaVerifyDto): Promise<LoginResponseDto> {
    try {
      const payload = this.jwtService.verify(dto.tempToken, {
        secret: this.configService.get('auth.jwt.secret'),
      });
      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ['roleAssignments', 'roleAssignments.role', 'roleAssignments.role.permissions'],
      });
      if (!user) throw new UnauthorizedException('Token temporaire invalide');

      const mfa = await this.mfaRepo.findOne({ where: { userId: user.id, isEnabled: true } });
      if (!mfa) throw new BadRequestException('MFA non configuré');

      const verified = this.verifyTOTP(mfa.secret!, dto.mfaCode);
      if (!verified) throw new UnauthorizedException('Code MFA invalide');

      await this.mfaRepo.update(mfa.id, { lastUsedAt: new Date() });
      const tokens = await this.generateTokens(user);
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roleAssignments.map(ra => ra.role.name),
        },
      };
    } catch {
      throw new UnauthorizedException('Token temporaire expiré ou invalide');
    }
  }

  // ─── MFA SETUP ────────────────────────────────────────
  async setupMfa(userId: string, dto: MfaSetupDto): Promise<MfaSetupResponseDto> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const secret = speakeasy.generateSecret({
      length: 32,
      name: `${this.configService.get('auth.mfa.issuer')}:${user.email}`,
      issuer: this.configService.get('auth.mfa.issuer'),
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    const backupCodes = Array.from({ length: 8 }, () => HashUtil.generateNumericCode(8));

    // Upsert MFA settings
    const existing = await this.mfaRepo.findOne({ where: { userId, mfaType: dto.mfaType } });
    if (existing) {
      await this.mfaRepo.update(existing.id, {
        secret: secret.base32,
        backupCodes: JSON.stringify(backupCodes.map(c => HashUtil.sha256(c))),
        isEnabled: false, // Requires verification before enabling
      });
    } else {
      await this.mfaRepo.save(this.mfaRepo.create({
        userId,
        mfaType: dto.mfaType,
        secret: secret.base32,
        backupCodes: JSON.stringify(backupCodes.map(c => HashUtil.sha256(c))),
        isEnabled: false,
      }));
    }

    return { secret: secret.base32, qrCodeUrl, backupCodes };
  }

  // ─── REFRESH TOKEN ────────────────────────────────────
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('auth.jwt.refreshSecret'),
      });
      if (payload.type !== 'refresh') throw new UnauthorizedException('Token invalide');

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ['roleAssignments', 'roleAssignments.role'],
      });
      if (!user || !user.isActive) throw new UnauthorizedException('Utilisateur invalide');

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  // ─── OAUTH CALLBACK ───────────────────────────────────
  async oauthCallback(dto: OauthCallbackDto): Promise<LoginResponseDto> {
    // Simplified - in production, exchange code for token with provider
    this.logger.log(`OAuth callback: provider=${dto.provider}`);
    throw new BadRequestException('OAuth non implémenté dans cette version');
  }

  // ─── LOGOUT ───────────────────────────────────────────
  async logout(userId: string, tokenJti: string): Promise<void> {
    this.logger.log(`Logout: userId=${userId}, jti=${tokenJti}`);
    // In production: add token JTI to Redis blacklist
  }

  // ─── ME ───────────────────────────────────────────────
  async getMe(userId: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roleAssignments', 'roleAssignments.role'],
    });
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      locale: user.locale,
      timezone: user.timezone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      roles: user.roleAssignments.map(ra => ({
        name: ra.role.name,
        label: ra.role.label,
        isPrimary: ra.isPrimaryRole,
      })),
    };
  }

  // ─── HELPERS ──────────────────────────────────────────
  private async generateTokensForUser(user: User, roles: string[]): Promise<AuthTokens> {
    const jti = HashUtil.generateSecureToken(16);
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions: [],
      locale: user.locale,
      type: 'access',
      jti,
    };

    const authConfig = this.configService.get('auth');
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: authConfig.jwt.accessTokenExpiry,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: authConfig.jwt.refreshSecret,
        expiresIn: authConfig.jwt.refreshTokenExpiry,
        issuer: authConfig.jwt.issuer,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      tokenType: 'Bearer',
    };
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const roles = user.roleAssignments.map(ra => ra.role.name);
    const permissions = user.roleAssignments
      .flatMap(ra => ra.role.permissions?.map(p => `${p.resource}:${p.action}`) || []);

    const jti = HashUtil.generateSecureToken(16);
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions: [...new Set(permissions)],
      locale: user.locale,
      type: 'access',
      jti,
    };

    const authConfig = this.configService.get('auth');
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: authConfig.jwt.accessTokenExpiry,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: authConfig.jwt.refreshSecret,
        expiresIn: authConfig.jwt.refreshTokenExpiry,
        issuer: authConfig.jwt.issuer,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      tokenType: 'Bearer',
    };
  }

  private generateTempToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'mfa_temp' },
      { expiresIn: '5m', issuer: this.configService.get('auth.jwt.issuer') },
    );
  }

  private verifyTOTP(secret: string, code: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: this.configService.get('auth.mfa.window') || 1,
    });
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const maxAttempts = this.configService.get('auth.mfa.maxAttempts') || 5;
    const newAttempts = (user.failedLoginAttempts || 0) + 1;
    const update: any = { failedLoginAttempts: newAttempts };

    if (newAttempts >= maxAttempts) {
      const lockoutMinutes = this.configService.get('auth.mfa.lockoutMinutes') || 15;
      update.lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      this.logger.warn(`Account locked: userId=${user.id}, attempts=${newAttempts}`);
    }

    await this.userRepo.update(user.id, update);
  }

  private async resetFailedAttempts(user: User): Promise<void> {
    if (user.failedLoginAttempts > 0) {
      await this.userRepo.update(user.id, {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      });
    } else {
      await this.userRepo.update(user.id, { lastLoginAt: new Date() });
    }
  }
}
