import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearServiceRepository } from "../db/repository.js";
import { publishTermEvent } from "../events/publisher.js";
import { Prisma } from "@prisma/client";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
    try {
        if(!id) throw new Error("NO_ID");
        const repo = new SchoolYearServiceRepository();
        const term = await repo.activateUpcomingTerm(id);
        console.log('Term activated with id: ' + id)
        await publishTermEvent('term.starts', term);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Term activated with id: ' + id
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
                                    message: 'Term does not have a status of Upcoming with ID: ' + id
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
                            message: 'Term not Found with Id: ' + id
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