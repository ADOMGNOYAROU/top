import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../types/authenticated-user.type';
import { PrismaService } from '../../prisma/prisma.service';

export const SKIP_DELEGATION_CHECK = 'skipDelegationCheck';

// Bloque les mutations OWNER quand une délégation active existe.
// À appliquer uniquement sur les endpoints de mutation (POST/PATCH/PUT/DELETE)
// via le décorateur @SkipDelegationCheck() pour les contourner.
@Injectable()
export class DelegationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_DELEGATION_CHECK, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = req.user;

    // Seul le OWNER est concerné par le blocage — les gestionnaires/admins passent
    if (!user || user.role !== UserRole.OWNER) return true;

    // Lecture seule : GET et HEAD ne sont pas bloqués
    const method: string = req.method;
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true;

    // Vérifie si le propriétaire a une délégation active
    const delegation = await this.prisma.powerDelegation.findFirst({
      where: { ownerId: user.id, status: 'ACTIVE' },
      select: { id: true },
    });

    if (delegation) {
      throw new ForbiddenException(
        'Vous avez une délégation active — révoquez-la avant d\'effectuer des modifications',
      );
    }

    return true;
  }
}
