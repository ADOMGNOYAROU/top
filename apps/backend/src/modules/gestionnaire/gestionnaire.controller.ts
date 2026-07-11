import { Controller, Get, Post, Put, Patch, Param, Body, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { GestionnaireService } from './gestionnaire.service';

@ApiTags('Gestionnaire')
@ApiBearerAuth()
@Roles('MANAGER')
@Controller('gestionnaire')
export class GestionnaireController {
  constructor(private readonly svc: GestionnaireService) {}

  @Get('mandats')
  @ApiOperation({ summary: 'Liste des mandats du gestionnaire' })
  getMandats(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getMandats(user.id);
  }

  @Post('mandats')
  @ApiOperation({ summary: 'Créer un mandat de gestion' })
  createMandat(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.svc.createMandat(user.id, dto);
  }

  @Patch('mandats/:id/renouveler')
  @ApiOperation({ summary: 'Renouveler un mandat' })
  renouvelerMandat(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: any) {
    return this.svc.renouvelerMandat(id, user.id, dto);
  }

  @Get('mandats/export')
  @ApiOperation({ summary: 'Exporter les mandats (placeholder)' })
  exportMandats() {
    return { message: 'Export à implémenter' };
  }

  @Get('profil')
  @ApiOperation({ summary: 'Profil du gestionnaire connecté' })
  getProfil(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getProfil(user.id);
  }

  @Put('profil')
  @ApiOperation({ summary: 'Mettre à jour le profil gestionnaire' })
  updateProfil(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.svc.updateProfil(user.id, dto);
  }

  @Get('rapports')
  @ApiOperation({ summary: 'Liste des rapports (placeholder)' })
  getRapports(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getRapports(user.id);
  }

  @Post('rapports')
  @HttpCode(201)
  @ApiOperation({ summary: 'Générer un rapport (placeholder)' })
  createRapport() {
    return { message: 'Génération de rapports à implémenter' };
  }

  @Get('rapports/:id/download')
  @ApiOperation({ summary: 'Télécharger un rapport (placeholder)' })
  downloadRapport(@Param('id') id: string) {
    return { message: 'Téléchargement à implémenter', id };
  }

  @Post('rapports/:id/envoyer')
  @HttpCode(204)
  @ApiOperation({ summary: 'Envoyer un rapport par email (placeholder)' })
  envoyerRapport() { return; }

  @Get('exports')
  @ApiOperation({ summary: 'Liste des exports' })
  getExports(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getExports(user.id);
  }

  @Post('exports')
  @ApiOperation({ summary: 'Créer un export (placeholder)' })
  createExport() {
    return { message: 'Export à implémenter' };
  }

  @Get('exports/:id/download')
  @ApiOperation({ summary: 'Télécharger un export (placeholder)' })
  downloadExport(@Param('id') id: string) {
    return { message: 'Téléchargement à implémenter', id };
  }

  @Post('dashboard/kpis')
  @Get('dashboard/kpis')
  @ApiOperation({ summary: 'KPIs du tableau de bord gestionnaire' })
  getKPIs(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getMandats(user.id).then((mandats) => ({
      totalMandats: mandats.length,
      mandatsActifs: mandats.filter((m) => m.statut === 'ACTIVE').length,
      alertes: [],
    }));
  }

  @Get('dashboard/alertes')
  @ApiOperation({ summary: 'Alertes du gestionnaire' })
  getAlertes() {
    return [];
  }

  @Get('dashboard/biens-recents')
  @ApiOperation({ summary: 'Biens récents gérés' })
  getBiensRecents() {
    return [];
  }

  @Patch('dashboard/alertes/:id/traiter')
  @HttpCode(204)
  @ApiOperation({ summary: 'Traiter une alerte gestionnaire (placeholder)' })
  traiterAlerte() { return; }
}
