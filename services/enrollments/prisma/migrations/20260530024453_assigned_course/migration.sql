/*
  Warnings:

  - You are about to drop the column `course_id` on the `CourseEnrollment` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `CourseEnrollment` table. All the data in the column will be lost.
  - Added the required column `assignedCourseId` to the `CourseEnrollment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_course_id_fkey";

-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_teacherId_fkey";

-- AlterTable
ALTER TABLE "CourseEnrollment" DROP COLUMN "course_id",
DROP COLUMN "teacherId",
ADD COLUMN     "assignedCourseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AssignedCourse" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignedCourse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssignedCourse" ADD CONSTRAINT "AssignedCourse_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedCourse" ADD CONSTRAINT "AssignedCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_assignedCourseId_fkey" FOREIGN KEY ("assignedCourseId") REFERENCES "AssignedCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
