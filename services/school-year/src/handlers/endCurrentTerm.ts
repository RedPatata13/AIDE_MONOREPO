import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearServiceRepository } from "../db/repository.js";
import { publishTermEvent } from "../events/publisher.js";

export const handler: APIGatewayProxyHandler = async(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const repo = new SchoolYearServiceRepository();
        const deactivatedTerms = (await repo.endCurrentActiveTerms()).terms;

        await Promise.all(
            deactivatedTerms.map(dt => publishTermEvent('term.deactivated', dt))
        );

        return {
            statusCode: 200, 
            body : JSON.stringify({
                message: `${deactivatedTerms.length} Term(s) deactivated`
            })
        }
    } catch (err) {
        if (err instanceof Error && err.message === "ACTIVE_SY_NOT_FOUND"){
            return {
                statusCode: 404,
                body : JSON.stringify({
                    message: 'Active School Year Not Found'
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