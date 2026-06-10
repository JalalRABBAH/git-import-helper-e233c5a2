import {
  Injectable, NotFoundException, ConflictException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRoleAssignment } from './entities/user-role-assignment.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
    @InjectRepository(RolePermission) private rolePermRepo: Repository<RolePermission>,
    @InjectRepository(UserRoleAssignment) private assignmentRepo: Repository<UserRoleAssignment>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Rôle ${dto.name} existe déjà`);

    const role = await this.roleRepo.save(this.roleRepo.create(dto));

    if (dto.permissionIds?.length) {
      const permissions = await this.permRepo.findBy({ id: In(dto.permissionIds) });
      const rolePerms = permissions.map(p => this.rolePermRepo.create({ roleId: role.id, permissionId: p.id }));
      await this.rolePermRepo.save(rolePerms);
    }

    this.logger.log(`Role created: ${role.name}`);
    return this.findOne(role.id);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const [data, total] = await this.roleRepo.findAndCount({
      skip: offset, take: l,
      relations: ['rolePermissions', 'rolePermissions.permission'],
      order: { hierarchyLevel: 'DESC', createdAt: 'DESC' },
    });
    return createPaginatedResult(
      data.map(r => ({ ...r, permissions: r.rolePermissions?.map(rp => rp.permission) })),
      total, p, l,
    );
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
    if (!role) throw new NotFoundException(`Rôle ${id} non trouvé`);
    role.permissions = role.rolePermissions?.map(rp => rp.permission);
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepo.findOne({
      where: { name },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, dto);
    const updated = await this.roleRepo.save(role);

    if (dto.permissionIds) {
      await this.rolePermRepo.delete({ roleId: id });
      const rolePerms = dto.permissionIds.map(pid => this.rolePermRepo.create({ roleId: id, permissionId: pid }));
      await this.rolePermRepo.save(rolePerms);
    }

    return this.findOne(updated.id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    if (role.isSystemRole) throw new ConflictException('Impossible de supprimer un rôle système');
    await this.roleRepo.delete(id);
  }

  // ─── Permissions ──────────────────────────────────────
  async findAllPermissions(): Promise<Permission[]> {
    return this.permRepo.find({ order: { resource: 'ASC', action: 'ASC' } });
  }

  // ─── Role Assignment ──────────────────────────────────
  async assignRole(dto: AssignRoleDto): Promise<UserRoleAssignment> {
    const existing = await this.assignmentRepo.findOne({
      where: { userId: dto.userId, roleId: dto.roleId, actorId: dto.actorId || undefined },
    });
    if (existing) throw new ConflictException('Cet utilisateur a déjà ce rôle');

    const assignment = this.assignmentRepo.create(dto);
    return this.assignmentRepo.save(assignment);
  }

  async revokeRole(assignmentId: string): Promise<void> {
    await this.assignmentRepo.delete(assignmentId);
  }
}
