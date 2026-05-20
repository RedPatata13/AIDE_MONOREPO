import { Prisma, SchoolYearInstance, SchoolYearStatus } from "@prisma/client"
import { prisma } from "../lib/prisma"

export class SchoolYearInstanceRepository {
	async create(input: Prisma.SchoolYearInstanceCreateInput) : Promise<SchoolYearInstance> {
		return prisma.schoolYearInstance.create({
			data: input
		})
	}
	async getById(id: string): Promise<SchoolYearInstance | null> {
		return prisma.schoolYearInstance.findUnique({
			where: { id },
		})
	}

	async getAll(): Promise<SchoolYearInstance[]> {
		return prisma.schoolYearInstance.findMany()
	}

	async update(
		id: string,
		input: Prisma.SchoolYearInstanceUpdateInput,
	): Promise<SchoolYearInstance> {
		return prisma.schoolYearInstance.update({
			where: { id },
			data: input,
		})
	}

	async delete(id: string): Promise<SchoolYearInstance> {
		return prisma.schoolYearInstance.delete({
			where: { id },
		})
	}

	async updateSchoolYearInstanceStatus(
		id: string,
		status: SchoolYearStatus,
	): Promise<SchoolYearInstance> {
		return prisma.schoolYearInstance.update({
			where: { id },
			data: {
				status,
			},
		})
	}
}