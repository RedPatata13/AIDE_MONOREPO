import {
	Prisma,
	SchoolYearTemplate,
	SchoolYearStatus,
} from "@prisma/client"

export function getSchoolYearFromTemplate(
	template: SchoolYearTemplate,
): Prisma.SchoolYearInstanceCreateInput {
	return {
		name: `SY-${new Date().getFullYear()}`,
		status: SchoolYearStatus.DRAFT,

		schoolYearTemplate: {
			connect: {
				templateId: template.templateId,
			},
		},

		startDate: new Date(),
		endDate: new Date(),
	}
}