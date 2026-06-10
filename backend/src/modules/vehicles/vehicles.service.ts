import {
  Injectable, NotFoundException, ConflictException, Logger, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Vehicle, VehicleBlacklist, VehicleCategoryEntity } from './entities/vehicle.entity';
import { CreateVehicleDto, CreateBlacklistEntryDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterParams } from '@shared/types/pagination-params.type';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';
import { VehicleCategory } from '@shared/enums/vehicle.enum';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehicleBlacklist) private blacklistRepo: Repository<VehicleBlacklist>,
    @InjectRepository(VehicleCategoryEntity) private categoryRepo: Repository<VehicleCategoryEntity>,
  ) {}

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const existing = await this.vehicleRepo.findOne({ where: { vin: dto.vin } });
    if (existing) throw new ConflictException(`VIN ${dto.vin} déjà enregistré`);

    // Check category is allowed
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (category?.code === VehicleCategory.INTERDITE) {
      throw new BadRequestException('Catégorie INTERDITE - importation non autorisée');
    }

    const vehicle = this.vehicleRepo.create(dto);
    const saved = await this.vehicleRepo.save(vehicle);
    this.logger.log(`Vehicle created: VIN=${saved.vin}`);
    return this.findOne(saved.id);
  }

  async findAll(params: VehicleFilterParams): Promise<any> {
    const { page, limit, offset } = getPaginationOptions(params.page, params.limit);
    const where: any = {};

    if (params.vin) where.vin = ILike(`%${params.vin}%`);
    if (params.status) where.status = params.status;
    if (params.category) where.categoryId = params.category;
    if (params.manufacturer) where.manufacturer = ILike(`%${params.manufacturer}%`);
    if (params.actorId) where.currentOwnerActorId = params.actorId;

    const [data, total] = await this.vehicleRepo.findAndCount({
      where, skip: offset, take: limit,
      order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<Vehicle> {
    const v = await this.vehicleRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException(`Véhicule ${id} non trouvé`);
    return v;
  }

  async findByVin(vin: string): Promise<Vehicle> {
    const v = await this.vehicleRepo.findOne({ where: { vin } });
    if (!v) throw new NotFoundException(`VIN ${vin} non trouvé`);
    return v;
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, dto);
    return this.vehicleRepo.save(vehicle);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.vehicleRepo.delete(id);
  }

  // ─── QR Code ──────────────────────────────────────────
  async generateQrCode(id: string): Promise<{ qrCode: string; generatedAt: Date }> {
    const vehicle = await this.findOne(id);
    const qrData = JSON.stringify({
      v: '1.0', // version
      vin: vehicle.vin,
      cat: vehicle.categoryId,
      mfr: vehicle.manufacturer,
      mdl: vehicle.model,
      status: vehicle.status,
      compliance: vehicle.complianceStatus,
    });
    await this.vehicleRepo.update(id, { qrCode: qrData });
    return { qrCode: qrData, generatedAt: new Date() };
  }

  // ─── Blacklist ────────────────────────────────────────
  async addToBlacklist(dto: CreateBlacklistEntryDto): Promise<VehicleBlacklist> {
    const entry = this.blacklistRepo.create(dto);
    await this.vehicleRepo.update(dto.vehicleId, { status: 'STOLEN' as any });
    return this.blacklistRepo.save(entry);
  }

  async findBlacklist(reason?: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = { isActive: true };
    if (reason) where.reason = reason;
    const [data, total] = await this.blacklistRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  // ─── Categories ───────────────────────────────────────
  async findCategories(): Promise<VehicleCategoryEntity[]> {
    return this.categoryRepo.find({ order: { createdAt: 'ASC' } });
  }
}
