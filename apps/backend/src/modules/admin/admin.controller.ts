import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('comptes')
  @ApiOperation({ summary: 'Liste de tous les comptes utilisateurs' })
  getComptes(@Query() filters: any) {
    return this.svc.getComptes(filters);
  }

  @Patch('comptes/:id')
  @ApiOperation({ summary: 'Modifier le statut d\'un compte' })
  changerStatut(@Param('id') id: string, @Body() dto: any) {
    return this.svc.changerStatutCompte(id, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Liste supervisée des transactions' })
  getTransactions(@Query() filters: any) {
    return this.svc.getTransactions(filters);
  }

  @Get('litiges')
  @ApiOperation({ summary: 'Liste des litiges (placeholder)' })
  getLitiges() {
    return this.svc.getLitiges();
  }

  @Patch('litiges/:id')
  @ApiOperation({ summary: 'Résoudre un litige (placeholder)' })
  resoudreLitige(@Param('id') id: string, @Body() dto: any) {
    return this.svc.resoudreLitige(id, dto);
  }

  @Get('statistiques')
  @ApiOperation({ summary: 'Statistiques globales de la plateforme' })
  getStatistiques() {
    return this.svc.getStatistiques();
  }
}
