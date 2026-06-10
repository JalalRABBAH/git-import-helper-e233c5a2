import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { MinistryService } from './ministry.service';
import { AgreementDecision, RegulatoryPublication } from './entities/ministry.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Ministere')
@Controller('ministry')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class MinistryController {
  constructor(private readonly ministryService: MinistryService) {}

  @Post('agreements/decide')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT)
  @ApiOperation({ summary: 'Décision agrément (délivrance, suspension, révocation)' })
  @ApiResponse({ status: 201, type: AgreementDecision })
  async decideAgreement(@Body() dto: Partial<AgreementDecision>): Promise<AgreementDecision> {
    return this.ministryService.decideAgreement(dto);
  }

  @Get('agreements/decisions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.AUDITEUR)
  @ApiOperation({ summary: 'Historique décisions agrément' })
  @ApiPaginatedResponse(AgreementDecision)
  async findDecisions(
    @Query('actorId') actorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.ministryService.findDecisions(actorId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('overview')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.AUDITEUR, UserRole.CONTROLEUR)
  @ApiOperation({ summary: 'Vue nationale agrégée' })
  @ApiResponse({ status: 200, description: 'Vue nationale' })
  async getNationalOverview(): Promise<Record<string, any>> {
    return this.ministryService.getNationalOverview();
  }

  @Post('publications')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT)
  @ApiOperation({ summary: 'Publier texte réglementaire' })
  @ApiResponse({ status: 201, type: RegulatoryPublication })
  async createPublication(@Body() dto: Partial<RegulatoryPublication>): Promise<RegulatoryPublication> {
    return this.ministryService.createPublication(dto);
  }

  @Get('publications')
  @ApiOperation({ summary: 'Publications réglementaires' })
  @ApiPaginatedResponse(RegulatoryPublication)
  async findPublications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.ministryService.findPublications(page ? +page : 1, limit ? +limit : 20);
  }
}
