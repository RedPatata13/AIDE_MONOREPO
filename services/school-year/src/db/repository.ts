import { Prisma, SchoolYearInstance, SchoolYearStatus, TemplateStatus, TermStatus } from "@prisma/client"
import { prisma } from "../lib/prisma.js"
import { getSchoolYearFromTemplate } from "../handlers/helpers/getSYInstanceFromTemplate.js"
import { getTermsInstanceFromTemplate } from "../handlers/helpers/getTermsFromTemplate.js"

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

	async endCurrentSchoolYearInstance() {
		return prisma.$transaction(async (tx) => {
			const activeSchoolYears = 
				await tx.schoolYearInstance.findMany({
					where: {
						status: SchoolYearStatus.ACTIVE
					}
				}) ;
			await tx.schoolYearInstance.updateMany({
				where: {
					status: SchoolYearStatus.ACTIVE,
				},
				data: {
					status: SchoolYearStatus.COMPLETED,
				},
			});

			const schoolYearTemplate =
				await tx.schoolYearTemplate.findFirstOrThrow({
					where: {
						status: TemplateStatus.ACTIVE,
					},
				})

			const instance = getSchoolYearFromTemplate(schoolYearTemplate)

			const newSchoolYear =
				await tx.schoolYearInstance.create({
					data: instance,
				})

			return {
				deactivated: activeSchoolYears,
				newSchoolYear,
			}
		})
	}

	async deactivateAllTerms(schoolYearInstanceId: string) {
		return prisma.$transaction(async (tx) => {
			var activeTerms = await tx.term.findMany({
				where : { schoolYearInstanceId }
			});

			if (activeTerms.length === 0) console.warn('No active terms found. SY Instance ID: ', schoolYearInstanceId);

			await tx.term.updateMany({
				where : { schoolYearInstanceId },
				data : {
					status: TermStatus.COMPLETED
				}
			});

			return activeTerms;
		})
	}

	async generateTermsForSchoolYear(schoolYearInstanceId: string) {
		return prisma.$transaction(async (tx) => {
			const sy = await tx.schoolYearInstance.findFirstOrThrow({
				where: { id: schoolYearInstanceId },
			});

			const termTemplates = await tx.termTemplate.findMany({
				where: { schoolYearTemplateId: sy.schoolYearTemplateId}
			});

			let terms : Prisma.TermCreateManyInput[] = [];

			termTemplates.forEach(t => {
				terms.push(getTermsInstanceFromTemplate(t, sy.id));
			})

			const newTerms = await Promise.all(
				terms.map((term) =>
					tx.term.create({
						data: term,
					})
				)
			);

			return newTerms;
		})
	}

	async endCurrentActiveTerms(){
		return prisma.$transaction(async (tx) => {
			let currSchoolYear = await tx.schoolYearInstance.findFirst({
				where : {
					status: SchoolYearStatus.ACTIVE
				}
			});

			if(!currSchoolYear) throw new Error("ACTIVE_SY_NOT_FOUND");
			const terms = await tx.term.findMany({
				where : {
					schoolYearInstanceId: currSchoolYear.id,
					status: TermStatus.ACTIVE
				}
			});
			await tx.term.updateMany({
				where : { 
					schoolYearInstanceId : currSchoolYear.id ,
					status: TermStatus.ACTIVE
				},
				data: {
					status: TermStatus.COMPLETED
				}
			});

			return {
				terms,
			}
		});
	}

	async lockSchoolYear(id: string) {
		return prisma.$transaction(async (tx) => {
			const schoolYear = await tx.schoolYearInstance.findFirstOrThrow({
				where : { id }
			});
			await tx.schoolYearInstance.update({
				where : { id },
				data : {
					status: SchoolYearStatus.ARCHIVED
				}
			});

			return { schoolYear };
		})
	}

	async lockTerm(id: string) {
		return prisma.$transaction(async (tx) => {
			const term = await tx.schoolYearInstance.findFirstOrThrow({
				where : { id }
			});

			await tx.term.update({
				where : { id },
				data : {
					status: TermStatus.ARCHIVED
				}
			})

			return { term };
		})
	}
}