import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
// import { UpdateStudentInput } from "../dto/updateStudentDto";
import { UpdateCourseInput } from "../dto/updateCourseDto";
import { getDb, initializeDb } from "../db/client";
import { Course } from "../models/course";
import { CourseDto } from "../dto/courseDto";
import { toCourseDto } from "../mappers/mapper";
import { publishIdentityEvent } from "../events/publisher";
import { CourseRepository } from "../db/CourseRepository";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const courseId = event.pathParameters?.courseId;

        if(!courseId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'courseId is required'
                })
            }
        }

        const input : UpdateCourseInput = JSON.parse(event.body ?? '{}');

        const db = getDb();
        await initializeDb(db);

        const repo = new CourseRepository(db);
        const course = await repo.update(courseId, input);

        await publishIdentityEvent('course.updated', {
            courseId: course.courseId,
            status: course.status
        });

        const dto: CourseDto = toCourseDto(course);

        return {
            statusCode: 200,
            body: JSON.stringify(dto)
        }
    } catch (err) {
        if (err instanceof Error) {
            if (err.message === 'NO_FIELDS') {
                return {statusCode: 400, body: JSON.stringify({ message: 'No fields provied.' })};
            }
            if( err.message === 'NOT_FOUND'){
                return { statusCode: 404, body: JSON.stringify({ message: 'Course not found' })};
            }
        }
        console.error(`update course error`, err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error'
            })
        }
    }
}