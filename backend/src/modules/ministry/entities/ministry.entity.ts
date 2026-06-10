import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AgreementStatus } from '@shared/enums/actor-type.enum';

@Entity('agreement_decisions')
export class AgreementDecision {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty({ enum: AgreementStatus })
  @Column({ type: 'enum', enum: AgreementStatus })
  decision!: AgreementStatus;
  @ApiProperty() @Column({ type: 'text', name: 'decision_reason' }) decisionReason!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'decided_by' }) decidedBy!: string;
  @ApiProperty() @Column({ type: 'timestamptz', name: 'decided_at' }) decidedAt!: Date;
  @ApiProperty() @Column({ type: 'date', nullable: true, name: 'valid_until' }) validUntil?: Date;
  @ApiProperty() @Column({ type: 'jsonb', default: {} }) conditions!: Record<string, any>;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

@Entity('regulatory_publications')
export class RegulatoryPublication {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 255 }) title!: string;
  @ApiProperty() @Column({ type: 'text' }) content!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64, name: 'publication_type' }) publicationType!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 128, name: 'legal_reference' }) legalReference!: string;
  @ApiProperty() @Column({ type: 'date', name: 'effective_date' }) effectiveDate!: Date;
  @ApiProperty() @Column({ type: 'uuid', name: 'published_by' }) publishedBy!: string;
  @ApiProperty() @Column({ type: 'boolean', default: true, name: 'is_active' }) isActive!: boolean;
  @CreateDateColumn({ name: 'published_at' }) publishedAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
