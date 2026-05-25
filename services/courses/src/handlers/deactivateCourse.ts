import { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { NotFoundError } from "../errors/notFoundError.js";
import { CourseStatusError } from "../errors/courseStatusError.js";
import { CourseRepository } from "../db/repository.js";
import { publishCourseEvent } from "../publisher/publisher.js";
import { NoIdError } from "../errors/noIdError.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { NotAdminError } from "../errors/notAdminError.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";
export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    const id = event.pathParameters?.id;
    try {
        // if(!id) throw new Error("NO_ID");
        if(!id) throw new NoIdError();
        await requireAdmin(event);
        const repo = new CourseRepository();
        const course = await repo.deactivateCourse(id);
        console.log('Course Deactivated with id: ' + id);
        publishCourseEvent('course.deactivated', course);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Course Deactivated with ID: " + id,
                data: course
            })
        }
    } catch (err) {
        console.log(`Error activating course with id: ${id}`);
        if (err instanceof NoIdError) return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing required parameter: id'
            })
        }
        if (err instanceof NotAdminError || err instanceof NotAuthorizedError){
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'User needs to be an admin to perform this operation'
                })
            }
        }
        if (err instanceof NotFoundError) return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Course not found with id: ' + id
            })
        }
        if (err instanceof CourseStatusError) return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Course is already not activated'
            })
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error'
            })
        }
    }
}