import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDecimal, IsOptional, IsString, IsDate, IsBoolean } from 'class-validator';

export class CreatePurchasePriceDto {
  @ApiProperty() @IsUUID() actorId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() vehicleCategoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() manufacturer?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() model?: string;
  @ApiProperty() unitPriceForeign!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() foreignCurrencyCode?: string;
  @ApiProperty() exchangeRate!: number;
  @ApiProperty() freightCost!: number;
  @ApiProperty() insuranceCost!: number;
  @ApiProperty() customsDuties!: number;
  @ApiProperty() totalLandedCost!: number;
}

export class RecordPriceChangeDto {
  @ApiProperty() @IsUUID() actorId!: string;
  @ApiProperty() @IsUUID() vehicleId!: string;
  @ApiProperty() oldPrice!: number;
  @ApiProperty() newPrice!: number;
  @ApiProperty() @IsString() changeReason!: string;
  @ApiPropertyOptional() @IsOptional() marginPercent?: number;
}
