import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum OauthProvider {
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
}

export class OauthCallbackDto {
  @ApiProperty({ enum: OauthProvider })
  @IsEnum(OauthProvider)
  provider!: OauthProvider;

  @ApiProperty({ description: 'Code d\'autorisation OAuth2' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ required: false, description: 'URI de redirection' })
  @IsOptional()
  @IsString()
  redirectUri?: string;
}
