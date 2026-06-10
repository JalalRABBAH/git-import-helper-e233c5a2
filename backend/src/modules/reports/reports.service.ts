import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuarterlyReport } from './entities/report.entity';
import { GenerateReportDto, SubmitReportDto } from './dto/create-report.dto';
import { getPaginationOptions, createPaginatedResult } from '@common/utils/pagination.util';
import { DateUtil } from '@common/utils/date.util';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(@InjectRepository(QuarterlyReport) private reportRepo: Repository<QuarterlyReport>) {}

  async generate(dto: GenerateReportDto): Promise<QuarterlyReport> {
    // Check existing
    const existing = await this.reportRepo.findOne({
      where: { actorId: dto.actorId, reportYear: dto.year, period: dto.period },
    });
    if (existing) throw new NotFoundException('Rapport déjà existant pour cette période');

    // Build summary (simplified - in production, aggregate from sales/stocks)
    const summaryData = await this.buildReportSummary(dto.actorId, dto.year, dto.period);

    const report = this.reportRepo.create({
      ...dto,
      reportYear: dto.year,
      status: 'READY',
      summaryData,
    });

    const saved = await this.reportRepo.save(report);
    this.logger.log(`Report generated: ${saved.id} - ${dto.period}/${dto.year}`);
    return saved;
  }

  async findAll(actorId?: string, page: number = 1, limit: number = 20): Promise<any> {
    const { page: p, limit: l, offset } = getPaginationOptions(page, limit);
    const where: any = {};
    if (actorId) where.actorId = actorId;
    const [data, total] = await this.reportRepo.findAndCount({
      where, skip: offset, take: l, order: { createdAt: 'DESC' },
    });
    return createPaginatedResult(data, total, p, l);
  }

  async findOne(id: string): Promise<QuarterlyReport> {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException(`Rapport ${id} non trouvé`);
    return report;
  }

  async submit(id: string, dto: SubmitReportDto): Promise<QuarterlyReport> {
    const report = await this.findOne(id);
    if (report.status !== 'READY') throw new NotFoundException('Rapport non prêt pour soumission');

    report.status = 'SUBMITTED';
    report.submittedAt = new Date();
    return this.reportRepo.save(report);
  }

  async updateStatus(id: string, status: string, notes?: string, reviewerId?: string): Promise<QuarterlyReport> {
    const report = await this.findOne(id);
    report.status = status as any;
    report.reviewNotes = notes;
    report.reviewedBy = reviewerId;
    report.reviewedAt = new Date();
    return this.reportRepo.save(report);
  }

  // ─── Generators ───────────────────────────────────────
  async generateXml(id: string): Promise<string> {
    const report = await this.findOne(id);
    // Simplified XML generation
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<report xmlns="http://uemoa.int/report/v1">
  <header>
    <actorId>${report.actorId}</actorId>
    <period>${report.period}</period>
    <year>${report.reportYear}</year>
    <generatedAt>${new Date().toISOString()}</generatedAt>
  </header>
  <sales>
    <totalRevenue>${report.summaryData?.totalRevenue || 0}</totalRevenue>
    <unitsSold>${report.summaryData?.unitsSold || 0}</unitsSold>
  </sales>
  <stocks>
    <openingBalance>${report.summaryData?.openingStock || 0}</openingBalance>
    <closingBalance>${report.summaryData?.closingStock || 0}</closingBalance>
  </stocks>
  <compliance>
    <score>${report.summaryData?.complianceScore || 100}</score>
    <violations>${report.summaryData?.violations || 0}</violations>
  </compliance>
</report>`;
    return xml;
  }

  async generatePdf(id: string): Promise<string> {
    // In production: use puppeteer to generate PDF
    return `PDF content for report ${id}`;
  }

  private async buildReportSummary(actorId: string, year: number, period: string): Promise<Record<string, any>> {
    // Simplified - in production, aggregate real data
    return {
      totalRevenue: 0,
      unitsSold: 0,
      openingStock: 0,
      closingStock: 0,
      complianceScore: 100,
      violations: 0,
      taxesPaid: 0,
      period,
      year,
      generatedAt: new Date().toISOString(),
    };
  }
}
