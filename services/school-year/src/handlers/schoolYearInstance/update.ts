import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult,
} from "aws-lambda"

// import { publishIdentityEvent } from "../events/publisher"
import { publishSchoolYearEvent } from "../../events/publisher"

import { SchoolYearInstanceRepository } from "../../db/repository"
import { UpdateSchoolYearInstanceInput } from "../../dto/schoolYearUpdateInput"
import { toSchoolYearInstanceDto } from "../../dto/schoolYearUpdateInput"


export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	try {
		const schoolYearInstanceId =
			event.pathParameters?.schoolYearInstanceId

		if (!schoolYearInstanceId) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "schoolYearInstanceId is required",
				}),
			}
		}

		const input: UpdateSchoolYearInstanceInput = JSON.parse(
			event.body ?? "{}",
		)

		const repo = new SchoolYearInstanceRepository()

		// build Prisma update payload safely
		const data: any = {}

		if (input.name) data.name = input.name
		if (input.startDate) data.startDate = new Date(input.startDate)
		if (input.endDate) data.endDate = new Date(input.endDate)
		if (input.status) data.status = input.status

		if (input.templateId) {
			data.schoolYearTemplate = {
				connect: { id: input.templateId },
			}
		}

		const updated = await repo.update(schoolYearInstanceId, data)

		await publishSchoolYearEvent("schoolYearInstance.updated", {
			id: updated.id,
			status: updated.status,
		})

		const dto = toSchoolYearInstanceDto(updated)

		return {
			statusCode: 200,
			body: JSON.stringify(dto),
		}
	} catch (err) {
		if (err instanceof Error) {
			if (err.message === "NOT_FOUND") {
				return {
					statusCode: 404,
					body: JSON.stringify({
						message: "School year instance not found",
					}),
				}
			}
		}

		console.error("update school year instance error", err)

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Internal server error",
			}),
		}
	}
}