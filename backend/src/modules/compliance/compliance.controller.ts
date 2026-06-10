import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { ComplianceService } from './compliance.service';
import { ComplianceRule, ComplianceScore, ComplianceChecklist } from './entities/compliance.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Conformite')
@Controller('compliance')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('rules')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT)
  @ApiOperation({ summary: 'Créer une règle de conformité' })
  @ApiResponse({ status: 201, type: ComplianceRule })
  async createRule(@Body() dto: Partial<ComplianceRule>): Promise<ComplianceRule> {
    return this.complianceService.createRule(dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Liste des règles' })
  @ApiPaginatedResponse(ComplianceRule)
  async findRules(
    @Query('ruleType') ruleType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.complianceService.findRules(ruleType, page ? +page : 1, limit ? +limit : 20);
  }

  @Post(':actorId/calculate')
  @ApiOperation({ summary: 'Calculer score conformité' })
  @ApiResponse({ status: 200, type: ComplianceScore })
  async calculateScore(@Param('actorId') actorId: string): Promise<ComplianceScore> {
    return this.complianceService.calculateScore(actorId);
  }

  @Get(':actorId/score')
  @ApiOperation({ summary: 'Score conformité acteur' })
  @ApiResponse({ status: 200, type: ComplianceScore })
  async getScore(@Param('actorId') actorId: string): Promise<ComplianceScore> {
    return this.complianceService.getScore(actorId);
  }

  @Get('scores')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.AUDITEUR, UserRole.CONTROLEUR)
  @ApiOperation({ summary: 'Tous les scores' })
  @ApiPaginatedResponse(ComplianceScore)
  async findAllScores(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.complianceService.findAllScores(page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':actorId/checklist')
  @ApiOperation({ summary: 'Checklist conformité' })
  async getChecklist(@Param('actorId') actorId: string): Promise<ComplianceChecklist[]> {
    return this.complianceService.getChecklist(actorId);
  }

  @Patch('checklist/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CONTROLEUR)
  @ApiOperation({ summary: 'Mettre à jour item checklist' })
  async updateChecklistItem(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
    @Body('checkedBy') checkedBy?: string,
  ): Promise<ComplianceChecklist> {
    return this.complianceService.updateChecklistItem(id, status as any, notes, checkedBy);
  }
}
