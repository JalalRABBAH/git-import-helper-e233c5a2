import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto, SubmitReportDto } from './dto/create-report.dto';
import { QuarterlyReport } from './entities/report.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Rapports')
@Controller('reports')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('quarterly/generate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.IMPORTATEUR, UserRole.ASSEMBLEUR)
  @ApiOperation({ summary: 'Générer rapport trimestriel' })
  @ApiResponse({ status: 201, type: QuarterlyReport })
  async generate(@Body() dto: GenerateReportDto): Promise<QuarterlyReport> {
    return this.reportsService.generate(dto);
  }

  @Get('quarterly')
  @ApiOperation({ summary: 'Liste des rapports' })
  @ApiPaginatedResponse(QuarterlyReport)
  async findAll(
    @Query('actorId') actorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.reportsService.findAll(actorId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('quarterly/:id')
  @ApiOperation({ summary: 'Détail rapport' })
  @ApiResponse({ status: 200, type: QuarterlyReport })
  async findOne(@Param('id') id: string): Promise<QuarterlyReport> {
    return this.reportsService.findOne(id);
  }

  @Post('quarterly/:id/submit')
  @Roles(UserRole.IMPORTATEUR, UserRole.ASSEMBLEUR)
  @ApiOperation({ summary: 'Soumettre rapport' })
  @ApiResponse({ status: 200, type: QuarterlyReport })
  async submit(@Param('id') id: string, @Body() dto: SubmitReportDto): Promise<QuarterlyReport> {
    return this.reportsService.submit(id, dto);
  }

  @Patch('quarterly/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CONTROLEUR)
  @ApiOperation({ summary: 'Mettre à jour statut (ministère)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ): Promise<QuarterlyReport> {
    return this.reportsService.updateStatus(id, status, notes);
  }

  @Get('quarterly/:id/xml')
  @ApiOperation({ summary: 'Télécharger XML' })
  async downloadXml(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const xml = await this.reportsService.generateXml(id);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=report-${id}.xml`);
    res.send(xml);
  }

  @Get('quarterly/:id/pdf')
  @ApiOperation({ summary: 'Télécharger PDF' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const pdf = await this.reportsService.generatePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${id}.pdf`);
    res.send(pdf);
  }
}
