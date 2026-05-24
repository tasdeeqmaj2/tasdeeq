-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TASDEEQ_ADMIN', 'TASDEEQ_FINANCE', 'CORPORATE_USER', 'CONSUMER', 'FIELD_AGENT');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('CRIMINAL', 'EMPLOYMENT', 'EDUCATION', 'ADDRESS', 'INSURANCE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'PENDING_EMPLOYEE_SUBMISSION', 'PENDING_CLIENT_REVIEW', 'IN_CART', 'PENDING_PAYMENT', 'PENDING_PAYMENT_VERIFICATION', 'ADMIN_QUEUE', 'IN_PROGRESS', 'PENDING_ADMIN_REVIEW', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "FieldAgentStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "corporate_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNo" TEXT,
    "address" TEXT,
    "isEducationInstitute" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cnic" TEXT,

    CONSTRAINT "consumers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_agents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cnic" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "FieldAgentStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "field_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnic" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_items" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "verificationType" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'DRAFT',
    "companyId" TEXT,
    "consumerId" TEXT,
    "fieldAgentId" TEXT,
    "invoiceId" TEXT,
    "selfReportToken" TEXT,
    "selfReportExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_history" (
    "id" TEXT NOT NULL,
    "verificationItemId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "actorId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_data" (
    "id" TEXT NOT NULL,
    "verificationItemId" TEXT NOT NULL,
    "employerName" TEXT,
    "employerContact" TEXT,
    "jobTitle" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "reasonForLeaving" TEXT,
    "remarks" TEXT,
    "submittedByEmployee" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "employment_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_data" (
    "id" TEXT NOT NULL,
    "verificationItemId" TEXT NOT NULL,
    "instituteName" TEXT,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "result" TEXT,
    "remarks" TEXT,
    "submittedByEmployee" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "education_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address_data" (
    "id" TEXT NOT NULL,
    "verificationItemId" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "agentRemarks" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "visitedAt" TIMESTAMP(3),

    CONSTRAINT "address_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" "PaymentMethod",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionRef" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "verificationItemId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_users_userId_key" ON "corporate_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "consumers_userId_key" ON "consumers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "field_agents_userId_key" ON "field_agents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_items_selfReportToken_key" ON "verification_items"("selfReportToken");

-- CreateIndex
CREATE UNIQUE INDEX "employment_data_verificationItemId_key" ON "employment_data"("verificationItemId");

-- CreateIndex
CREATE UNIQUE INDEX "education_data_verificationItemId_key" ON "education_data"("verificationItemId");

-- CreateIndex
CREATE UNIQUE INDEX "address_data_verificationItemId_key" ON "address_data"("verificationItemId");

-- AddForeignKey
ALTER TABLE "corporate_users" ADD CONSTRAINT "corporate_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_users" ADD CONSTRAINT "corporate_users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumers" ADD CONSTRAINT "consumers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_agents" ADD CONSTRAINT "field_agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_items" ADD CONSTRAINT "verification_items_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_items" ADD CONSTRAINT "verification_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_items" ADD CONSTRAINT "verification_items_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_items" ADD CONSTRAINT "verification_items_fieldAgentId_fkey" FOREIGN KEY ("fieldAgentId") REFERENCES "field_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_items" ADD CONSTRAINT "verification_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_verificationItemId_fkey" FOREIGN KEY ("verificationItemId") REFERENCES "verification_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_data" ADD CONSTRAINT "employment_data_verificationItemId_fkey" FOREIGN KEY ("verificationItemId") REFERENCES "verification_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_data" ADD CONSTRAINT "education_data_verificationItemId_fkey" FOREIGN KEY ("verificationItemId") REFERENCES "verification_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_data" ADD CONSTRAINT "address_data_verificationItemId_fkey" FOREIGN KEY ("verificationItemId") REFERENCES "verification_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_verificationItemId_fkey" FOREIGN KEY ("verificationItemId") REFERENCES "verification_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
