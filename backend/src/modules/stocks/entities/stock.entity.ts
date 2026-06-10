import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType, InventoryStatus } from '@shared/enums/stock.enum';

@Entity('stock_movements')
export class StockMovement {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'vehicle_id' }) vehicleId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'uuid', nullable: true, name: 'warehouse_id' }) warehouseId?: string;
  @ApiProperty({ enum: MovementType })
  @Column({ type: 'enum', enum: MovementType })
  movementType!: MovementType;
  @ApiProperty() @Column({ type: 'int', default: 1 }) quantity!: number;
  @ApiProperty() @Column({ type: 'varchar', length: 128, nullable: true, name: 'reference_document' }) referenceDocument?: string;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'unit_cost' }) unitCost?: number;
  @ApiProperty() @Column({ type: 'char', length: 3, default: 'XOF', name: 'currency_code' }) currencyCode!: string;
  @ApiProperty() @Column({ type: 'text', nullable: true }) notes?: string;
  @ApiProperty() @Column({ type: 'uuid', nullable: true, name: 'performed_by' }) performedBy?: string;
  @ApiProperty() @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'movement_date' }) movementDate!: Date;
  @ApiProperty() @Column({ type: 'jsonb', default: {} }) metadata!: Record<string, any>;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

@Entity('inventory_counts')
export class InventoryCount {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'warehouse_id' }) warehouseId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty({ enum: InventoryStatus })
  @Column({ type: 'enum', enum: InventoryStatus, default: InventoryStatus.PLANNED })
  status!: InventoryStatus;
  @ApiProperty() @Column({ type: 'date', name: 'planned_date' }) plannedDate!: Date;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'started_at' }) startedAt?: Date;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'completed_at' }) completedAt?: Date;
  @ApiProperty() @Column({ type: 'int', default: 0, name: 'total_units_expected' }) totalUnitsExpected!: number;
  @ApiProperty() @Column({ type: 'int', default: 0, name: 'total_units_counted' }) totalUnitsCounted!: number;
  @ApiProperty() @Column({ type: 'int', name: 'discrepancy_units' }) discrepancyUnits!: number;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'discrepancy_value' }) discrepancyValue?: number;
  @ApiProperty() @Column({ type: 'text', nullable: true }) notes?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
