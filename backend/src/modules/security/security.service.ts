import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { FraudAlert, SecurityBlacklist, SeizedVehicle } from './entities/security.entity';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(FraudAlert) private alertRepo: Repository<FraudAlert>,
    @InjectRepository(SecurityBlacklist) private blacklistRepo: Repository<SecurityBlacklist>,
    @InjectRepository(SeizedVehicle) private seizedRepo: Repository<SeizedVehicle>,
  ) {}

  // ─── Fraud Alerts ─────────────────────────────────────
  async createAlert(alertData: Partial<FraudAlert>): Promise<FraudAlert> {
    const alert = this.alertRepo.create(alertData);
    const saved = await this.alertRepo.save(alert);
    if (saved.severityLevel === 'HIGH' || saved.severityLevel === 'CRITICAL') {
      this.logger.warn(`FRAUD ALERT [${saved.severityLevel}]: ${saved.alertType} - Actor ${saved.actorId}`);
    }
    return saved;
  }

  async findAlerts(severity?: string, status?: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (severity) where.severityLevel = severity;
    if (status) where.alertStatus = status;
    const [data, total] = await this.alertRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async updateAlertStatus(id: string, status: string, resolution?: string): Promise<FraudAlert> {
    const alert = await this.alertRepo.findOne({ where: { id } });
    if (!alert) throw new NotFoundException('Alerte non trouvée');
    alert.alertStatus = status;
    if (status === 'RESOLVED') alert.resolvedAt = new Date();
    if (resolution) (alert.evidence as any).resolution = resolution;
    return this.alertRepo.save(alert);
  }

  async reportToCnti(id: string): Promise<void> {
    const alert = await this.alertRepo.findOne({ where: { id } });
    if (!alert) throw new NotFoundException('Alerte non trouvée');
    alert.cntiNotified = true;
    await this.alertRepo.save(alert);
    this.logger.log(`CNTI notified: alert ${id}`);
  }

  // ─── Blacklist ────────────────────────────────────────
  async addToBlacklist(data: Partial<SecurityBlacklist>): Promise<SecurityBlacklist> {
    const entry = this.blacklistRepo.create(data);
    return this.blacklistRepo.save(entry);
  }

  async findBlacklist(page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const [data, total] = await this.blacklistRepo.findAndCount({
      where: { isActive: true },
      skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  // ─── Seized Vehicles ──────────────────────────────────
  async seizeVehicle(data: Partial<SeizedVehicle>): Promise<SeizedVehicle> {
    const seizure = this.seizedRepo.create(data);
    return this.seizedRepo.save(seizure);
  }

  async findSeizedVehicles(status?: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (status) where.currentStatus = status;
    const [data, total] = await this.seizedRepo.findAndCount({
      where, skip: offset, take: l, order: { seizureDate: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async releaseVehicle(id: string, notes?: string): Promise<SeizedVehicle> {
    const seized = await this.seizedRepo.findOne({ where: { id } });
    if (!seized) throw new NotFoundException('Saisie non trouvée');
    seized.currentStatus = 'RELEASED';
    seized.releasedAt = new Date();
    seized.releaseNotes = notes;
    return this.seizedRepo.save(seized);
  }

  // ─── Detection ────────────────────────────────────────
  async analyzeTransaction(saleData: any): Promise<{ suspicious: boolean; alerts: any[] }> {
    const alerts: any[] = [];

    // Price anomaly
    if (saleData.salePrice < saleData.marketPrice * 0.5) {
      alerts.push({ type: 'PRICE_ANOMALY', severity: 'HIGH', message: 'Prix anormalement bas' });
    }

    // Volume anomaly
    if (saleData.dailySales > 50) {
      alerts.push({ type: 'VOLUME_ANOMALY', severity: 'MEDIUM', message: 'Volume de ventes élevé' });
    }

    // Circular trade
    if (saleData.buyer === saleData.sellerPrevious) {
      alerts.push({ type: 'CIRCULAR_TRADE', severity: 'CRITICAL', message: 'Commerce circulaire détecté' });
    }

    return { suspicious: alerts.length > 0, alerts };
  }
}
