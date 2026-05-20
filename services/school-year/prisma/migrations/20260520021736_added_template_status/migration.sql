-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('ARCHIVED', 'ACTIVE');

-- AlterTable
ALTER TABLE "SchoolYearTemplate" ADD COLUMN     "status" "TemplateStatus" NOT NULL DEFAULT 'ARCHIVED';
