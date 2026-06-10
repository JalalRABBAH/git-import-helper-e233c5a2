import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDecimal, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@shared/enums/sale.enum';

export class CreateSaleDto {
  @ApiProperty() @IsUUID() actorId!: string;
  @ApiProperty() @IsUUID() vehicleId!: string;
  @ApiProperty() @IsUUID() clientId!: string;
  @ApiProperty() @IsUUID() sellerUserId!: string;
  @ApiProperty() salePrice!: number;
  @ApiPropertyOptional() @IsOptional() discountAmount?: number;
  @ApiProperty() taxAmount!: number;
  @ApiProperty() totalAmount!: number;
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) paymentMethod!: PaymentMethod;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
