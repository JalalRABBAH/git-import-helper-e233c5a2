import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail, IsUUID } from 'class-validator';
import { IdDocumentType } from '@shared/enums/client.enum';

export class CreateClientDto {
  @ApiProperty() @IsString() @IsNotEmpty() firstName!: string;
  @ApiProperty() @IsString() @IsNotEmpty() lastName!: string;
  @ApiProperty({ enum: IdDocumentType }) @IsEnum(IdDocumentType) idDocumentType!: IdDocumentType;
  @ApiProperty() @IsString() @IsNotEmpty() idDocumentNumber!: string;
  @ApiProperty() @IsString() phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() region?: string;
  @ApiProperty() @IsUUID() registeredByActorId!: string;
}

export class LinkVehicleDto {
  @ApiProperty() @IsUUID() vehicleId!: string;
  @ApiProperty() @IsUUID() clientId!: string;
  @ApiProperty() @IsUUID() actorId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() saleId?: string;
}
