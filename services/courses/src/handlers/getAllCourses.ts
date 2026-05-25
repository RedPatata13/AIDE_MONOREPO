import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { CourseRepository } from "../db/repository.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    try {
        await requireAuth(event);
        const repo = new CourseRepository();
        const courses = await repo.getAllCourses();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully fetched: ${courses.length} courses`
            })
        }
    } catch (err) {
        console.error('Error while fetching courses', err);
        if (err instanceof NotAuthorizedError){
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Authorization error. Please log in'
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