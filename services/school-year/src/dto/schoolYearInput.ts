import { SchoolYearStatus, SchoolYearTemplate } from "@prisma/client";

export interface SchoolYearInput {
    templateId: string;
    name: string;
    startDate: Date;
    endDate: string;
    status: SchoolYearStatus;
    schoolYearTemplate: SchoolYearTemplate
}