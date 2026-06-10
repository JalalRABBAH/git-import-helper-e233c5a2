import {
  Injectable, NotFoundException, ConflictException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationParams } from '@shared/types/pagination-params.type';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Un utilisateur avec cet email existe déjà');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      ...dto,
      email: dto.email.toLowerCase(),
      passwordHash,
    });

    const saved = await this.userRepo.save(user);
    this.logger.log(`User created: ${saved.email}`);
    return saved;
  }

  async findAll(params: PaginationParams): Promise<any> {
    const { page, limit, offset } = getPaginationOptions(params.page, params.limit);
    const [data, total] = await this.userRepo.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'locale', 'isActive', 'lastLoginAt', 'createdAt'],
    });
    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roleAssignments', 'roleAssignments.role'],
    });
    if (!user) throw new NotFoundException(`Utilisateur ${id} non trouvé`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: ['roleAssignments', 'roleAssignments.role'],
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.password) {
      (dto as any).passwordHash = await bcrypt.hash(dto.password, 12);
      delete (dto as any).password;
    }
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.softDelete(user.id);
  }
}
