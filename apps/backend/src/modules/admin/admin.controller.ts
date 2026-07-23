import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('comptes')
  listComptes() {
    return this.adminService.listComptes();
  }

  @Patch('comptes/:id')
  changerStatut(
    @Param('id') id: string,
    @Body() body: { statut: 'ACTIF' | 'SUSPENDU' },
  ) {
    return this.adminService.changerStatut(id, body.statut);
  }

  @Delete('comptes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  supprimerCompte(@Param('id') id: string): Promise<void> {
    return this.adminService.supprimerCompte(id);
  }

  @Get('statistiques')
  getStatistiques() {
    return this.adminService.getStatistiques();
  }
}
