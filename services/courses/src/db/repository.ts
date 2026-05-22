import { CourseStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { NotFoundError as CourseNotFoundError } from "../errors/notFoundError.js";
import { CourseStatusError } from "../errors/courseStatusError.js";
import { isCycleCreated } from "../helpers/courseCycleChecker.js";

export class CourseRepository{
    async create(input: Prisma.CourseCreateInput) {
        return prisma.course.create({
            data: input
        });
    }

    async update(id: string, input: Prisma.CourseUpdateInput) {
        return prisma.course.update({
            where: { id },
            data: input
        });
    }

    async getCourse(id: string) {
        const course =  await prisma.course.findFirstOrThrow({
            where: { id }
        });

        if (!course) throw new CourseNotFoundError();

        return course;
    }

    async getAllCourses() {
        return await prisma.course.findMany();
    }

    async setRequiredCourses(
	courseId: string,
	requiredCourseIds: string[]
    ) {
        return prisma.$transaction(async (tx) => {

            const course = await tx.course.findUnique({
                where: { id: courseId }
            });

            if (!course) throw new CourseNotFoundError();

            const existingCourses = await tx.course.findMany({
                where: {
                    id: { in: requiredCourseIds }
                },
                select: { id: true }
            });

            if (existingCourses.length !== requiredCourseIds.length) {
                throw new Error("ONE_OR_MORE_COURSES_NOT_FOUND");
            }

            for (const reqId of requiredCourseIds) {

                const hasCycle = await isCycleCreated(
                    tx,
                    courseId,
                    reqId
                );

                if (hasCycle) {
                    throw new Error(
                        "CIRCULAR_DEPENDENCY_DETECTED"
                    );
                }
            }

            await tx.courseRequirement.deleteMany({
                where: {
                    courseId
                }
            });

            if (requiredCourseIds.length > 0) {
                await tx.courseRequirement.createMany({
                    data: requiredCourseIds.map((reqId) => ({
                        courseId,
                        requiredCourseId: reqId
                    }))
                });
            }

            return tx.course.findUnique({
                where: { id: courseId },
                include: {
                    requiredCourses: {
                        include: {
                            requiredCourse: true
                        }
                    }
                }
            });
        });
    }

    async activateCourse(id: string) {
        return prisma.$transaction(async (tx) => {
            const course = await tx.course.findFirst({
                where: { id }
            });

            if (!course) throw new CourseNotFoundError();
            if (course.status === CourseStatus.ACTIVE) throw new CourseStatusError();

            const activatedCourse = await tx.course.update({
                where : { id },
                data: {
                    status: CourseStatus.ACTIVE
                }
            })

            return activatedCourse;
        });
    }

    async deactivateCourse(id: string) {
        return prisma.$transaction(async (tx) => {
            const course = await tx.course.findFirst({
                where: { id }
            });

            if (!course) throw new CourseNotFoundError();
            if (course.status !== CourseStatus.ACTIVE) throw new CourseStatusError();

            const deactivatedCourse = await tx.course.update({
                where : { id },
                data: {
                    status: CourseStatus.INACTIVE
                }
            })

            return deactivatedCourse;
        })
    }


}