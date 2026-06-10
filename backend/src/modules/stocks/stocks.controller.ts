import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { CreateStockMovementDto, CreateInventoryDto } from './dto/create-stock-movement.dto';
import { StockMovement, InventoryCount } from './entities/stock.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { StockMovementFilterParams } from '@shared/types/pagination-params.type';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Stocks')
@Controller('stocks')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('movements')
  @ApiOperation({ summary: 'Mouvements de stock' })
  @ApiPaginatedResponse(StockMovement)
  async findMovements(@Query() params: StockMovementFilterParams): Promise<any> {
    return this.stocksService.findMovements(params);
  }

  @Post('movements')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.IMPORTATEUR, UserRole.DETAILLANT)
  @ApiOperation({ summary: 'Enregistrer un mouvement' })
  @ApiResponse({ status: 201, type: StockMovement })
  @ApiResponse({ status: 422, description: 'Stock insuffisant' })
  async createMovement(@Body() dto: CreateStockMovementDto): Promise<StockMovement> {
    return this.stocksService.createMovement(dto);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Inventaires de stock' })
  @ApiPaginatedResponse(InventoryCount)
  async findInventories(
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.stocksService.findInventories(warehouseId, status, page ? +page : 1, limit ? +limit : 20);
  }

  @Post('inventory')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.IMPORTATEUR)
  @ApiOperation({ summary: 'Créer un inventaire' })
  @ApiResponse({ status: 201, type: InventoryCount })
  async createInventory(@Body() dto: CreateInventoryDto): Promise<InventoryCount> {
    return this.stocksService.createInventory(dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Résumé des stocks' })
  async getStockSummary(
    @Query('actorId') actorId: string,
    @Query('warehouseId') warehouseId?: string,
  ): Promise<any> {
    return this.stocksService.getStockSummary(actorId, warehouseId);
  }
}
