import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('fraud_alerts')
export class FraudAlert {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'uuid', nullable: true, name: 'vehicle_id' }) vehicleId?: string;
  @ApiProperty() @Column({ type: 'uuid', nullable: true, name: 'sale_id' }) saleId?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 16, name: 'severity_level' }) severityLevel!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 32, name: 'alert_type' }) alertType!: string;
  @ApiProperty() @Column({ type: 'text' }) description!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 16, name: 'alert_status', default: 'OPEN' }) alertStatus!: string;
  @ApiProperty() @Column({ type: 'jsonb', default: {} }) evidence!: Record<string, any>;
  @ApiProperty() @Column({ type: 'boolean', default: false, name: 'cnti_notified' }) cntiNotified!: boolean;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'resolved_at' }) resolvedAt?: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('security_blacklist')
export class SecurityBlacklist {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'vehicle_id' }) vehicleId!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 17 }) vin!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, name: 'model_name' }) modelName!: string;
  @ApiProperty() @Column({ type: 'text', name: 'ban_reason' }) banReason!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64 }) source!: string;
  @ApiProperty() @Column({ type: 'boolean', default: true, name: 'is_active' }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

@Entity('seized_vehicles')
export class SeizedVehicle {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'vehicle_id' }) vehicleId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 255, name: 'seizure_reason' }) seizureReason!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 128, name: 'seizure_order_ref' }) seizureOrderRef!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'seized_by_user_id' }) seizedByUserId!: string;
  @ApiProperty() @Column({ type: 'timestamptz', name: 'seizure_date' }) seizureDate!: Date;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'released_at' }) releasedAt?: Date;
  @ApiProperty() @Column({ type: 'text', nullable: true, name: 'release_notes' }) releaseNotes?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 16, name: 'current_status', default: 'SEIZED' }) currentStatus!: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
