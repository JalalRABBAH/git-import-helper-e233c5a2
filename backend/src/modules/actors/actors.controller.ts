import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes,
} from '@nestjs/swagger';
import { ActorsService } from './actors.service';
import { CreateActorDto, CreateWarehouseDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { Actor, ActorDocument, Warehouse } from './entities/actor.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { ActorFilterParams } from '@shared/types/pagination-params.type';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Acteurs')
@Controller('actors')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.IMPORTATEUR)
  @ApiOperation({ summary: 'Créer un acteur économique' })
  @ApiResponse({ status: 201, type: Actor })
  async create(@Body() dto: CreateActorDto): Promise<Actor> {
    return this.actorsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des acteurs économiques' })
  @ApiPaginatedResponse(Actor)
  async findAll(@Query() params: ActorFilterParams): Promise<any> {
    return this.actorsService.findAll(params);
  }

  @Get('expiring-agreements')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.CONTROLEUR)
  @ApiOperation({ summary: 'Acteurs avec agréments expirants' })
  async findExpiringAgreements(@Query('days') days?: string): Promise<Actor[]> {
    return this.actorsService.findExpiringAgreements(days ? +days : 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un acteur' })
  @ApiResponse({ status: 200, type: Actor })
  async findOne(@Param('id') id: string): Promise<Actor> {
    return this.actorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.IMPORTATEUR)
  @ApiOperation({ summary: 'Modifier un acteur' })
  async update(@Param('id') id: string, @Body() dto: UpdateActorDto): Promise<Actor> {
    return this.actorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT)
  @ApiOperation({ summary: 'Supprimer un acteur' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.actorsService.remove(id);
  }

  // Documents
  @Get(':id/documents')
  @ApiOperation({ summary: 'Documents d\'un acteur' })
  async findDocuments(@Param('id') id: string): Promise<ActorDocument[]> {
    return this.actorsService.findDocuments(id);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Ajouter un document' })
  async addDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ): Promise<ActorDocument> {
    return this.actorsService.addDocument(id, {
      documentType: body.documentType,
      documentLabel: body.documentLabel || body.documentType,
      fileName: file?.originalname || 'unknown',
      fileSizeBytes: file?.size || 0,
      mimeType: file?.mimetype || 'application/octet-stream',
      storagePath: `/documents/${id}/${body.documentType}`,
      checksumSha256: 'pending',
    });
  }

  // Warehouses
  @Get(':id/warehouses')
  @ApiOperation({ summary: 'Entrepôts d\'un acteur' })
  async findWarehouses(@Param('id') id: string): Promise<Warehouse[]> {
    return this.actorsService.findWarehouses(id);
  }

  @Post(':id/warehouses')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_DRCTT, UserRole.IMPORTATEUR, UserRole.DISTRIBUTEUR)
  @ApiOperation({ summary: 'Créer un entrepôt' })
  async createWarehouse(@Param('id') id: string, @Body() dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.actorsService.createWarehouse(id, dto);
  }
}
