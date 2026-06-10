import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsIn, Matches,
} from 'class-validator';

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_+\-=\[\]{};':"\\|,.<>\/~`()])[A-Za-z\d@$!%*?&^#_+\-=\[\]{};':"\\|,.<>\/~`()]{12,128}$/;
export const PASSWORD_ERROR_MSG =
  'Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un symbole';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @ApiProperty({ example: 'Jean', minLength: 1 })
  @IsString()
  @MinLength(1)
  firstName!: string;

  @ApiProperty({ example: 'Dupont', minLength: 1 })
  @IsString()
  @MinLength(1)
  lastName!: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 12 })
  @IsString()
  @MinLength(12, { message: PASSWORD_ERROR_MSG })
  @MaxLength(128, { message: 'Le mot de passe ne doit pas dépasser 128 caractères' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_ERROR_MSG })
  password!: string;

  @ApiPropertyOptional({ example: '+226 70 00 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'fr_BF' })
  @IsOptional()
  @IsString()
  locale?: string = 'fr_BF';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
