import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleCategory, FuelType, Transmission, VehicleStatus } from '@shared/enums/vehicle.enum';
import { ComplianceStatus } from '@shared/enums/compliance.enum';

@Entity('vehicle_categories')
export class VehicleCategoryEntity {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty({ enum: VehicleCategory })
  @Column({ type: 'enum', enum: VehicleCategory, unique: true })
  code!: VehicleCategory;
  @ApiProperty() @Column({ type: 'varchar', length: 128 }) label!: string;
  @ApiProperty() @Column({ type: 'text', nullable: true }) description?: string;
  @ApiProperty() @Column({ type: 'int', nullable: true, name: 'cylinder_min_cc' }) cylinderMinCc?: number;
  @ApiProperty() @Column({ type: 'int', nullable: true, name: 'cylinder_max_cc' }) cylinderMaxCc?: number;
  @ApiProperty() @Column({ type: 'boolean', default: true, name: 'is_import_allowed' }) isImportAllowed!: boolean;
  @ApiProperty() @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'dus_amount' }) dusAmount?: number;
  @ApiProperty() @Column({ type: 'jsonb', default: [] }) complianceRules!: any[];
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

@Entity('vehicles')
export class Vehicle {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 17, unique: true })
  @Index()
  vin!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 32, nullable: true, name: 'chassis_number' })
  chassisNumber?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 32, nullable: true, name: 'engine_number' })
  engineNumber?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  manufacturer!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @ApiProperty()
  @Column({ type: 'int', name: 'model_year' })
  modelYear!: number;

  @ApiProperty()
  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @ApiProperty({ enum: FuelType })
  @Column({ type: 'enum', enum: FuelType })
  fuelType!: FuelType;

  @ApiProperty({ enum: Transmission })
  @Column({ type: 'enum', enum: Transmission, default: Transmission.MANUELLE })
  transmission!: Transmission;

  @ApiProperty()
  @Column({ type: 'int', nullable: true, name: 'cylinder_capacity_cc' })
  cylinderCapacityCc?: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  powerKw?: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'weight_kg' })
  weightKg?: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @ApiProperty({ enum: VehicleStatus })
  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.IMPORTED })
  status!: VehicleStatus;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true, name: 'current_owner_actor_id' })
  currentOwnerActorId?: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true, name: 'current_warehouse_id' })
  currentWarehouseId?: string;

  @ApiProperty()
  @Column({ type: 'char', length: 2, default: 'CN', name: 'import_country_code' })
  importCountryCode!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'import_declaration_number' })
  importDeclarationNumber?: string;

  @ApiProperty()
  @Column({ type: 'date', nullable: true, name: 'import_date' })
  importDate?: Date;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'customs_value' })
  customsValue?: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  qrCode?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'homologation_number' })
  homologationNumber?: string;

  @ApiProperty()
  @Column({ type: 'date', nullable: true, name: 'homologation_valid_until' })
  homologationValidUntil?: Date;

  @ApiProperty({ enum: ComplianceStatus })
  @Column({ type: 'enum', enum: ComplianceStatus, default: ComplianceStatus.PENDING_REVIEW })
  complianceStatus!: ComplianceStatus;

  @ApiProperty()
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy?: string;
}

@Entity('vehicle_blacklist')
export class VehicleBlacklist {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid', name: 'vehicle_id' }) vehicleId!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 17 }) vin!: string;
  @ApiProperty({ enum: ['STOLEN','FRAUD','COUNTERFEIT','NON_COMPLIANT','ADMIN_SEIZURE','INSURANCE_TOTAL_LOSS'] })
  @Column({ type: 'enum', enum: ['STOLEN','FRAUD','COUNTERFEIT','NON_COMPLIANT','ADMIN_SEIZURE','INSURANCE_TOTAL_LOSS'] })
  reason!: string;
  @ApiProperty() @Column({ type: 'text', nullable: true, name: 'reason_details' }) reasonDetails?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64 }) source!: string;
  @ApiProperty() @Column({ type: 'boolean', default: true, name: 'is_active' }) isActive!: boolean;
  @ApiProperty() @Column({ type: 'jsonb', default: {} }) metadata?: Record<string, any>;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
