-- CreateEnum
CREATE TYPE "DelegationStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "power_delegations" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "status" "DelegationStatus" NOT NULL DEFAULT 'ACTIVE',
    "grantedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(6),

    CONSTRAINT "power_delegations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "power_delegations_ownerId_status_idx" ON "power_delegations"("ownerId", "status");

-- CreateIndex
CREATE INDEX "power_delegations_managerId_status_idx" ON "power_delegations"("managerId", "status");

-- AddForeignKey
ALTER TABLE "power_delegations" ADD CONSTRAINT "power_delegations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "power_delegations" ADD CONSTRAINT "power_delegations_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
