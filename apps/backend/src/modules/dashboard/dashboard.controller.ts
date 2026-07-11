import { Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs du tableau de bord propriétaire' })
  getKPIs(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getKPIs(user.id);
  }

  @Get('revenus/:annee')
  @ApiOperation({ summary: 'Revenus mensuels pour une année donnée' })
  getRevenusMensuels(
    @CurrentUser() user: AuthenticatedUser,
    @Param('annee', ParseIntPipe) annee: number,
  ) {
    return this.svc.getRevenusMensuels(user.id, annee);
  }

  @Get('alertes')
  @ApiOperation({ summary: 'Alertes actives (impayés, baux expirant)' })
  getAlertes(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getAlertes(user.id);
  }

  @Get('paiements/recent')
  @ApiOperation({ summary: 'Derniers paiements reçus' })
  getDerniersPaiements(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 5,
  ) {
    return this.svc.getDerniersPaiements(user.id, limit);
  }

  @Get('biens/recent')
  @ApiOperation({ summary: 'Derniers biens ajoutés' })
  getDerniersBiens(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 5,
  ) {
    return this.svc.getDerniersBiens(user.id, limit);
  }

  @Patch('alertes/:id/lire')
  @HttpCode(204)
  @ApiOperation({ summary: 'Marquer une alerte comme lue (no-op : alertes calculées à la volée)' })
  marquerAlerteLue(@Param('id') _id: string) {
    // Les alertes sont calculées dynamiquement — pas de persistance à ce stade
    return;
  }
}
