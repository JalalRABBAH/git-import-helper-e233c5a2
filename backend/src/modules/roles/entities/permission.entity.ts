import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 64 })
  resource!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 32 })
  action!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  condition?: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => RolePermission, rp => rp.permission)
  rolePermissions!: RolePermission[];
}
