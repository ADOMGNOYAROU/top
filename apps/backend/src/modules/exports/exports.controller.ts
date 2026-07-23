import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ExportsService } from './exports.service';
import { CreateExportDto } from './dto/create-export.dto';

@ApiTags('Exports')
@ApiBearerAuth()
@Controller('gestionnaire/exports')
@Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste les exports récents (toujours vide — génération à la volée)' })
  listExports(): [] {
    return [];
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Génère et télécharge un export (biens, locataires, paiements, contrats)' })
  async createExport(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExportDto,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename, contentType } = await this.exportsService.generateExport(user, dto);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprime un export (no-op — exports non persistés)' })
  deleteExport(@Param('id') _id: string): void {
    // Les exports sont générés à la volée et non stockés
  }
}
