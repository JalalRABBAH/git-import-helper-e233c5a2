import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64, name: 'event_type' }) @Index() eventType!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 16, name: 'actor_type' }) actorType!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'actor_id' }) @Index() actorId!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64, name: 'target_entity' }) targetEntity!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'target_id' }) targetId!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 32 }) action!: string;
  @ApiProperty() @Column({ type: 'jsonb', nullable: true, name: 'old_value' }) oldValue?: Record<string, any>;
  @ApiProperty() @Column({ type: 'jsonb', nullable: true, name: 'new_value' }) newValue?: Record<string, any>;
  @ApiProperty() @Column({ type: 'jsonb', default: {} }) metadata!: Record<string, any>;
  @ApiProperty() @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' }) ipAddress?: string;
  @ApiProperty() @Column({ type: 'text', nullable: true, name: 'user_agent' }) userAgent?: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64, name: 'hash_sha256' }) hash!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64, name: 'previous_hash', nullable: true }) previousHash?: string;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
