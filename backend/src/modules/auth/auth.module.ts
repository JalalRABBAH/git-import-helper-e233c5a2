import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OauthStrategy } from './strategies/oauth.strategy';
import { User } from '@modules/users/entities/user.entity';
import { MfaSetting } from '@modules/users/entities/mfa-setting.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { UserRoleAssignment } from '@modules/roles/entities/user-role-assignment.entity';
import { Actor } from '@modules/actors/entities/actor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MfaSetting, Role, UserRoleAssignment, Actor]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.jwt.secret'),
        signOptions: {
          issuer: configService.get('auth.jwt.issuer'),
          audience: configService.get('auth.jwt.audience'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OauthStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
