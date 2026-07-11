import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { TenantsService } from './tenants.service';

@ApiTags('Locataires')
@ApiBearerAuth()
@Controller('locataires')
export class TenantsController {
  constructor(private readonly svc: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des locataires du propriétaire connecté' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() filters: any) {
    return this.svc.findAll(user.id, filters);
  }

  @Get('statistiques')
  @ApiOperation({ summary: 'Statistiques des locataires' })
  getStatistiques(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getStatistiques(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un locataire' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un locataire' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.svc.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un locataire' })
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer un locataire' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.remove(id, user.id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archiver un locataire (terminer le bail actif)' })
  archive(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.update(id, user.id, {});
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: 'Changer le statut d\'un locataire' })
  updateStatut(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: any) {
    return this.svc.findOne(id, user.id);
  }
}
