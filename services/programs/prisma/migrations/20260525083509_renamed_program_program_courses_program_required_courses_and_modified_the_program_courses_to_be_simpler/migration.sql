/*
  Warnings:

  - You are about to drop the column `isRequired` on the `ProgramCourse` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `ProgramCourse` table. All the data in the column will be lost.
  - You are about to drop the column `yearLevel` on the `ProgramCourse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProgramCourse" DROP COLUMN "isRequired",
DROP COLUMN "semester",
DROP COLUMN "yearLevel";
