import { Controller, Get, Post, Delete, Param, Body, Query, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PaymentsService } from './payments.service';

@ApiTags('Paiements')
@ApiBearerAuth()
@Controller('paiements')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des paiements' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() filters: any) {
    return this.svc.findAll(user.id, filters);
  }

  @Get('impayes')
  @ApiOperation({ summary: 'Échéances impayées' })
  getImpayes(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getImpayes(user.id);
  }

  @Get('statistiques')
  @ApiOperation({ summary: 'Statistiques paiements' })
  getStatistiques(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getStatistiques(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un paiement' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Enregistrer un paiement' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.svc.create(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer un paiement' })
  remove() {
    // Suppression non implémentée pour préserver l'intégrité comptable
    return;
  }

  @Post(':id/rappel')
  @HttpCode(204)
  @ApiOperation({ summary: 'Envoyer un rappel de paiement' })
  sendRappel(@Param('id') _id: string) {
    // Rappels gérés par le NotifyService — à connecter ultérieurement
    return;
  }

  @Get(':id/quittance')
  @ApiOperation({ summary: 'Télécharger la quittance PDF' })
  getQuittance(@Param('id') id: string) {
    // Génération PDF à implémenter — retourne les données pour l'instant
    return { message: 'Génération PDF à implémenter', paymentId: id };
  }

  @Post(':id/quittance/email')
  @HttpCode(204)
  @ApiOperation({ summary: 'Envoyer la quittance par email' })
  sendQuittanceEmail(@Param('id') _id: string) {
    return;
  }

  @Post('mobile-money')
  @ApiOperation({ summary: 'Initier un paiement Mobile Money' })
  mobileMoney(@Body() dto: any) {
    return { message: 'Intégration CashPay à implémenter', ...dto };
  }
}
