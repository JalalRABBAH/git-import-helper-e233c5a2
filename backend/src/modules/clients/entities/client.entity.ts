import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IdDocumentType, ClientStatus } from '@shared/enums/client.enum';

@Entity('clients')
export class Client {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, name: 'first_name' }) firstName!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, name: 'last_name' }) lastName!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 201, name: 'full_name' }) fullName!: string;
  @ApiProperty({ enum: IdDocumentType })
  @Column({ type: 'enum', enum: IdDocumentType, name: 'id_document_type' })
  idDocumentType!: IdDocumentType;
  @ApiProperty() @Column({ type: 'varchar', length: 50, name: 'id_document_number' }) @Index() idDocumentNumber!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 20 }) @Index() phone!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 255, nullable: true }) email?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 255, nullable: true, name: 'address_line1' }) addressLine1?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) city?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) region?: string;
  @ApiProperty({ enum: ClientStatus })
  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.PENDING_KYC })
  status!: ClientStatus;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'kyc_verified_at' }) kycVerifiedAt?: Date;
  @ApiProperty() @Column({ type: 'varchar', length: 16, default: 'LOW', name: 'kyc_risk_level' }) kycRiskLevel!: string;
  @ApiProperty() @Column({ type: 'boolean', default: false, name: 'biometric_enrolled' }) biometricEnrolled!: boolean;
  @ApiProperty() @Column({ type: 'uuid', name: 'registered_by_actor_id' }) registeredByActorId!: string;
  @ApiProperty() @Column({ type: 'jsonb', default: {} }) metadata!: Record<string, any>;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('vehicle_ownerships')
export class VehicleOwnership {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'vehicle_id' }) vehicleId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'client_id' }) clientId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'uuid', nullable: true, name: 'sale_id' }) saleId?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 32, default: 'SALE', name: 'transfer_type' }) transferType!: string;
  @ApiProperty() @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'ownership_started_at' }) ownershipStartedAt!: Date;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'ownership_ended_at' }) ownershipEndedAt?: Date;
  @ApiProperty() @Column({ type: 'varchar', length: 50, nullable: true, name: 'certificate_number' }) certificateNumber?: string;
  @ApiProperty() @Column({ type: 'boolean', default: true, name: 'is_current' }) isCurrent!: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
