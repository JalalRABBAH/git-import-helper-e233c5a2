import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { Sale, Invoice } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Vehicle, VehicleBlacklist } from '@modules/vehicles/entities/vehicle.entity';
import { VehicleStatus } from '@shared/enums/vehicle.enum';
import { Client } from '@modules/clients/entities/client.entity';
import { ClientStatus } from '@shared/enums/client.enum';
import { StockMovement } from '@modules/stocks/entities/stock.entity';
import { MovementType } from '@shared/enums/stock.enum';
import { AuditService } from '@modules/audit/audit.service';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';
import { DateUtil } from '@common/utils/date.util';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehicleBlacklist) private blacklistRepo: Repository<VehicleBlacklist>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(StockMovement) private stockMovementRepo: Repository<StockMovement>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateSaleDto): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify vehicle exists and is in stock
      const vehicle = await this.vehicleRepo.findOne({
        where: { id: dto.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException(`Véhicule ${dto.vehicleId} non trouvé`);
      }
      if (vehicle.status !== VehicleStatus.IN_STOCK) {
        throw new BadRequestException(
          `Le véhicule n'est pas disponible en stock (statut actuel: ${vehicle.status})`,
        );
      }

      // 2. Verify model is NOT in blacklist
      const blacklistEntry = await this.blacklistRepo.findOne({
        where: { vin: vehicle.vin, isActive: true },
      });
      if (blacklistEntry) {
        throw new ForbiddenException(
          `Ce véhicule est interdit à la vente (raison: ${blacklistEntry.reason})`,
        );
      }

      // 3. Verify client has complete KYC
      const client = await this.clientRepo.findOne({
        where: { id: dto.clientId },
      });
      if (!client) {
        throw new NotFoundException(`Client ${dto.clientId} non trouvé`);
      }
      if (client.status !== ClientStatus.KYC_VERIFIED) {
        throw new ForbiddenException(
          `Le client n'a pas complété son KYC (statut: ${client.status})`,
        );
      }

      // 4. Create sale
      const sale = this.saleRepo.create({
        ...dto,
        status: 'PAID',
      });
      const saved = await queryRunner.manager.save(sale);

      // 5. Decrement stock: update vehicle status to SOLD
      const oldVehicleStatus = vehicle.status;
      vehicle.status = VehicleStatus.SOLD;
      await queryRunner.manager.save(vehicle);

      // 6. Create stock movement record
      const stockMovement = this.stockMovementRepo.create({
        vehicleId: vehicle.id,
        actorId: dto.actorId,
        movementType: MovementType.SALE,
        quantity: -1,
        referenceDocument: `SALE-${saved.id}`,
        unitCost: dto.salePrice,
        notes: `Vente au client ${dto.clientId}`,
        performedBy: dto.sellerUserId,
      });
      await queryRunner.manager.save(stockMovement);

      // 7. Generate invoice
      const invoice = this.invoiceRepo.create({
        saleId: saved.id,
        invoiceNumber: `FAC-${Date.now()}-${saved.id.slice(0, 8)}`,
        issueDate: new Date(),
        dueDate: DateUtil.addDays(new Date(), 30),
        status: 'ISSUED',
        subtotal: saved.salePrice,
        taxTotal: saved.taxAmount,
        total: saved.totalAmount,
        taxBreakdown: {
          tva: { rate: 0.18, amount: saved.taxAmount },
          ohada: { rate: 0.02, amount: +(saved.salePrice * 0.02).toFixed(2) },
        },
      });
      await queryRunner.manager.save(invoice);

      // 8. Create audit log
      await this.auditService.log({
        eventType: 'SALE_COMPLETED',
        actorType: 'USER',
        actorId: dto.sellerUserId,
        targetEntity: 'Sale',
        targetId: saved.id,
        action: 'CREATE_SALE',
        oldValue: { vehicleStatus: oldVehicleStatus },
        newValue: {
          saleId: saved.id,
          vehicleId: dto.vehicleId,
          clientId: dto.clientId,
          salePrice: dto.salePrice,
          vehicleStatus: VehicleStatus.SOLD,
        },
      });

      await queryRunner.commitTransaction();

      this.logger.log(
        `Sale completed: ${saved.id} - Vehicle ${dto.vehicleId} sold to client ${dto.clientId} - ${saved.totalAmount} XOF`,
      );

      return this.findOne(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page: number = 1, limit: number = 20, actorId?: string, dateFrom?: string, dateTo?: string): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (actorId) where.actorId = actorId;
    if (dateFrom || dateTo) {
      where.createdAt = Between(
        dateFrom ? new Date(dateFrom) : new Date('2000-01-01'),
        dateTo ? new Date(dateTo) : new Date(),
      );
    }
    const [data, total] = await this.saleRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepo.findOne({
      where: { id },
      relations: ['invoices'],
    });
    if (!sale) throw new NotFoundException(`Vente ${id} non trouvée`);
    return sale;
  }

  async cancel(id: string, reason: string): Promise<Sale> {
    const sale = await this.findOne(id);
    if (sale.status === 'CANCELLED') throw new BadRequestException('Vente déjà annulée');

    sale.status = 'CANCELLED' as any;
    (sale.metadata as any).cancellationReason = reason;
    (sale.metadata as any).cancelledAt = new Date().toISOString();
    return this.saleRepo.save(sale);
  }

  async getSaleHistory(vehicleId?: string, clientId?: string): Promise<Sale[]> {
    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (clientId) where.clientId = clientId;
    return this.saleRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  // ─── Invoices ─────────────────────────────────────────
  async generateInvoice(sale: Sale): Promise<Invoice> {
    const invoiceNumber = `FAC-${Date.now()}-${sale.id.slice(0, 8)}`;
    const invoice = this.invoiceRepo.create({
      saleId: sale.id,
      invoiceNumber,
      issueDate: new Date(),
      dueDate: DateUtil.addDays(new Date(), 30),
      status: 'ISSUED',
      subtotal: sale.salePrice,
      taxTotal: sale.taxAmount,
      total: sale.totalAmount,
      taxBreakdown: {
        tva: { rate: 0.18, amount: sale.taxAmount },
        ohada: { rate: 0.02, amount: +(sale.salePrice * 0.02).toFixed(2) },
      },
    });
    return this.invoiceRepo.save(invoice);
  }

  async findInvoices(page: number = 1, limit: number = 20, saleId?: string): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (saleId) where.saleId = saleId;
    const [data, total] = await this.invoiceRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }
}
