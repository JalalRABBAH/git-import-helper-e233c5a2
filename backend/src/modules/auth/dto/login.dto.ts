import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsString, IsOptional, MinLength, MaxLength, Matches,
} from 'class-validator';

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_+\-=\[\]{};':"\\|,.<>\/~`()])[A-Za-z\d@$!%*?&^#_+\-=\[\]{};':"\\|,.<>\/~`()]{12,128}$/;
export const PASSWORD_ERROR_MSG =
  'Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Adresse email' })
  @IsEmail({}, { message: 'L\'adresse email n\'est pas valide' })
  email!: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Mot de passe', minLength: 12 })
  @IsString()
  @MinLength(12, { message: PASSWORD_ERROR_MSG })
  @MaxLength(128, { message: 'Le mot de passe ne doit pas dépasser 128 caractères' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_ERROR_MSG })
  password!: string;

  @ApiProperty({ required: false, description: 'Code MFA (si activé)' })
  @IsOptional()
  @IsString()
  mfaCode?: string;
}

export class LoginResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty() refreshToken!: string;
  @ApiProperty() expiresIn!: number;
  @ApiProperty() tokenType!: string;
  @ApiProperty({ required: false }) mfaRequired?: boolean;
  @ApiProperty({ required: false }) tempToken?: string;
  @ApiProperty({ required: false }) user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    actorId?: string;
  };
}
