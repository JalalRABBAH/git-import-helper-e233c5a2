import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum MfaTypeEnum {
  TOTP = 'TOTP',
  SMS = 'SMS',
  BACKUP_CODE = 'BACKUP_CODE',
}

@Entity('mfa_settings')
export class MfaSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: MfaTypeEnum, default: MfaTypeEnum.TOTP })
  mfaType!: MfaTypeEnum;

  @Column({ type: 'boolean', default: false })
  isEnabled!: boolean;

  @Column({ type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secret?: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'verified_at' })
  verifiedAt?: Date;

  @Column({ type: 'jsonb', default: '[]' })
  backupCodes!: string[];

  @Column({ type: 'timestamptz', nullable: true, name: 'last_used_at' })
  lastUsedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
