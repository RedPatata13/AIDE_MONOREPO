import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearInstanceRepository } from "../db/repository.js";
import { publishSchoolYearEvent } from "../events/publisher.js";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const termId = event.pathParameters?.id;
    if (!termId) throw new Error("NO_ID");
    try {
        const repo = new SchoolYearInstanceRepository();
        const term = (await repo.lockTerm(termId)).term;
        publishSchoolYearEvent('term.archived', term);
        console.log('Term locked with id: ', termId);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Term archived with id: ${termId}`
            })
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Required parameters missing: id'
            })
        }
    }
}