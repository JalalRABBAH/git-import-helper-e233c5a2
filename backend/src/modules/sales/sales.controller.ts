import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale, Invoice } from './entities/sale.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Ventes')
@Controller('sales')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.DETAILLANT, UserRole.IMPORTATEUR)
  @ApiOperation({ summary: 'Enregistrer une vente' })
  @ApiResponse({ status: 201, type: Sale })
  async create(@Body() dto: CreateSaleDto): Promise<Sale> {
    return this.salesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des ventes' })
  @ApiPaginatedResponse(Sale)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('actorId') actorId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<any> {
    return this.salesService.findAll(page ? +page : 1, limit ? +limit : 20, actorId, dateFrom, dateTo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une vente' })
  @ApiResponse({ status: 200, type: Sale })
  async findOne(@Param('id') id: string): Promise<Sale> {
    return this.salesService.findOne(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.DETAILLANT)
  @ApiOperation({ summary: 'Annuler une vente' })
  @ApiResponse({ status: 200, type: Sale })
  async cancel(@Param('id') id: string, @Body('reason') reason: string): Promise<Sale> {
    return this.salesService.cancel(id, reason);
  }

  @Get('history/vehicle/:vehicleId')
  @ApiOperation({ summary: 'Historique ventes véhicule' })
  async getVehicleHistory(@Param('vehicleId') vehicleId: string): Promise<Sale[]> {
    return this.salesService.getSaleHistory(vehicleId);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Facture d\'une vente' })
  @ApiResponse({ status: 200, type: Invoice })
  async getInvoice(@Param('id') id: string): Promise<any> {
    return this.salesService.findInvoices(1, 10, id);
  }
}
