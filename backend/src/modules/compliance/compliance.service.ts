import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceRule, ComplianceScore, ComplianceChecklist } from './entities/compliance.entity';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';
import { ComplianceStatus, ComplianceSeverity } from '@shared/enums/compliance.enum';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(ComplianceRule) private ruleRepo: Repository<ComplianceRule>,
    @InjectRepository(ComplianceScore) private scoreRepo: Repository<ComplianceScore>,
    @InjectRepository(ComplianceChecklist) private checklistRepo: Repository<ComplianceChecklist>,
  ) {}

  // ─── Rules Engine ─────────────────────────────────────
  async createRule(ruleData: Partial<ComplianceRule>): Promise<ComplianceRule> {
    const rule = this.ruleRepo.create(ruleData);
    return this.ruleRepo.save(rule);
  }

  async findRules(ruleType?: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = { isActive: true };
    if (ruleType) where.ruleType = ruleType;
    const [data, total] = await this.ruleRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  // ─── Scoring ──────────────────────────────────────────
  async calculateScore(actorId: string): Promise<ComplianceScore> {
    const rules = await this.ruleRepo.find({ where: { isActive: true } });
    const violations: any[] = [];
    let score = 100;

    for (const rule of rules) {
      const result = await this.evaluateRule(actorId, rule);
      if (!result.passed) {
        const penalty = this.getPenalty(rule.severity);
        score -= penalty;
        violations.push({ ruleId: rule.id, ruleName: rule.name, severity: rule.severity, message: result.message });
      }
    }

    score = Math.max(0, score);
    const status = score >= 80 ? ComplianceStatus.COMPLIANT
      : score >= 50 ? ComplianceStatus.NON_COMPLIANT_MINOR
      : ComplianceStatus.NON_COMPLIANT_MAJOR;

    const existing = await this.scoreRepo.findOne({ where: { actorId } });
    const scoreData = {
      actorId,
      score,
      status,
      violations,
      calculatedAt: new Date(),
      countdownDays: score < 50 ? 15 : score < 80 ? 30 : 90,
    };

    if (existing) {
      Object.assign(existing, scoreData);
      return this.scoreRepo.save(existing);
    }
    return this.scoreRepo.save(this.scoreRepo.create(scoreData));
  }

  async getScore(actorId: string): Promise<ComplianceScore> {
    const score = await this.scoreRepo.findOne({ where: { actorId } });
    if (!score) return this.calculateScore(actorId);
    return score;
  }

  async findAllScores(page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const [data, total] = await this.scoreRepo.findAndCount({
      skip: offset, take: l, order: { calculatedAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  // ─── Checklist ────────────────────────────────────────
  async getChecklist(actorId: string): Promise<ComplianceChecklist[]> {
    return this.checklistRepo.find({
      where: { actorId },
      relations: ['rule'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateChecklistItem(id: string, status: ComplianceStatus, notes?: string, checkedBy?: string): Promise<ComplianceChecklist> {
    const item = await this.checklistRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item non trouvé');
    item.status = status;
    item.notes = notes;
    item.checkedBy = checkedBy;
    item.checkedAt = new Date();
    return this.checklistRepo.save(item);
  }

  // ─── Rule Engine Helpers ──────────────────────────────
  private async evaluateRule(actorId: string, rule: ComplianceRule): Promise<{ passed: boolean; message?: string }> {
    // Simplified rule evaluation
    switch (rule.ruleType) {
      case 'DOCUMENT':
        return { passed: true }; // In production: check required documents
      case 'VEHICLE_SPEC':
        return { passed: true };
      case 'PRICING':
        return { passed: true };
      case 'STOCK':
        return { passed: true };
      case 'KYC':
        return { passed: true };
      case 'TIMING':
        return { passed: true };
      case 'CUSTOMS':
        return { passed: true };
      case 'TAX':
        return { passed: true };
      default:
        return { passed: true };
    }
  }

  private getPenalty(severity: ComplianceSeverity): number {
    switch (severity) {
      case ComplianceSeverity.INFO: return 0;
      case ComplianceSeverity.WARNING: return 5;
      case ComplianceSeverity.CRITICAL: return 15;
      case ComplianceSeverity.BLOCKER: return 30;
      default: return 5;
    }
  }
}
