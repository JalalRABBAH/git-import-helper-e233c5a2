import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { FraudAlert, SecurityBlacklist, SeizedVehicle } from './entities/security.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Securite')
@Controller('security')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('fraud-alerts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CNTI_AGENT, UserRole.CONTROLEUR)
  @ApiOperation({ summary: 'Créer alerte fraude' })
  @ApiResponse({ status: 201, type: FraudAlert })
  async createAlert(@Body() dto: Partial<FraudAlert>): Promise<FraudAlert> {
    return this.securityService.createAlert(dto);
  }

  @Get('fraud-alerts')
  @ApiOperation({ summary: 'Liste alertes fraude' })
  @ApiPaginatedResponse(FraudAlert)
  async findAlerts(
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.securityService.findAlerts(severity, status, page ? +page : 1, limit ? +limit : 20);
  }

  @Patch('fraud-alerts/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CNTI_AGENT)
  @ApiOperation({ summary: 'Mettre à jour statut alerte' })
  async updateAlertStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('resolution') resolution?: string,
  ): Promise<FraudAlert> {
    return this.securityService.updateAlertStatus(id, status, resolution);
  }

  @Post('fraud-alerts/:id/cnti-report')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CNTI_AGENT)
  @ApiOperation({ summary: 'Signaler CNTI' })
  async reportToCnti(@Param('id') id: string): Promise<void> {
    return this.securityService.reportToCnti(id);
  }

  @Post('blacklist')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CNTI_AGENT)
  @ApiOperation({ summary: 'Ajouter modèle à blacklist' })
  @ApiResponse({ status: 201, type: SecurityBlacklist })
  async addToBlacklist(@Body() dto: Partial<SecurityBlacklist>): Promise<SecurityBlacklist> {
    return this.securityService.addToBlacklist(dto);
  }

  @Get('blacklist')
  @ApiOperation({ summary: 'Liste modèles interdits' })
  @ApiPaginatedResponse(SecurityBlacklist)
  async findBlacklist(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.securityService.findBlacklist(page ? +page : 1, limit ? +limit : 20);
  }

  @Post('seizures')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CNTI_AGENT, UserRole.CONTROLEUR)
  @ApiOperation({ summary: 'Saisir un véhicule' })
  @ApiResponse({ status: 201, type: SeizedVehicle })
  async seizeVehicle(@Body() dto: Partial<SeizedVehicle>): Promise<SeizedVehicle> {
    return this.securityService.seizeVehicle(dto);
  }

  @Get('seizures')
  @ApiOperation({ summary: 'Véhicules saisis' })
  @ApiPaginatedResponse(SeizedVehicle)
  async findSeizedVehicles(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.securityService.findSeizedVehicles(status, page ? +page : 1, limit ? +limit : 20);
  }

  @Patch('seizures/:id/release')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT)
  @ApiOperation({ summary: 'Libérer un véhicule saisi' })
  async releaseVehicle(@Param('id') id: string, @Body('notes') notes?: string): Promise<SeizedVehicle> {
    return this.securityService.releaseVehicle(id, notes);
  }
}
