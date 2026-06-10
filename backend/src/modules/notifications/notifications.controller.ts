import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService, SendNotificationDto } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated-response.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Envoyer une notification' })
  @ApiResponse({ status: 201, type: Notification })
  async send(@Body() dto: SendNotificationDto): Promise<Notification> {
    return this.notificationsService.send(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Notifications de l\'utilisateur' })
  @ApiPaginatedResponse(Notification)
  async findByUser(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    return this.notificationsService.findByUser(userId, page ? +page : 1, limit ? +limit : 20);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer comme lu' })
  @ApiResponse({ status: 200, type: Notification })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }
}
