import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PurchasePrice, PricingHistory } from './entities/pricing.entity';
import { CreatePurchasePriceDto, RecordPriceChangeDto } from './dto/create-pricing.dto';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);
  private readonly MARGIN_ALERT_THRESHOLD = 20; // 20%

  constructor(
    @InjectRepository(PurchasePrice) private priceRepo: Repository<PurchasePrice>,
    @InjectRepository(PricingHistory) private historyRepo: Repository<PricingHistory>,
  ) {}

  async createPurchasePrice(dto: CreatePurchasePriceDto): Promise<PurchasePrice> {
    const price = this.priceRepo.create(dto);
    const saved = await this.priceRepo.save(price);
    this.logger.log(`Purchase price: ${saved.unitPriceXof} XOF`);
    return saved;
  }

  async findPurchasePrices(actorId: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const [data, total] = await this.priceRepo.findAndCount({
      where: { actorId }, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async recordPriceChange(dto: RecordPriceChangeDto): Promise<PricingHistory> {
    const margin = dto.marginPercent ?? this.calculateMargin(dto.oldPrice, dto.newPrice);
    const isAlert = margin > this.MARGIN_ALERT_THRESHOLD;

    const history = this.historyRepo.create({
      ...dto,
      marginPercent: margin,
      isAlert,
    });

    const saved = await this.historyRepo.save(history);

    if (isAlert) {
      this.logger.warn(`MARGIN ALERT: ${margin}% - Actor ${dto.actorId}, Vehicle ${dto.vehicleId}`);
    }

    return saved;
  }

  async findPriceHistory(actorId?: string, vehicleId?: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (actorId) where.actorId = actorId;
    if (vehicleId) where.vehicleId = vehicleId;
    const [data, total] = await this.historyRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async getMarginAlerts(threshold: number = 20): Promise<PricingHistory[]> {
    return this.historyRepo.find({
      where: { isAlert: true, marginPercent: Between(threshold, 999) },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // ─── OHADA Export ─────────────────────────────────────
  async generateOhadaExport(actorId: string, dateFrom: Date, dateTo: Date): Promise<any> {
    const prices = await this.priceRepo.find({
      where: { actorId, createdAt: Between(dateFrom, dateTo), isActive: true },
    });

    return {
      format: 'OHADA/SYSCOHADA',
      period: { from: dateFrom, to: dateTo },
      entries: prices.map(p => ({
        date: p.effectiveDate,
        reference: p.id,
        description: `Achat ${p.manufacturer} ${p.model}`,
        amountDebit: p.totalLandedCost,
        amountCredit: 0,
        accountCode: '601', // Achat marchandises OHADA
        currency: p.foreignCurrencyCode,
        exchangeRate: p.exchangeRate,
      })),
      totalAmount: prices.reduce((sum, p) => sum + +p.totalLandedCost, 0),
    };
  }

  private calculateMargin(oldPrice: number, newPrice: number): number {
    if (oldPrice === 0) return 0;
    return +(((newPrice - oldPrice) / oldPrice) * 100).toFixed(2);
  }
}
