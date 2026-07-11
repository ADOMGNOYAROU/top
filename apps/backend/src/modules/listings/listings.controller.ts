import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ListingsService } from './listings.service';

@ApiTags('Annonces')
@ApiBearerAuth()
@Controller('annonces')
export class ListingsController {
  constructor(private readonly svc: ListingsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des annonces de l\'utilisateur connecté' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.svc.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une annonce' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Publier une annonce pour un bien' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: any) {
    return this.svc.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une annonce' })
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer une annonce' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.svc.remove(id, user.id);
  }
}
