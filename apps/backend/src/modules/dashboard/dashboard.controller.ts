import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { DashboardService, DashboardResponse } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@Roles(UserRole.OWNER, UserRole.MANAGER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'KPIs + revenus + paiements récents en un seul appel' })
  getOwnerDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('annee') annee?: string,
  ): Promise<DashboardResponse> {
    const year = annee ? parseInt(annee, 10) : new Date().getFullYear();
    return this.dashboardService.getOwnerDashboard(user, year);
  }
}
