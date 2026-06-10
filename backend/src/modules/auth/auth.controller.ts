import {
  Controller, Post, Body, Get, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RefreshTokenDto, TokenRefreshResponseDto } from './dto/refresh.dto';
import { MfaVerifyDto, MfaSetupDto, MfaSetupResponseDto } from './dto/mfa-verify.dto';
import { OauthCallbackDto } from './dto/oauth-callback.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { AuthJwtGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Inscription réussie', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authentification par email/mot de passe' })
  @ApiResponse({ status: 200, description: 'Authentification réussie', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  @ApiResponse({ status: 403, description: 'Compte verrouillé ou suspendu' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchissement du token d\'accès' })
  @ApiResponse({ status: 200, description: 'Nouveaux tokens générés', type: TokenRefreshResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token invalide' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenRefreshResponseDto> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('mfa/setup')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth('BearerAuth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Configuration MFA (TOTP)' })
  @ApiResponse({ status: 200, description: 'Secret MFA généré', type: MfaSetupResponseDto })
  async setupMfa(@CurrentUser('userId') userId: string, @Body() dto: MfaSetupDto): Promise<MfaSetupResponseDto> {
    return this.authService.setupMfa(userId, dto);
  }

  @Post('mfa/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérification MFA' })
  @ApiResponse({ status: 200, description: 'MFA validé', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Code MFA invalide' })
  async verifyMfa(@Body() dto: MfaVerifyDto): Promise<LoginResponseDto> {
    return this.authService.verifyMfa(dto);
  }

  @Post('oauth/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Callback OAuth2 (Google, Microsoft)' })
  @ApiResponse({ status: 200, description: 'Authentification OAuth réussie', type: LoginResponseDto })
  async oauthCallback(@Body() dto: OauthCallbackDto): Promise<LoginResponseDto> {
    return this.authService.oauthCallback(dto);
  }

  @Post('logout')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth('BearerAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Déconnexion' })
  @ApiResponse({ status: 204, description: 'Déconnexion réussie' })
  async logout(@CurrentUser('userId') userId: string, @CurrentUser('jti') jti: string): Promise<void> {
    return this.authService.logout(userId, jti);
  }

  @Get('me')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({ summary: 'Profil utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  async me(@CurrentUser('userId') userId: string): Promise<any> {
    return this.authService.getMe(userId);
  }
}
