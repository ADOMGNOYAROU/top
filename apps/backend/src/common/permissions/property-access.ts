import { Property } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../types/authenticated-user.type';

export type PropertyAccessor = {
  canRead: boolean;
  canMutate: boolean;
  isOwner: boolean;
  isMandatedManager: boolean;
};

// Autorité unique pour décider qui peut agir sur un bien — jamais de
// vérification inline `if (property.ownerId === user.id)` ailleurs dans
// le code métier (voir architecture.md, invariant #2).
export async function canActOnProperty(
  prisma: PrismaService,
  user: AuthenticatedUser,
  property: Property,
): Promise<PropertyAccessor> {
  if (user.role === 'ADMIN') {
    return { canRead: true, canMutate: true, isOwner: false, isMandatedManager: false };
  }

  const activeMandate = await prisma.mandate.findFirst({
    where: { propertyId: property.id, status: 'ACTIVE' },
  });

  const isOwner = property.ownerId === user.id;
  const isMandatedManager = activeMandate?.managerId === user.id;

  if (isMandatedManager) {
    return { canRead: true, canMutate: true, isOwner: false, isMandatedManager: true };
  }
  if (isOwner) {
    return { canRead: true, canMutate: !activeMandate, isOwner: true, isMandatedManager: false };
  }
  return { canRead: false, canMutate: false, isOwner: false, isMandatedManager: false };
}
