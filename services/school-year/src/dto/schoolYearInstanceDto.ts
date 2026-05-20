import { SchoolYearInstance, SchoolYearStatus } from "@prisma/client"

export interface CreateSchoolYearInstanceDTO {
	name: string
	startDate: string
	endDate: string
	status?: SchoolYearStatus
	templateId: string
}

export function toCreateSchoolYearInstanceDTO(instance: SchoolYearInstance) : CreateSchoolYearInstanceDTO{
    return {
        name : instance.name,
        startDate: instance.startDate.toISOString(),
        endDate: instance.endDate.toISOString(),
        status: instance.status,
        templateId: instance.schoolYearTemplateId
    }
}

export interface SchoolYearInstanceDto {
	id: string
	name: string
	startDate: string
	endDate: string
	status: string
}