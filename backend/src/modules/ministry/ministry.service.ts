import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgreementDecision, RegulatoryPublication } from './entities/ministry.entity';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';

@Injectable()
export class MinistryService {
  private readonly logger = new Logger(MinistryService.name);

  constructor(
    @InjectRepository(AgreementDecision) private agreementRepo: Repository<AgreementDecision>,
    @InjectRepository(RegulatoryPublication) publicRepo: Repository<RegulatoryPublication>,
  ) {
    this.publicationRepo = publicRepo;
  }

  private publicationRepo: Repository<RegulatoryPublication>;

  // ─── Agreement Management ─────────────────────────────
  async decideAgreement(data: Partial<AgreementDecision>): Promise<AgreementDecision> {
    const decision = this.agreementRepo.create(data);
    const saved = await this.agreementRepo.save(decision);
    this.logger.log(`Agreement ${data.decision}: actor=${data.actorId}`);
    return saved;
  }

  async findDecisions(actorId?: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (actorId) where.actorId = actorId;
    const [data, total] = await this.agreementRepo.findAndCount({
      where, skip: offset, take: l, order: { decidedAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  // ─── National Overview ────────────────────────────────
  async getNationalOverview(): Promise<Record<string, any>> {
    // In production: aggregate from all actors/vehicles/sales
    return {
      generatedAt: new Date().toISOString(),
      actors: { total: 0, byType: {}, byStatus: {} },
      vehicles: { total: 0, byCategory: {}, byStatus: {} },
      sales: { totalRevenue: 0, totalUnits: 0, monthlyTrend: [] },
      compliance: { averageScore: 0, violations: 0 },
      security: { activeAlerts: 0, seizedVehicles: 0, blacklistedModels: 0 },
    };
  }

  // ─── Regulatory Publications ──────────────────────────
  async createPublication(data: Partial<RegulatoryPublication>): Promise<RegulatoryPublication> {
    const pub = this.publicationRepo.create(data);
    return this.publicationRepo.save(pub);
  }

  async findPublications(page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const [data, total] = await this.publicationRepo.findAndCount({
      where: { isActive: true },
      skip: offset, take: l, order: { effectiveDate: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }
}
