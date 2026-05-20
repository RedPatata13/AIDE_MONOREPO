import { SchoolYearStatus, SchoolYearInstance } from "@prisma/client"
import { SchoolYearInstanceDto } from "./schoolYearInstanceDto.js"

export interface UpdateSchoolYearInstanceInput {
	name?: string
	startDate?: string
	endDate?: string
	status?: SchoolYearStatus
	templateId?: string
}

export const toSchoolYearInstanceDto = (
	data: SchoolYearInstance,
): SchoolYearInstanceDto => {
	return {
		id: data.id,
		name: data.name,
		startDate: data.startDate.toISOString(),
		endDate: data.endDate.toISOString(),
		status: data.status,
	}
}