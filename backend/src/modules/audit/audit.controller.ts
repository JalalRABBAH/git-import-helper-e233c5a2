import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.AUDITEUR)
  @ApiOperation({ summary: 'Audit trail' })
  @ApiPaginatedResponse(AuditLog)
  async findLogs(
    @Query('targetEntity') targetEntity?: string,
    @Query('targetId') targetId?: string,
    @Query('actorId') actorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.auditService.findLogs(
      targetEntity, targetId, actorId,
      page ? +page : 1, limit ? +limit : 20,
    );
  }

  @Get('verify-chain')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AUDITEUR)
  @ApiOperation({ summary: 'Vérifier intégrité chaîne' })
  @ApiResponse({ status: 200, description: 'Résultat vérification' })
  async verifyChain(): Promise<{ valid: boolean; brokenAt?: string }> {
    return this.auditService.verifyChain();
  }
}
