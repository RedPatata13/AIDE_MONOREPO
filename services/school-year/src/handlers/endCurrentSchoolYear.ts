import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearInstanceRepository } from "../db/repository.js";
import { Prisma } from "@prisma/client";
import { publishSchoolYearEvent } from "../events/publisher.js";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const repo = new SchoolYearInstanceRepository();
        const result = await repo.endCurrentSchoolYearInstance();

        result.deactivated.map(d => publishSchoolYearEvent('schoolYearInstance.deactivated', d));
        publishSchoolYearEvent('schoolYearInstance.created', result.newSchoolYear);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Current School Year ended and new School Year Generated'
            })
        }
    } catch (err) {
        if(err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025"){
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Current School Year Template cannot be found'
                    })
                }
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