import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult
} from "aws-lambda";
import { SchoolYearInstanceRepository } from "../db/repository.js";
import { publishSchoolYearEvent } from "../events/publisher.js";
import { Prisma } from "@prisma/client";

export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
	try {
		if (!id) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Missing school year id"
				})
			};
		}

		if (!event.body) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Request body is required"
				})
			};
		}

		const body = JSON.parse(event.body);
        const repo = new SchoolYearInstanceRepository();

		const updated = await repo.updateSchoolYear(id, {
			name: body.name,
			startDate: body.startDate
				? new Date(body.startDate)
				: undefined,

			endDate: body.endDate
				? new Date(body.endDate)
				: undefined
		});

        publishSchoolYearEvent('schoolYearInstance.updated', updated);
        console.log("School Year updated with id: ", id);

		return {
			statusCode: 200,
			body: JSON.stringify(updated)
		};

	} catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"){
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'School Year Instance does not exist with id: ' + id
                })
            }
        }
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Internal Server Error"
			})
		};
	}
};