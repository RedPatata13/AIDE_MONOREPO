import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { NoIdError } from "../errors/noIdError.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ProgramRepository } from "../db/programRepository.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    try {
        const user = requireAuth(event);

        const repo = new ProgramRepository();
        const programs = await repo.getAllPrograms();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully fetched ${programs.length} program(s) by user: ${user.sub}`,
                data: programs
            })
        }
    } catch (err) {
        if (err instanceof NotAuthorizedError) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Missing required Authorization'
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