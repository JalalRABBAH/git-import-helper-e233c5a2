import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ComplianceRuleType, ComplianceSeverity, ComplianceStatus } from '@shared/enums/compliance.enum';

@Entity('compliance_rules')
export class ComplianceRule {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 128 }) name!: string;
  @ApiProperty() @Column({ type: 'text' }) description!: string;
  @ApiProperty({ enum: ComplianceRuleType })
  @Column({ type: 'enum', enum: ComplianceRuleType, name: 'rule_type' })
  ruleType!: ComplianceRuleType;
  @ApiProperty({ enum: ComplianceSeverity })
  @Column({ type: 'enum', enum: ComplianceSeverity, default: ComplianceSeverity.WARNING })
  severity!: ComplianceSeverity;
  @ApiProperty() @Column({ type: 'jsonb', name: 'rule_config' }) ruleConfig!: Record<string, any>;
  @ApiProperty() @Column({ type: 'boolean', default: true, name: 'is_active' }) isActive!: boolean;
  @ApiProperty() @Column({ type: 'varchar', length: 255, nullable: true, name: 'legal_reference' }) legalReference?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('compliance_scores')
export class ComplianceScore {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'decimal', precision: 5, scale: 2, default: 100.00 }) score!: number;
  @ApiProperty({ enum: ComplianceStatus })
  @Column({ type: 'enum', enum: ComplianceStatus, default: ComplianceStatus.COMPLIANT })
  status!: ComplianceStatus;
  @ApiProperty() @Column({ type: 'jsonb', default: [] }) violations!: any[];
  @ApiProperty() @Column({ type: 'timestamptz', name: 'calculated_at' }) calculatedAt!: Date;
  @ApiProperty() @Column({ type: 'int', default: 90, name: 'countdown_days' }) countdownDays!: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('compliance_checklists')
export class ComplianceChecklist {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) actorId!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'rule_id' }) ruleId!: string;
  @ApiProperty({ enum: ComplianceStatus })
  @Column({ type: 'enum', enum: ComplianceStatus, default: ComplianceStatus.PENDING_REVIEW })
  status!: ComplianceStatus;
  @ApiProperty() @Column({ type: 'text', nullable: true }) notes?: string;
  @ApiProperty() @Column({ type: 'uuid', nullable: true, name: 'checked_by' }) checkedBy?: string;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'checked_at' }) checkedAt?: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
