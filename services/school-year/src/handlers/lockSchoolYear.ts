import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearInstanceRepository } from "../db/repository.js";
import { Prisma } from "@prisma/client";
import { publishSchoolYearEvent } from "../events/publisher.js";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const schoolYearId = event.pathParameters?.id;
    if(!schoolYearId) throw new Error('NO_ID');
    try {
        const repo = new SchoolYearInstanceRepository();
        const lockedSchoolyear = (await repo.lockSchoolYear(schoolYearId)).schoolYear;

        console.log(`School Year with ID is locked: ${schoolYearId}`);
        await publishSchoolYearEvent('schoolYearInstance.archived', lockedSchoolyear);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `School Year with ID is locked: ${schoolYearId}`
            })
        }
    } catch (err){
        if (err instanceof Prisma.PrismaClientKnownRequestError){
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `School year does not exist: ${schoolYearId}`
                })
            }
        }

        if (err instanceof Error && err.message == "NO_ID"){
            return {
                statusCode: 400,
                body : JSON.stringify({
                    message: "Missing required path parameters: id"
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