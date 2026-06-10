import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleAssignment } from '@modules/roles/entities/user-role-assignment.entity';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl?: string;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified!: boolean;

  @Column({ type: 'boolean', default: false, name: 'phone_verified' })
  phoneVerified!: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;

  @Column({ type: 'int', default: 0, name: 'failed_login_attempts' })
  failedLoginAttempts!: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'locked_until' })
  lockedUntil?: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'password_changed_at' })
  passwordChangedAt!: Date;

  @ApiProperty()
  @Column({ type: 'varchar', length: 10, default: 'fr_BF' })
  locale!: string;

  @Column({ type: 'varchar', length: 64, default: 'Africa/Ouagadougou' })
  timezone!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => UserRoleAssignment, ura => ura.user)
  roleAssignments!: UserRoleAssignment[];
}
