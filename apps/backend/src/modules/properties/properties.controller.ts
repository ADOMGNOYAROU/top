import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PropertiesService } from './properties.service';

@ApiTags('Biens')
@ApiBearerAuth()
@Controller('biens')
export class PropertiesController {
  constructor(private readonly svc: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des biens du propriétaire connecté' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() filters: any) {
    return this.svc.findAll(user.id, filters);
  }

  @Get('statistiques')
  @ApiOperation({ summary: 'Statistiques des biens' })
  getStatistiques(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.getStatistiques(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un bien' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un bien' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.svc.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un bien' })
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer un bien' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.remove(id, user.id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archiver un bien' })
  archive(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.archive(id, user.id);
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: 'Changer le statut d\'un bien' })
  updateStatus(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body('statut') statut: string) {
    return this.svc.updateStatus(id, user.id, statut);
  }
}
