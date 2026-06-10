import {
  Injectable, NotFoundException, ConflictException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Client, VehicleOwnership } from './entities/client.entity';
import { CreateClientDto, LinkVehicleDto } from './dto/create-client.dto';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(VehicleOwnership) private ownershipRepo: Repository<VehicleOwnership>,
  ) {}

  async create(dto: CreateClientDto): Promise<Client> {
    const existing = await this.clientRepo.findOne({
      where: { idDocumentNumber: dto.idDocumentNumber },
    });
    if (existing) throw new ConflictException('Numéro de document déjà enregistré');

    const client = this.clientRepo.create({
      ...dto,
      fullName: `${dto.lastName} ${dto.firstName}`,
    });
    const saved = await this.clientRepo.save(client);
    this.logger.log(`Client created: ${saved.fullName}`);
    return saved;
  }

  async findAll(page: number = 1, limit: number = 20, search?: string, status?: string): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (search) {
      where.fullName = ILike(`%${search}%`);
    }
    if (status) where.status = status;
    const [data, total] = await this.clientRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} non trouvé`);
    return client;
  }

  async findByDocument(idDocumentNumber: string): Promise<Client | null> {
    return this.clientRepo.findOne({ where: { idDocumentNumber } });
  }

  async update(id: string, dto: Partial<CreateClientDto>): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, dto);
    if (dto.firstName || dto.lastName) {
      client.fullName = `${client.lastName} ${client.firstName}`;
    }
    return this.clientRepo.save(client);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.clientRepo.softDelete(id);
  }

  // ─── Vehicle Linking ──────────────────────────────────
  async linkVehicle(dto: LinkVehicleDto): Promise<VehicleOwnership> {
    // End previous ownership
    await this.ownershipRepo.update(
      { vehicleId: dto.vehicleId, isCurrent: true },
      { isCurrent: false, ownershipEndedAt: new Date() },
    );

    const ownership = this.ownershipRepo.create({
      ...dto,
      isCurrent: true,
      certificateNumber: `CERT-${Date.now()}`,
    });
    return this.ownershipRepo.save(ownership);
  }

  async getOwnershipHistory(vehicleId: string): Promise<VehicleOwnership[]> {
    return this.ownershipRepo.find({
      where: { vehicleId },
      order: { ownershipStartedAt: 'DESC' },
    });
  }

  async getClientVehicles(clientId: string): Promise<VehicleOwnership[]> {
    return this.ownershipRepo.find({
      where: { clientId, isCurrent: true },
    });
  }
}
