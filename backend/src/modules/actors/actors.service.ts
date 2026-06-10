import {
  Injectable, NotFoundException, ConflictException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Actor, ActorDocument, Warehouse } from './entities/actor.entity';
import { CreateActorDto, CreateWarehouseDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { ActorFilterParams } from '@shared/types/pagination-params.type';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';

@Injectable()
export class ActorsService {
  private readonly logger = new Logger(ActorsService.name);

  constructor(
    @InjectRepository(Actor) private actorRepo: Repository<Actor>,
    @InjectRepository(ActorDocument) private docRepo: Repository<ActorDocument>,
    @InjectRepository(Warehouse) private whRepo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateActorDto): Promise<Actor> {
    const existing = await this.actorRepo.findOne({ where: { nif: dto.nif } });
    if (existing) throw new ConflictException(`NIF ${dto.nif} déjà utilisé`);

    const actor = this.actorRepo.create(dto);
    const saved = await this.actorRepo.save(actor);
    this.logger.log(`Actor created: ${saved.companyName} (${saved.nif})`);
    return this.findOne(saved.id);
  }

  async findAll(params: ActorFilterParams): Promise<any> {
    const { page, limit, offset } = getPaginationOptions(params.page, params.limit);
    const where: any = {};

    if (params.status) where.status = params.status;
    if (params.actorType) where.actorTypeId = params.actorType;
    if (params.region) where.region = ILike(`%${params.region}%`);
    if (params.search) {
      where.companyName = ILike(`%${params.search}%`);
    }

    const [data, total] = await this.actorRepo.findAndCount({
      where,
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['warehouses'],
    });
    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<Actor> {
    const actor = await this.actorRepo.findOne({
      where: { id },
      relations: ['warehouses', 'documents'],
    });
    if (!actor) throw new NotFoundException(`Acteur ${id} non trouvé`);
    return actor;
  }

  async findByNif(nif: string): Promise<Actor | null> {
    return this.actorRepo.findOne({ where: { nif } });
  }

  async update(id: string, dto: UpdateActorDto): Promise<Actor> {
    const actor = await this.findOne(id);
    Object.assign(actor, dto);
    return this.actorRepo.save(actor);
  }

  async remove(id: string): Promise<void> {
    const actor = await this.findOne(id);
    await this.actorRepo.softDelete(actor.id);
  }

  // ─── Documents ────────────────────────────────────────
  async addDocument(actorId: string, docData: Partial<ActorDocument>): Promise<ActorDocument> {
    await this.findOne(actorId);
    const doc = this.docRepo.create({ ...docData, actorId });
    return this.docRepo.save(doc);
  }

  async findDocuments(actorId: string): Promise<ActorDocument[]> {
    return this.docRepo.find({ where: { actorId }, order: { createdAt: 'DESC' } });
  }

  // ─── Warehouses ───────────────────────────────────────
  async createWarehouse(actorId: string, dto: CreateWarehouseDto): Promise<Warehouse> {
    await this.findOne(actorId);
    const wh = this.whRepo.create({ ...dto, actorId });
    return this.whRepo.save(wh);
  }

  async findWarehouses(actorId: string): Promise<Warehouse[]> {
    return this.whRepo.find({ where: { actorId, isActive: true } });
  }

  // ─── Alerts ───────────────────────────────────────────
  async findExpiringAgreements(days: number = 30): Promise<Actor[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    return this.actorRepo.createQueryBuilder('actor')
      .where('actor.agreement_expires_at <= :threshold', { threshold })
      .andWhere('actor.agreement_expires_at > NOW()')
      .andWhere('actor.status = :status', { status: 'ACTIVE' })
      .getMany();
  }
}
