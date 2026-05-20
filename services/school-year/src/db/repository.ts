import { Prisma, SchoolYearInstance, SchoolYearStatus, TemplateStatus } from "@prisma/client"
import { prisma } from "../lib/prisma"
import { getSchoolYearFromTemplate } from "../handlers/helpers/getSYInstanceFromTemplate"

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
	async getCurrentSchoolYear() : Promise<SchoolYearInstance | null> {
		return prisma.schoolYearInstance.findFirst({
			where: { status: SchoolYearStatus.ACTIVE }
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

	async endCurrentSchoolYearInstance (){
		return prisma.$transaction(async (tx) => {
			await tx.schoolYearInstance.updateMany({
				where: {
					status: SchoolYearStatus.ACTIVE
				},
				data: {
					status: SchoolYearStatus.COMPLETED
				}
			});

			const schoolYearTemplate = await tx.schoolYearTemplate.findFirstOrThrow({
				where: {
					status: TemplateStatus.ACTIVE
				}
			});

			const instance = getSchoolYearFromTemplate(schoolYearTemplate);

			return tx.schoolYearInstance.create({
				data: instance
			})
		})
	}
}