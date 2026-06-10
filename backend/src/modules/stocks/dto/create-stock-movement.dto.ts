import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsInt, IsDecimal, IsString } from 'class-validator';
import { MovementType } from '@shared/enums/stock.enum';

export class CreateStockMovementDto {
  @ApiProperty() @IsUUID() vehicleId!: string;
  @ApiProperty() @IsUUID() actorId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() warehouseId?: string;
  @ApiProperty({ enum: MovementType }) @IsEnum(MovementType) movementType!: MovementType;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsInt() quantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceDocument?: string;
  @ApiPropertyOptional() @IsOptional() unitCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateInventoryDto {
  @ApiProperty() @IsUUID() warehouseId!: string;
  @ApiProperty() @IsUUID() actorId!: string;
  @ApiProperty() plannedDate!: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
