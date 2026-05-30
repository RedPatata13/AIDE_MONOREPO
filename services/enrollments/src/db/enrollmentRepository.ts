import { CourseEnrollmentStatus, Prisma, ProgramEnrollmentStatus, ProgramStatus } from "@prisma/client";
import { prisma } from "./prisma.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { EnrollmentStatusError } from "../errors/statusError.js";

export class EnrollmentRepository {
    async registerStudent(student:Prisma.StudentCreateInput) {
        return await prisma.student.create({
            data: student
        });
    }

    async registerTeacher(teacher: Prisma.TeacherCreateInput){
        return await prisma.teacher.create({
            data: teacher
        })
    }

    async enrollToProgram(programId: string, studentId: string){
        return prisma.$transaction(async (tx) => {
            const program = await tx.program.findFirst({ where: { id: programId } });
            if (!program) throw new NotFoundError(`Program with id: '${programId}'`);

            const student = await tx.program.findFirst({ where: { id: studentId }});
            if (!student) throw new NotFoundError(`Student with id: '${studentId}' not found.`);

            const existingEnrollment = await tx.programEnrollment.findFirst({
                where: {
                    studentId: studentId,
                    programId: programId,
                }
            });

            if(existingEnrollment) throw new EnrollmentStatusError(`Student with Id: ${studentId} is already enrolled in Program with id: '${programId}'`);

            const programEnrollment = await tx.programEnrollment.create({
                data: {
                    programId: programId,
                    studentId: studentId,
                    status: ProgramStatus.ACTIVE,
                    currentResidency: 0
                }
            });

            return programEnrollment;
        })
    }

    async enrollToAssignedCourse(courseId: string, studentId: string){
        return prisma.$transaction(async (tx) => {
            const ac = await tx.assignedCourse.findFirst({ where: { id: courseId } });
            if (!ac) throw new NotFoundError(`assigned course with id: '${courseId}'`);

            const student = await tx.program.findFirst({ where: { id: studentId }});
            if (!student) throw new NotFoundError(`Student with id: '${studentId}' not found.`);

            const existingEnrollment = await tx.courseEnrollment.findFirst({
                where: {
                    studentId: studentId,
                    assignedCourseId: courseId
                }
            });

            if(existingEnrollment) throw new EnrollmentStatusError(`Student with Id: ${studentId} is already enrolled in assigned course with id: '${courseId}'`);

            const programEnrollment = await tx.courseEnrollment.create({
                data: {
                    assignedCourseId: courseId,
                    studentId: studentId,
                    status: CourseEnrollmentStatus.DRAFT
                }
            });

            return programEnrollment;
        })
    }
}