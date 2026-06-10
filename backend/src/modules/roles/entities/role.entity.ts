import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleAssignment } from './user-role-assignment.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 64, unique: true })
  name!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 64 })
  label!: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0, name: 'hierarchy_level' })
  hierarchyLevel!: number;

  @Column({ type: 'boolean', default: false, name: 'is_system_role' })
  isSystemRole!: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => UserRoleAssignment, ura => ura.role)
  userAssignments!: UserRoleAssignment[];

  @OneToMany(() => RolePermission, rp => rp.role)
  rolePermissions!: RolePermission[];

  @ApiProperty({ type: [String], required: false })
  permissions?: any[];
}
