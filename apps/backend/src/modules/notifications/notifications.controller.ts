import { Controller, Get, Patch, Delete, Put, Post, Param, Body, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Journal des notifications envoyées à l\'utilisateur' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.findAll(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des notifications' })
  getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getStats(user.id);
  }

  @Patch(':id/lire')
  @HttpCode(204)
  @ApiOperation({ summary: 'Marquer une notification comme lue (no-op : journal immuable)' })
  marquerLue() { return; }

  @Patch('lire-tout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues (no-op)' })
  marquerToutLu() { return; }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer une notification du journal (no-op : journal immuable)' })
  remove() { return; }

  @Get('messagerie')
  @ApiOperation({ summary: 'Messagerie (placeholder — aucun modèle Prisma)' })
  getMessagerie() { return []; }

  @Post('messagerie')
  @ApiOperation({ summary: 'Créer une conversation (placeholder)' })
  createConversation() { return { message: 'Messagerie à implémenter' }; }

  @Get('messagerie/:id/messages')
  @ApiOperation({ summary: 'Messages d\'une conversation (placeholder)' })
  getMessages() { return []; }

  @Post('messagerie/:id/messages')
  @ApiOperation({ summary: 'Envoyer un message (placeholder)' })
  sendMessage() { return { message: 'Messagerie à implémenter' }; }

  @Get('preferences')
  @ApiOperation({ summary: 'Préférences de notification de l\'utilisateur' })
  getPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getPreferences(user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Mettre à jour les préférences de notification' })
  updatePreferences(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.svc.updatePreferences(user.id, dto);
  }
}
