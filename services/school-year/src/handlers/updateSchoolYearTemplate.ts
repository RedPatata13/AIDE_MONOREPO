import { Prisma } from "@prisma/client";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearInstanceRepository as SchoolYearServiceRepository } from "../db/repository.js";
import { publishSchoolYearEvent, publishSchoolYearTemplateEvent } from "../events/publisher.js";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const templateId = event.pathParameters?.id;
    if (!templateId) throw new Error("NO_ID");
    try {
        const repo = new SchoolYearServiceRepository();
        if (!event.body) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Request body is required"
				})
			};
		}

		const body = JSON.parse(event.body);
        const updated = await repo.updateSchoolYearTemplate(templateId, {
			templateName: body.name,
            description: body.description
        });

        await publishSchoolYearTemplateEvent('schoolYearTemplate.updated', updated);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'School Year Template updated with id: ' + templateId
            })
        }
    } catch (err) {
        console.error(err);
        if (err instanceof Error){
            if(err.message === "NO_ID"){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Required parameters missing: id'
                    })
                }
            }
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"){
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'School Year Template not found with id: ' + templateId
                })
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error'
            })
        }
    }
}