import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ActorStatus, AgreementStatus } from '@shared/enums/actor-type.enum';

@Entity('actors')
export class Actor {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;

  @ApiProperty()
  @Column({ type: 'uuid', name: 'actor_type_id' })
  actorTypeId!: string;

  @ApiProperty({ enum: ActorStatus })
  @Column({ type: 'enum', enum: ActorStatus, default: ActorStatus.PENDING })
  status!: ActorStatus;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, name: 'company_name' })
  companyName!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'trade_name' })
  tradeName?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, unique: true })
  nif!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  rccm?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 200, name: 'legal_representative_name' })
  legalRepresentativeName!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20, name: 'legal_representative_phone' })
  legalRepresentativePhone!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, name: 'address_line1' })
  addressLine1!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  region!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'agreement_number' })
  agreementNumber?: string;

  @ApiProperty({ enum: AgreementStatus })
  @Column({ type: 'enum', enum: AgreementStatus, nullable: true, name: 'agreement_status' })
  agreementStatus?: AgreementStatus;

  @ApiProperty()
  @Column({ type: 'timestamptz', nullable: true, name: 'agreement_expires_at' })
  agreementExpiresAt?: Date;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100.00, name: 'compliance_score' })
  complianceScore!: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 3, default: 'XOF', name: 'currency_code' })
  currencyCode!: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true, name: 'parent_actor_id' })
  parentActorId?: string;

  @ApiProperty()
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy?: string;

  @OneToMany(() => ActorDocument, d => d.actor, { cascade: true })
  documents?: ActorDocument[];

  @OneToMany(() => Warehouse, w => w.actor, { cascade: true })
  warehouses?: Warehouse[];
}

@Entity('actor_documents')
export class ActorDocument {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ManyToOne(() => Actor, a => a.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' }) actor!: Actor;
  @ApiProperty() @Column({ type: 'varchar', length: 64, name: 'document_type' }) documentType!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 128, name: 'document_label' }) documentLabel!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 255, name: 'file_name' }) fileName!: string;
  @ApiProperty() @Column({ type: 'bigint', name: 'file_size_bytes' }) fileSizeBytes!: number;
  @ApiProperty() @Column({ type: 'varchar', length: 100, name: 'mime_type' }) mimeType!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, name: 'storage_path' }) storagePath!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64, name: 'storage_bucket', default: 'ireg-kyc-documents' }) storageBucket!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64, name: 'checksum_sha256' }) checksumSha256!: string;
  @ApiProperty() @Column({ type: 'boolean', default: false, name: 'is_verified' }) isVerified!: boolean;
  @ApiProperty() @Column({ type: 'date', nullable: true, name: 'expiry_date' }) expiryDate?: Date;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

@Entity('warehouses')
export class Warehouse {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ManyToOne(() => Actor, a => a.warehouses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' }) actor!: Actor;
  @ApiProperty() @Column({ type: 'varchar', length: 128 }) name!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 32 }) code!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 255, name: 'address_line1' }) addressLine1!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) city!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) region!: string;
  @ApiProperty() @Column({ type: 'boolean', default: false, name: 'is_primary' }) isPrimary!: boolean;
  @ApiProperty() @Column({ type: 'boolean', default: true, name: 'is_active' }) isActive!: boolean;
  @ApiProperty() @Column({ type: 'jsonb', default: {}, nullable: true }) metadata?: Record<string, any>;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @ApiProperty() @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
