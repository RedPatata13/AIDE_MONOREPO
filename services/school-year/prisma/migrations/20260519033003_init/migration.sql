-- CreateEnum
CREATE TYPE "SchoolYearStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TermStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "SchoolYearTemplate" (
    "templateId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolYearTemplate_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "TermTemplate" (
    "id" TEXT NOT NULL,
    "schoolYearTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "defaultStartOffsetDays" INTEGER,
    "defaultEndOffsetDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolYearInstance" (
    "id" TEXT NOT NULL,
    "schoolYearTemplateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SchoolYearStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolYearInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "schoolYearInstanceId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "TermStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolYearTemplate_templateVersion_key" ON "SchoolYearTemplate"("templateVersion");

-- CreateIndex
CREATE UNIQUE INDEX "TermTemplate_schoolYearTemplateId_orderNumber_key" ON "TermTemplate"("schoolYearTemplateId", "orderNumber");

-- CreateIndex
CREATE INDEX "SchoolYearInstance_status_idx" ON "SchoolYearInstance"("status");

-- CreateIndex
CREATE INDEX "Term_status_idx" ON "Term"("status");

-- AddForeignKey
ALTER TABLE "TermTemplate" ADD CONSTRAINT "TermTemplate_schoolYearTemplateId_fkey" FOREIGN KEY ("schoolYearTemplateId") REFERENCES "SchoolYearTemplate"("templateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolYearInstance" ADD CONSTRAINT "SchoolYearInstance_schoolYearTemplateId_fkey" FOREIGN KEY ("schoolYearTemplateId") REFERENCES "SchoolYearTemplate"("templateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_schoolYearInstanceId_fkey" FOREIGN KEY ("schoolYearInstanceId") REFERENCES "SchoolYearInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TermTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
