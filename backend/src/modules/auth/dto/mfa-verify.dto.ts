import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsEnum, IsOptional } from 'class-validator';

export enum MfaType {
  TOTP = 'TOTP',
  SMS = 'SMS',
  BACKUP_CODE = 'BACKUP_CODE',
}

export class MfaSetupDto {
  @ApiProperty({ enum: MfaType, default: MfaType.TOTP })
  @IsEnum(MfaType)
  mfaType!: MfaType;
}

export class MfaVerifyDto {
  @ApiProperty({ description: 'Token temporaire' })
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @ApiProperty({ description: 'Code MFA à 6 chiffres', example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'Le code doit contenir exactement 6 chiffres' })
  mfaCode!: string;

  @ApiProperty({ enum: MfaType, default: MfaType.TOTP, required: false })
  @IsOptional()
  @IsEnum(MfaType)
  mfaType?: MfaType = MfaType.TOTP;
}

export class MfaSetupResponseDto {
  @ApiProperty() secret!: string;
  @ApiProperty() qrCodeUrl!: string;
  @ApiProperty({ type: [String] }) backupCodes!: string[];
}
