import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsInt, IsDecimal } from 'class-validator';
import { FuelType, Transmission, VehicleStatus } from '@shared/enums/vehicle.enum';

export class CreateVehicleDto {
  @ApiProperty({ example: 'JH2RC4407MM000001' }) @IsString() @IsNotEmpty() vin!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chassisNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() engineNumber?: string;
  @ApiProperty({ example: 'Yamaha' }) @IsString() @IsNotEmpty() manufacturer!: string;
  @ApiProperty({ example: 'YZF-R15' }) @IsString() @IsNotEmpty() model!: string;
  @ApiProperty({ example: 2024 }) @IsInt() modelYear!: number;
  @ApiProperty() @IsUUID() categoryId!: string;
  @ApiProperty({ enum: FuelType }) @IsEnum(FuelType) fuelType!: FuelType;
  @ApiPropertyOptional({ enum: Transmission }) @IsOptional() @IsEnum(Transmission) transmission?: Transmission;
  @ApiPropertyOptional() @IsOptional() @IsInt() cylinderCapacityCc?: number;
  @ApiPropertyOptional() @IsOptional() powerKw?: number;
  @ApiPropertyOptional() @IsOptional() weightKg?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional({ enum: VehicleStatus }) @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() currentOwnerActorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() currentWarehouseId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() importCountryCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() importDeclarationNumber?: string;
  @ApiPropertyOptional() @IsOptional() importDate?: Date;
  @ApiPropertyOptional() @IsOptional() customsValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() homologationNumber?: string;
  @ApiPropertyOptional() @IsOptional() homologationValidUntil?: Date;
}

export class CreateBlacklistEntryDto {
  @ApiProperty() @IsUUID() vehicleId!: string;
  @ApiProperty() @IsString() vin!: string;
  @ApiProperty() @IsString() reason!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reasonDetails?: string;
  @ApiProperty() @IsString() source!: string;
}
