import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit.entity';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';
import { HashUtil } from '@common/utils/hash.util';

export interface AuditEventData {
  eventType: string;
  actorType: 'USER' | 'SYSTEM' | 'EXTERNAL';
  actorId: string;
  targetEntity: string;
  targetId: string;
  action: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>) {}

  async log(event: AuditEventData): Promise<AuditLog> {
    // Get previous hash for chain
    const lastLog = await this.auditRepo.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    const payload = JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
      previousHash: lastLog?.hash || 'genesis',
    });

    const hash = HashUtil.sha256(payload);

    const log = this.auditRepo.create({
      ...event,
      hash,
      previousHash: lastLog?.hash || null,
    });

    const saved = await this.auditRepo.save(log);
    this.logger.debug(`Audit: ${event.action} on ${event.targetEntity}/${event.targetId}`);
    return saved;
  }

  async findLogs(
    targetEntity?: string,
    targetId?: string,
    actorId?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (targetEntity) where.targetEntity = targetEntity;
    if (targetId) where.targetId = targetId;
    if (actorId) where.actorId = actorId;

    const [data, total] = await this.auditRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async verifyChain(): Promise<{ valid: boolean; brokenAt?: string }> {
    const logs = await this.auditRepo.find({ order: { createdAt: 'ASC' } });

    for (let i = 1; i < logs.length; i++) {
      if (logs[i].previousHash !== logs[i - 1].hash) {
        return { valid: false, brokenAt: logs[i].id };
      }
    }
    return { valid: true };
  }
}
