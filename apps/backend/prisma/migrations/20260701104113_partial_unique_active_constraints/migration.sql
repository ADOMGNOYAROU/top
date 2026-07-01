-- Contraintes non exprimables dans prisma/schema.prisma : Prisma ne
-- supporte pas les index uniques partiels (WHERE ...). Voir les
-- commentaires sur les modèles Lease et Mandate.

-- Un seul Lease ACTIVE à la fois par locataire (User.id)
CREATE UNIQUE INDEX "leases_tenant_active_unique"
  ON "leases" ("tenantUserId")
  WHERE "status" = 'ACTIVE';

-- Un seul Mandate ACTIVE à la fois par bien
CREATE UNIQUE INDEX "mandates_property_active_unique"
  ON "mandates" ("propertyId")
  WHERE "status" = 'ACTIVE';
