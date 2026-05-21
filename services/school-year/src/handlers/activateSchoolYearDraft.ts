import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearServiceRepository } from "../db/repository.js";
import { publishSchoolYearEvent } from "../events/publisher.js";
import { Prisma } from "@prisma/client";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
    try {
        if (!id) throw new Error("NO_ID");
        const repo = new SchoolYearServiceRepository();
        const schoolYear = await repo.activateSchoolYearDraft(id);

        console.log('School year Draft Activated with Id: ' + id);
        await publishSchoolYearEvent('schoolYearInstance.activated', schoolYear);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'School year Draft Activated with Id: ' + id
            })
        }
    } catch (err) {
        console.error(err);
        if (err instanceof Error){
            switch(err.message){
                case "SY_NOT_DRAFT":
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'School year does not have a status of Draft with ID: ' + id
                        })
                    }
                case "NO_ID":
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: 'Missing required parameters: id'
                        })
                    }
            }
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"){
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'School Year not Found with Id: ' + id
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