import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { CreatePurchasePriceDto, RecordPriceChangeDto } from './dto/create-pricing.dto';
import { PurchasePrice, PricingHistory } from './entities/pricing.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Pricing')
@Controller('pricing')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('purchase')
  @Roles(UserRole.SUPER_ADMIN, UserRole.IMPORTATEUR, UserRole.ADMIN_DRCTT)
  @ApiOperation({ summary: 'Enregistrer prix d\'achat' })
  @ApiResponse({ status: 201, type: PurchasePrice })
  async createPurchasePrice(@Body() dto: CreatePurchasePriceDto): Promise<PurchasePrice> {
    return this.pricingService.createPurchasePrice(dto);
  }

  @Get('purchase/:actorId')
  @ApiOperation({ summary: 'Historique prix d\'achat' })
  @ApiPaginatedResponse(PurchasePrice)
  async findPurchasePrices(
    @Param('actorId') actorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.pricingService.findPurchasePrices(actorId, page ? +page : 1, limit ? +limit : 20);
  }

  @Post('history')
  @ApiOperation({ summary: 'Enregistrer changement de prix' })
  @ApiResponse({ status: 201, type: PricingHistory })
  async recordPriceChange(@Body() dto: RecordPriceChangeDto): Promise<PricingHistory> {
    return this.pricingService.recordPriceChange(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Historique variations prix' })
  @ApiPaginatedResponse(PricingHistory)
  async findPriceHistory(
    @Query('actorId') actorId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.pricingService.findPriceHistory(actorId, vehicleId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('alerts/margin')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.AUDITEUR)
  @ApiOperation({ summary: 'Alertes marges >20%' })
  async getMarginAlerts(@Query('threshold') threshold?: string): Promise<PricingHistory[]> {
    return this.pricingService.getMarginAlerts(threshold ? +threshold : 20);
  }

  @Get('export/ohada')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.AUDITEUR)
  @ApiOperation({ summary: 'Export comptable OHADA' })
  async generateOhadaExport(
    @Query('actorId') actorId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ): Promise<any> {
    return this.pricingService.generateOhadaExport(actorId, new Date(dateFrom), new Date(dateTo));
  }
}
