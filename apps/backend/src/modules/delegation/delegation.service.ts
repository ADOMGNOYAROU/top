import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotifyService } from '../notify/notify.service';
import { CacheService } from '../../common/cache/cache.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { GrantDelegationDto } from './dto/grant-delegation.dto';

const DELEGATION_CACHE_TTL = 15_000; // 15 s — courte durée pour la cohérence des guards

@Injectable()
export class DelegationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: NotifyService,
    private readonly cache: CacheService,
  ) {}

  async getActiveDelegation(ownerId: string) {
    return this.prisma.powerDelegation.findFirst({
      where: { ownerId, status: 'ACTIVE' },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async hasActiveDelegation(ownerId: string): Promise<boolean> {
    const key = `delegation:active:${ownerId}`;
    return this.cache.wrap(key, DELEGATION_CACHE_TTL, async () => {
      const d = await this.prisma.powerDelegation.findFirst({
        where: { ownerId, status: 'ACTIVE' },
        select: { id: true },
      });
      return !!d;
    });
  }

  private invalidateDelegationCache(ownerId: string): void {
    this.cache.del(`delegation:active:${ownerId}`);
  }

  async listCandidateManagers(ownerId: string) {
    // Gestionnaires déjà mandatés sur les biens du proprio
    const mandated = await this.prisma.user.findMany({
      where: {
        role: UserRole.MANAGER,
        mandatesAsManager: { some: { ownerId, status: 'ACTIVE' } },
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return mandated;
  }

  async grant(owner: AuthenticatedUser, dto: GrantDelegationDto) {
    if (!dto.managerId && !dto.managerEmail) {
      throw new BadRequestException('Fournir managerId ou managerEmail');
    }

    // Vérifie qu'il n'y a pas déjà une délégation active (check léger, sans include)
    const alreadyActive = await this.hasActiveDelegation(owner.id);
    if (alreadyActive) {
      throw new BadRequestException('Une délégation est déjà active — révoquez-la d\'abord');
    }

    // Résolution du gestionnaire
    let manager;
    if (dto.managerId) {
      manager = await this.prisma.user.findFirst({
        where: { id: dto.managerId, role: UserRole.MANAGER },
      });
    } else {
      manager = await this.prisma.user.findFirst({
        where: { email: dto.managerEmail, role: UserRole.MANAGER },
      });
    }
    if (!manager) {
      throw new NotFoundException('Gestionnaire introuvable sur la plateforme');
    }

    const delegation = await this.prisma.powerDelegation.create({
      data: { ownerId: owner.id, managerId: manager.id, status: 'ACTIVE' },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const ownerName = `${owner.firstName} ${owner.lastName}`;
    this.invalidateDelegationCache(owner.id);
    await this.notify.notifyUser({
      userId: manager.id,
      event: 'delegation-granted',
      variables: { ownerName },
    });

    return delegation;
  }

  async revoke(owner: AuthenticatedUser) {
    const delegation = await this.getActiveDelegation(owner.id);
    if (!delegation) {
      throw new NotFoundException('Aucune délégation active à révoquer');
    }

    await this.prisma.powerDelegation.update({
      where: { id: delegation.id },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });

    this.invalidateDelegationCache(owner.id);
    const ownerName = `${owner.firstName} ${owner.lastName}`;
    await this.notify.notifyUser({
      userId: delegation.managerId,
      event: 'delegation-revoked',
      variables: { ownerName },
    });
  }

  // Utilisé par le guard — vérifie si le owner appelant a une délégation active
  async isOwnerDelegated(ownerId: string): Promise<boolean> {
    return this.hasActiveDelegation(ownerId);
  }

  // Pour le dashboard gestionnaire — délégations reçues actives
  async getDelegationAsManager(managerId: string) {
    return this.prisma.powerDelegation.findFirst({
      where: { managerId, status: 'ACTIVE' },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }
}
