import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('purchase_prices')
export class PurchasePrice {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'uuid', nullable: true, name: 'vehicle_category_id' }) vehicleCategoryId?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) manufacturer?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) model?: string;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, name: 'unit_price_foreign' }) unitPriceForeign!: number;
  @ApiProperty() @Column({ type: 'char', length: 3, default: 'EUR', name: 'foreign_currency_code' }) foreignCurrencyCode!: string;
  @ApiProperty() @Column({ type: 'decimal', precision: 18, scale: 8 }) exchangeRate!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, name: 'unit_price_xof' }) unitPriceXof!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'freight_cost' }) freightCost!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'insurance_cost' }) insuranceCost!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'customs_duties' }) customsDuties!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_landed_cost' }) totalLandedCost!: number;
  @ApiProperty() @Column({ type: 'date', name: 'effective_date' }) effectiveDate!: Date;
  @ApiProperty() @Column({ type: 'boolean', default: true, name: 'is_active' }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('pricing_history')
export class PricingHistory {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'vehicle_id' }) vehicleId!: string;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, name: 'old_price' }) oldPrice!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, name: 'new_price' }) newPrice!: number;
  @ApiProperty() @Column({ type: 'varchar', length: 255, name: 'change_reason' }) changeReason!: string;
  @ApiProperty() @Column({ type: 'decimal', precision: 5, scale: 2, name: 'margin_percent' }) marginPercent!: number;
  @ApiProperty() @Column({ type: 'boolean', default: false, name: 'is_alert' }) isAlert!: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
