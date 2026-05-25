import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { NoIdError } from "../errors/noIdError.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ProgramRepository } from "../db/programRepository.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    const id = event.pathParameters?.id;
    try {
        if (!id) throw new NoIdError();
        const user = requireAuth(event);

        const repo = new ProgramRepository();
        const program = await repo.getProgram(id);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully fetched program with Id: ${id} by user: ${user.sub}`,
                data: program
            })
        }
    } catch (err) {
        if (err instanceof NoIdError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required parameters: id'
                })
            }
        }
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