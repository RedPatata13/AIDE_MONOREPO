import {
	Prisma,
	TermStatus,
	TermTemplate,
} from "@prisma/client"

export function getTermsInstanceFromTemplate(
	template: TermTemplate,
	schoolYearInstanceId: string,
): Prisma.TermCreateManyInput {
	return {
		name: template.name,

		status: TermStatus.UPCOMING,

		orderNumber: template.orderNumber,

		schoolYearInstanceId,

		templateId: template.id,

		startDate: new Date(),

		endDate: new Date(),
	}
}