import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult,
} from "aws-lambda"

import { SchoolYearInstanceRepository } from "../../db/repository"
import { SchoolYearInput } from "../../dto/schoolYearInput"

export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	try {
		if (!event.body) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Missing request body",
				}),
			}
		}

		const input: SchoolYearInput = JSON.parse(event.body)

		const repo = new SchoolYearInstanceRepository()

        const data = {
            name: input.name,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            status: input.status ?? "DRAFT",

            schoolYearTemplate: {
                connect: { templateId: input.templateId },
            },
        };

        const created = await repo.create(data);

		return {
			statusCode: 201,
			body: JSON.stringify(created),
		}
	} catch (err) {
		console.error(err)

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Internal server error",
			}),
		}
	}
}