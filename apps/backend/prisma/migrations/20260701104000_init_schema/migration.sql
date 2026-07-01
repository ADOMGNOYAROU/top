-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'TENANT', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED_INACTIVITY', 'SUSPENDED_ADMIN', 'SUSPENDED_PAYMENT');

-- CreateEnum
CREATE TYPE "NotificationConsent" AS ENUM ('NOT_ASKED', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "IdVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('VILLA', 'APARTMENT', 'STUDIO', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('OCCUPIED', 'VACANT', 'RENOVATION', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PropertyDocumentType" AS ENUM ('STATE_OF_PLAY', 'PROPERTY_TITLE', 'INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('ACTIVE', 'TERMINATED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "ScheduleEntryStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PENDING_CONFIRMATION', 'PAID', 'PARTIAL', 'LATE', 'OVERDUE', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('CASHPAY_API', 'MANUAL_OWNER', 'TENANT_DECLARATION');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TMONEY', 'FLOOZ', 'CASH', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'DISABLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MandateStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MandateFeeType" AS ENUM ('PERCENTAGE', 'FLAT');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('STARTER', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PENDING_CANCELLATION', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationDispatchStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "notificationConsent" "NotificationConsent" NOT NULL DEFAULT 'NOT_ASKED',
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 5,
    "overdueGraceDays" INTEGER NOT NULL DEFAULT 3,
    "profilePhotoPath" TEXT,
    "anonymizedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "residenceCountry" TEXT NOT NULL,
    "idVerificationStatus" "IdVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "betaUntil" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "owner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idVerificationStatus" "IdVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUserId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idVerificationStatus" "IdVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "zonesOfIntervention" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pricingNote" TEXT,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "manager_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "status" "IdVerificationStatus" NOT NULL,
    "reason" TEXT,
    "rawText" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'VACANT',
    "address" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "surfaceArea" DOUBLE PRECISION NOT NULL,
    "roomsCount" INTEGER,
    "monthlyRent" INTEGER NOT NULL,
    "monthlyCharges" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "archivedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_photos" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_documents" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "PropertyDocumentType" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "tenantUserId" TEXT NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "monthlyCharges" INTEGER NOT NULL DEFAULT 0,
    "paymentFrequency" "PaymentFrequency" NOT NULL,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6),
    "securityDeposit" INTEGER NOT NULL DEFAULT 0,
    "depositReturnConditions" TEXT,
    "status" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "terminatedAt" TIMESTAMPTZ(6),
    "terminationReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_schedule_entries" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "periodStart" TIMESTAMPTZ(6) NOT NULL,
    "periodEnd" TIMESTAMPTZ(6) NOT NULL,
    "dueDate" TIMESTAMPTZ(6) NOT NULL,
    "expectedAmount" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "status" "ScheduleEntryStatus" NOT NULL DEFAULT 'PENDING',
    "reminderSentAt" TIMESTAMPTZ(6),
    "overdueAlertSentAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "scheduleEntryId" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "source" "PaymentSource" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "paidAmount" INTEGER NOT NULL,
    "paidAt" TIMESTAMPTZ(6),
    "transactionId" TEXT,
    "proofStoragePath" TEXT,
    "note" TEXT,
    "recordedByUserId" TEXT,
    "confirmedByUserId" TEXT,
    "confirmedAt" TIMESTAMPTZ(6),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_declarations" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "declaredAmount" INTEGER NOT NULL,
    "declaredAt" TIMESTAMPTZ(6) NOT NULL,
    "declaredMethod" "PaymentMethod" NOT NULL,
    "proofStoragePath" TEXT,
    "note" TEXT,
    "editedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "publishedByUserId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "publishedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivatedAt" TIMESTAMPTZ(6),
    "suspendedAt" TIMESTAMPTZ(6),
    "suspensionReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_contacts" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandates" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "status" "MandateStatus" NOT NULL DEFAULT 'PENDING',
    "feeType" "MandateFeeType" NOT NULL,
    "feeValue" INTEGER NOT NULL,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6),
    "acceptedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "revokedReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mandates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_reviews" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "mandateId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "manager_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'STARTER',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "betaUntil" TIMESTAMPTZ(6),
    "promoDiscountPercent" INTEGER,
    "currentPeriodEnd" TIMESTAMPTZ(6),
    "cancelAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_invoices" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMPTZ(6),
    "periodStart" TIMESTAMPTZ(6) NOT NULL,
    "periodEnd" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "subscription_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationDispatchStatus" NOT NULL DEFAULT 'SENT',
    "payload" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "owner_profiles_userId_key" ON "owner_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_profiles_userId_key" ON "tenant_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "manager_profiles_userId_key" ON "manager_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_userId_key" ON "admin_profiles"("userId");

-- CreateIndex
CREATE INDEX "password_reset_otps_userId_idx" ON "password_reset_otps"("userId");

-- CreateIndex
CREATE INDEX "identity_verifications_userId_idx" ON "identity_verifications"("userId");

-- CreateIndex
CREATE INDEX "properties_ownerId_idx" ON "properties"("ownerId");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "properties"("type");

-- CreateIndex
CREATE INDEX "properties_city_neighborhood_idx" ON "properties"("city", "neighborhood");

-- CreateIndex
CREATE INDEX "property_photos_propertyId_idx" ON "property_photos"("propertyId");

-- CreateIndex
CREATE INDEX "property_documents_propertyId_idx" ON "property_documents"("propertyId");

-- CreateIndex
CREATE INDEX "leases_propertyId_idx" ON "leases"("propertyId");

-- CreateIndex
CREATE INDEX "leases_ownerId_idx" ON "leases"("ownerId");

-- CreateIndex
CREATE INDEX "leases_tenantUserId_idx" ON "leases"("tenantUserId");

-- CreateIndex
CREATE INDEX "leases_status_idx" ON "leases"("status");

-- CreateIndex
CREATE INDEX "payment_schedule_entries_leaseId_idx" ON "payment_schedule_entries"("leaseId");

-- CreateIndex
CREATE INDEX "payment_schedule_entries_dueDate_idx" ON "payment_schedule_entries"("dueDate");

-- CreateIndex
CREATE INDEX "payment_schedule_entries_status_idx" ON "payment_schedule_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_leaseId_idx" ON "payments"("leaseId");

-- CreateIndex
CREATE INDEX "payments_scheduleEntryId_idx" ON "payments"("scheduleEntryId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paidAt_idx" ON "payments"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_declarations_paymentId_key" ON "payment_declarations"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listings_propertyId_idx" ON "listings"("propertyId");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listing_contacts_listingId_idx" ON "listing_contacts"("listingId");

-- CreateIndex
CREATE INDEX "mandates_propertyId_status_idx" ON "mandates"("propertyId", "status");

-- CreateIndex
CREATE INDEX "mandates_managerId_idx" ON "mandates"("managerId");

-- CreateIndex
CREATE INDEX "mandates_ownerId_idx" ON "mandates"("ownerId");

-- CreateIndex
CREATE INDEX "manager_reviews_managerId_idx" ON "manager_reviews"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_invoices_transactionId_key" ON "subscription_invoices"("transactionId");

-- CreateIndex
CREATE INDEX "subscription_invoices_subscriptionId_idx" ON "subscription_invoices"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_event_idx" ON "notifications"("event");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_idx" ON "audit_logs"("actorUserId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "owner_profiles" ADD CONSTRAINT "owner_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_profiles" ADD CONSTRAINT "tenant_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_profiles" ADD CONSTRAINT "tenant_profiles_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_profiles" ADD CONSTRAINT "manager_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_otps" ADD CONSTRAINT "password_reset_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_photos" ADD CONSTRAINT "property_photos_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_schedule_entries" ADD CONSTRAINT "payment_schedule_entries_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_scheduleEntryId_fkey" FOREIGN KEY ("scheduleEntryId") REFERENCES "payment_schedule_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_declarations" ADD CONSTRAINT "payment_declarations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_contacts" ADD CONSTRAINT "listing_contacts_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandates" ADD CONSTRAINT "mandates_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandates" ADD CONSTRAINT "mandates_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandates" ADD CONSTRAINT "mandates_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_mandateId_fkey" FOREIGN KEY ("mandateId") REFERENCES "mandates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
