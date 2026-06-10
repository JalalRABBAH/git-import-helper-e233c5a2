import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches, IsIn,
} from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_ERROR_MSG } from './login.dto';

export enum RegisterRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MINISTRY_INSPECTOR = 'MINISTRY_INSPECTOR',
  MINISTRY_ANALYST = 'MINISTRY_ANALYST',
  ENTERPRISE_ADMIN = 'ENTERPRISE_ADMIN',
  ENTERPRISE_MANAGER = 'ENTERPRISE_MANAGER',
  ENTERPRISE_SELLER = 'ENTERPRISE_SELLER',
  ENTERPRISE_ACCOUNTANT = 'ENTERPRISE_ACCOUNTANT',
  AUDITOR = 'AUDITOR',
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Adresse email unique' })
  @IsEmail({}, { message: 'L\'adresse email n\'est pas valide' })
  email!: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Mot de passe (12+ caractères, complexité requise)', minLength: 12 })
  @IsString()
  @MinLength(12, { message: PASSWORD_ERROR_MSG })
  @MaxLength(128, { message: 'Le mot de passe ne doit pas dépasser 128 caractères' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_ERROR_MSG })
  password!: string;

  @ApiProperty({ example: 'Jean', description: 'Prénom' })
  @IsString()
  @MinLength(1, { message: 'Le prénom est requis' })
  firstName!: string;

  @ApiProperty({ example: 'Dupont', description: 'Nom de famille' })
  @IsString()
  @MinLength(1, { message: 'Le nom est requis' })
  lastName!: string;

  @ApiProperty({ enum: RegisterRole, description: 'Rôle de l\'utilisateur' })
  @IsString()
  @IsIn(Object.values(RegisterRole), { message: 'Rôle invalide' })
  role!: RegisterRole;

  @ApiPropertyOptional({ example: 'Faso Moto SARL', description: 'Nom de l\'entreprise (requis si role = ENTERPRISE_ADMIN)' })
  @IsOptional()
  @IsString()
  enterpriseName?: string;

  @ApiPropertyOptional({ example: 'RCCM-BF-2023-12345', description: 'Registre du Commerce (requis si role = ENTERPRISE_ADMIN)' })
  @IsOptional()
  @IsString()
  rccm?: string;

  @ApiPropertyOptional({ example: 'IFU-1234567890123', description: 'Identifiant Fiscal Unique (requis si role = ENTERPRISE_ADMIN)' })
  @IsOptional()
  @IsString()
  ifu?: string;
}

export class RegisterResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty() refreshToken!: string;
  @ApiProperty() expiresIn!: number;
  @ApiProperty() tokenType!: string;
  @ApiProperty({ required: false }) user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  @ApiProperty({ required: false }) enterpriseId?: string;
}
