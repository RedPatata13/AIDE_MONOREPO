import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

export class CourseRepository {
	async create(
		input: Prisma.CourseCreateInput
	) {
		return prisma.course.create({
			data: input
		});
	}

	async update(
		id: string,
		input: Prisma.CourseUpdateInput
	) {
		return prisma.course.update({
			where: { id },
			data: input
		});
	}
}