import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearInstanceRepository } from "../db/repository.js";
import { publishSchoolYearEvent } from "../events/publisher.js";

export const handler : APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const termId = event.pathParameters?.id;
    if (!termId) throw new Error("NO_ID");
    try {
        const repo = new SchoolYearInstanceRepository();
        const restored = (await repo.restoreTerm(termId)).restored;

        console.log("Term restored with ID: " + termId);
        publishSchoolYearEvent('term.archived', restored);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Term successfully restore with id: ' + termId
            })
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error'
            })
        }
    }
}