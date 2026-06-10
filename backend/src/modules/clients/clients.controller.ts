import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, LinkVehicleDto } from './dto/create-client.dto';
import { Client, VehicleOwnership } from './entities/client.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.DETAILLANT, UserRole.IMPORTATEUR)
  @ApiOperation({ summary: 'Créer un client (KYC)' })
  @ApiResponse({ status: 201, type: Client })
  async create(@Body() dto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Registre clients' })
  @ApiPaginatedResponse(Client)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    return this.clientsService.findAll(page ? +page : 1, limit ? +limit : 20, search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail client' })
  @ApiResponse({ status: 200, type: Client })
  async findOne(@Param('id') id: string): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.DETAILLANT)
  @ApiOperation({ summary: 'Modifier un client' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateClientDto>): Promise<Client> {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT)
  @ApiOperation({ summary: 'Supprimer un client' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.clientsService.remove(id);
  }

  @Post('link-vehicle')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DETAILLANT, UserRole.IMPORTATEUR)
  @ApiOperation({ summary: 'Lier véhicule à client' })
  async linkVehicle(@Body() dto: LinkVehicleDto): Promise<VehicleOwnership> {
    return this.clientsService.linkVehicle(dto);
  }

  @Get('vehicle/:vehicleId/ownership-history')
  @ApiOperation({ summary: 'Historique propriété' })
  async getOwnershipHistory(@Param('vehicleId') vehicleId: string): Promise<VehicleOwnership[]> {
    return this.clientsService.getOwnershipHistory(vehicleId);
  }

  @Get(':id/vehicles')
  @ApiOperation({ summary: 'Véhicules du client' })
  async getClientVehicles(@Param('id') clientId: string): Promise<VehicleOwnership[]> {
    return this.clientsService.getClientVehicles(clientId);
  }
}
