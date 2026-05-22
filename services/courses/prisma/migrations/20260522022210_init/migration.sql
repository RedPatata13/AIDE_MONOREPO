-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CourseStatus" NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseRequirement" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "requiredCourseId" TEXT NOT NULL,

    CONSTRAINT "CourseRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseRequirement_courseId_requiredCourseId_key" ON "CourseRequirement"("courseId", "requiredCourseId");

-- AddForeignKey
ALTER TABLE "CourseRequirement" ADD CONSTRAINT "CourseRequirement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRequirement" ADD CONSTRAINT "CourseRequirement_requiredCourseId_fkey" FOREIGN KEY ("requiredCourseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
