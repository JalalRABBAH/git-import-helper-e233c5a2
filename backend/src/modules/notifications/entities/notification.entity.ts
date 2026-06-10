import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notifications')
export class Notification {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id!: string;
  @ApiProperty() @Column({ type: 'uuid', name: 'user_id' }) userId!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 16, name: 'channel_type' }) channelType!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 16, name: 'notif_status', default: 'PENDING' }) status!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 255 }) subject!: string;
  @ApiProperty() @Column({ type: 'text' }) body!: string;
  @ApiProperty() @Column({ type: 'varchar', length: 64, nullable: true, name: 'template_name' }) templateName?: string;
  @ApiProperty() @Column({ type: 'jsonb', default: {}, name: 'template_data' }) templateData!: Record<string, any>;
  @ApiProperty() @Column({ type: 'varchar', length: 16, default: 'NORMAL', name: 'priority_level' }) priority!: string;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'sent_at' }) sentAt?: Date;
  @ApiProperty() @Column({ type: 'timestamptz', nullable: true, name: 'read_at' }) readAt?: Date;
  @ApiProperty() @Column({ type: 'varchar', length: 255, nullable: true, name: 'error_message' }) errorMessage?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
