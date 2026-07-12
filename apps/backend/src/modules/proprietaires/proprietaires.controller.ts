import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProprietairesService } from './proprietaires.service';

@ApiTags('Propriétaires')
@ApiBearerAuth()
@Controller('proprietaires')
export class ProprietairesController {
  constructor(private readonly svc: ProprietairesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste de tous les propriétaires (OWNER)' })
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un propriétaire' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un compte propriétaire' })
  create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un propriétaire' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Archiver un propriétaire (anonymisation douce)' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
