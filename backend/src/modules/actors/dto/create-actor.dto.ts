import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUUID, IsEnum, IsNumber, IsObject } from 'class-validator';
import { ActorStatus } from '@shared/enums/actor-type.enum';

export class CreateActorDto {
  @ApiProperty() @IsUUID() actorTypeId!: string;
  @ApiPropertyOptional({ enum: ActorStatus }) @IsOptional() @IsEnum(ActorStatus) status?: ActorStatus;
  @ApiProperty() @IsString() @IsNotEmpty() companyName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tradeName?: string;
  @ApiProperty() @IsString() @IsNotEmpty() nif!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rccm?: string;
  @ApiProperty() @IsString() @IsNotEmpty() legalRepresentativeName!: string;
  @ApiProperty() @IsString() @IsNotEmpty() legalRepresentativePhone!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() legalRepresentativeEmail?: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alternatePhone?: string;
  @ApiProperty() @IsString() @IsNotEmpty() addressLine1!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine2?: string;
  @ApiProperty() @IsString() city!: string;
  @ApiProperty() @IsString() region!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() parentActorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class CreateWarehouseDto {
  @ApiProperty() @IsString() @IsNotEmpty() name!: string;
  @ApiProperty() @IsString() @IsNotEmpty() code!: string;
  @ApiProperty() @IsString() @IsNotEmpty() addressLine1!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine2?: string;
  @ApiProperty() @IsString() city!: string;
  @ApiProperty() @IsString() region!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gpsCoordinates?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() isPrimary?: boolean;
}
