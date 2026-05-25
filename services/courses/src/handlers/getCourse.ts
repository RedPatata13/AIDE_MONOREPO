import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { NoIdError } from "../errors/noIdError.js";
import { CourseRepository } from "../db/repository.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    const id = event.pathParameters?.id;
    try {
        if (!id) throw new NoIdError();
        await requireAuth(event);
        const repo = new CourseRepository();
        const course = await repo.getCourse(id);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Succesfully fetched course with id: ' + id,
                data: course
            })
        }
    } catch (err) {
        console.error(`Error fetching course with id: ${id}`, err);
        if (err instanceof NotAuthorizedError){
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Not authorized'
                })
            }
        }

        if (err instanceof NoIdError){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required parameters: ' + id
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