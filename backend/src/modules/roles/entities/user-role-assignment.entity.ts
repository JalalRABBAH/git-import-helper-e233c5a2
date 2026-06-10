import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { Role } from './role.entity';

@Entity('user_role_assignments')
export class UserRoleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, user => user.roleAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId!: string;

  @ManyToOne(() => Role, role => role.userAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ type: 'uuid', nullable: true, name: 'actor_id' })
  actorId?: string;

  @Column({ type: 'uuid', nullable: true, name: 'assigned_by' })
  assignedBy?: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt?: Date;

  @Column({ type: 'boolean', default: false, name: 'is_primary_role' })
  isPrimaryRole!: boolean;
}
