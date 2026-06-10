import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, InventoryCount } from './entities/stock.entity';
import { CreateStockMovementDto, CreateInventoryDto } from './dto/create-stock-movement.dto';
import { StockMovementFilterParams } from '@shared/types/pagination-params.type';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';
import { MovementType, VehicleStatus } from '@shared/enums';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    @InjectRepository(StockMovement) private movementRepo: Repository<StockMovement>,
    @InjectRepository(InventoryCount) private inventoryRepo: Repository<InventoryCount>,
  ) {}

  async createMovement(dto: CreateStockMovementDto): Promise<StockMovement> {
    // Validate: can't sell if not in stock
    if (dto.movementType === MovementType.SALE) {
      const lastStock = await this.getCurrentStockStatus(dto.vehicleId);
      if (lastStock !== VehicleStatus.IN_STOCK && lastStock !== VehicleStatus.RESERVED) {
        throw new BadRequestException('Véhicule non disponible en stock pour la vente');
      }
    }

    const movement = this.movementRepo.create(dto);
    const saved = await this.movementRepo.save(movement);
    this.logger.log(`Stock movement: ${dto.movementType} vehicle=${dto.vehicleId}`);
    return saved;
  }

  async findMovements(params: StockMovementFilterParams): Promise<any> {
    const { page, limit, offset } = getPaginationOptions(params.page, params.limit);
    const where: any = {};
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.actorId) where.actorId = params.actorId;
    if (params.movementType) where.movementType = params.movementType;
    if (params.dateFrom || params.dateTo) {
      where.movementDate = {};
      if (params.dateFrom) where.movementDate.gte = new Date(params.dateFrom);
      if (params.dateTo) where.movementDate.lte = new Date(params.dateTo);
    }
    const [data, total] = await this.movementRepo.findAndCount({
      where, skip: offset, take: limit, order: { movementDate: 'DESC' },
    });
    return createPaginatedResult(data, total, page, limit);
  }

  async createInventory(dto: CreateInventoryDto): Promise<InventoryCount> {
    const inventory = this.inventoryRepo.create({ ...dto, status: 'PLANNED' as any });
    return this.inventoryRepo.save(inventory);
  }

  async findInventories(warehouseId?: string, status?: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;
    const [data, total] = await this.inventoryRepo.findAndCount({
      where, skip: offset, take: l, order: { plannedDate: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async getStockSummary(actorId: string, warehouseId?: string): Promise<any> {
    const qb = this.movementRepo.createQueryBuilder('sm')
      .select('sm.movement_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('sm.actor_id = :actorId', { actorId })
      .groupBy('sm.movement_type');

    if (warehouseId) {
      qb.andWhere('sm.warehouse_id = :warehouseId', { warehouseId });
    }

    return qb.getRawMany();
  }

  private async getCurrentStockStatus(vehicleId: string): Promise<string | null> {
    const lastMovement = await this.movementRepo.findOne({
      where: { vehicleId },
      order: { movementDate: 'DESC' },
    });
    return lastMovement?.movementType || null;
  }
}
