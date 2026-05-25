import { Prisma, ProgramStatus } from "@prisma/client";
import { prisma } from "./prisma.js";

export class ProgramRepository {

	async getProgram(id: string) {
		return prisma.program.findFirstOrThrow({
			where: { id },

			include: {
				requiredCourses: {
					include: {
						course: true
					}
				}
			}
		});
	}

	async getAllPrograms() {
		return prisma.program.findMany({
			include: {
				requiredCourses: {
					include: {
						course: true
					}
				}
			}
		});
	}

	async createProgram(
		input: Prisma.ProgramCreateInput
	) {
		return prisma.program.create({
			data: input
		});
	}

	async updateProgram(
		id: string,
		input: Prisma.ProgramUpdateInput
	) {
		return prisma.program.update({
			where: { id },
			data: input
		});
	}

	async setProgramStatus(
		id: string,
		status: ProgramStatus
	) {

		return prisma.program.update({
			where: { id },

			data: {
				status
			}
		});
	}

	async setRequiredCoursesForProgram(
		programId: string,
		courseIds: string[]
	) {

		return prisma.$transaction(async (tx) => {

			// verify program exists
			await tx.program.findFirstOrThrow({
				where: { id: programId }
			});

			// verify all courses exist
			const courses = await tx.course.findMany({
				where: {
					id: {
						in: courseIds
					}
				}
			});

			if (courses.length !== courseIds.length) {
				throw new Error(
					"ONE_OR_MORE_COURSES_NOT_FOUND"
				);
			}

			// replace entire required course set
			await tx.programCourse.deleteMany({
				where: {
					programId
				}
			});

			if (courseIds.length > 0) {

				await tx.programCourse.createMany({
					data: courseIds.map(courseId => ({
						programId,
						courseId
					}))
				});
			}

			return tx.program.findFirstOrThrow({
				where: { id: programId },

				include: {
					requiredCourses: {
						include: {
							course: true
						}
					}
				}
			});
		});
	}
}