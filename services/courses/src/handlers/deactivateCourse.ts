import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { NotFoundError } from "../errors/notFoundError.js";
import { CourseStatusError } from "../errors/courseStatusError.js";
import { CourseRepository } from "../db/repository.js";
import { publishCourseEvent } from "../publisher/publisher.js";
import { NoIdError } from "../errors/noIdError.js";
export const handler = async (
    event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
    const id = event.pathParameters?.id;
    try {
        // if(!id) throw new Error("NO_ID");
        if(!id) throw new NoIdError();
        const repo = new CourseRepository();
        const course = await repo.activateCourse(id);
        console.log('Course Deactivated with id: ' + id);
        publishCourseEvent('course.deactivated', course);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Course Deactivated with ID: " + id
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
        if (err instanceof NotFoundError) return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Course not found with id: ' + id
            })
        }
        if (err instanceof CourseStatusError) return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Course is not activated'
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