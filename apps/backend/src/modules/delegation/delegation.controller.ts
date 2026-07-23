import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { DelegationService } from './delegation.service';
import { GrantDelegationDto } from './dto/grant-delegation.dto';

@ApiTags('Delegation')
@ApiBearerAuth()
@Controller('delegation')
export class DelegationController {
  constructor(private readonly delegationService: DelegationService) {}

  @Get('status')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'État de la délégation active du propriétaire' })
  getStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.delegationService.getActiveDelegation(user.id);
  }

  @Get('candidates')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Gestionnaires déjà mandatés sur les biens du propriétaire' })
  getCandidates(@CurrentUser() user: AuthenticatedUser) {
    return this.delegationService.listCandidateManagers(user.id);
  }

  @Post()
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Accorde la délégation de pouvoir à un gestionnaire' })
  grant(@CurrentUser() user: AuthenticatedUser, @Body() dto: GrantDelegationDto) {
    return this.delegationService.grant(user, dto);
  }

  @Delete()
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Révoque la délégation active' })
  revoke(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.delegationService.revoke(user);
  }

  @Get('received')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Délégation reçue par le gestionnaire (pour la bannière dashboard)' })
  getReceived(@CurrentUser() user: AuthenticatedUser) {
    return this.delegationService.getDelegationAsManager(user.id);
  }
}
