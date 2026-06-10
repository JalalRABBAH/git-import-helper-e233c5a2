import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, CreateBlacklistEntryDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleBlacklist } from './entities/vehicle.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { VehicleFilterParams } from '@shared/types/pagination-params.type';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Vehicules')
@Controller('vehicles')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.IMPORTATEUR, UserRole.ASSEMBLEUR)
  @ApiOperation({ summary: 'Enregistrer un véhicule' })
  @ApiResponse({ status: 201, type: Vehicle })
  @ApiResponse({ status: 422, description: 'Catégorie interdite' })
  async create(@Body() dto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehiclesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des véhicules' })
  @ApiPaginatedResponse(Vehicle)
  async findAll(@Query() params: VehicleFilterParams): Promise<any> {
    return this.vehiclesService.findAll(params);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Catégories de véhicules' })
  async findCategories() {
    return this.vehiclesService.findCategories();
  }

  @Get('blacklist')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CNTI_AGENT, UserRole.CONTROLEUR)
  @ApiOperation({ summary: 'Liste noire des véhicules' })
  @ApiPaginatedResponse(VehicleBlacklist)
  async findBlacklist(
    @Query('reason') reason?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.vehiclesService.findBlacklist(reason, page ? +page : 1, limit ? +limit : 20);
  }

  @Post('blacklist')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CNTI_AGENT)
  @ApiOperation({ summary: 'Ajouter à la liste noire' })
  async addToBlacklist(@Body() dto: CreateBlacklistEntryDto): Promise<VehicleBlacklist> {
    return this.vehiclesService.addToBlacklist(dto);
  }

  @Get(':vin')
  @ApiOperation({ summary: 'Détail par VIN' })
  @ApiResponse({ status: 200, type: Vehicle })
  async findByVin(@Param('vin') vin: string): Promise<Vehicle> {
    return this.vehiclesService.findByVin(vin);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.IMPORTATEUR, UserRole.ASSEMBLEUR)
  @ApiOperation({ summary: 'Modifier un véhicule' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto): Promise<Vehicle> {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT)
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.vehiclesService.remove(id);
  }

  @Post(':id/qr-generate')
  @ApiOperation({ summary: 'Générer QR code' })
  async generateQr(@Param('id') id: string): Promise<any> {
    return this.vehiclesService.generateQrCode(id);
  }
}
