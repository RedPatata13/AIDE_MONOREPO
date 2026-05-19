import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { Pool } from "pg";
import { getDb, initializeDb } from "../db/client";
import { Course } from "../models/Program";
import { CourseDto } from "../dto/ProgramDto";
import { toCourseDto } from "../mappers/mapper";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const courseId = event.pathParameters?.studentId;

        if(!courseId){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'courseId is required',
                }),
            }
        }

        const db : Pool = getDb();
        await initializeDb(db);

        const result = await db.query<Course>(
            `
            SELECT
                course_id AS "courseId",
                cognito_sub AS "cognitoSub",
                username,
                email,
                status,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            FROM courses
            WHERE course_id = $1
            LIMIT 1
            `,
            [courseId]
        );

        const course = result.rows[0];

        if(!course){
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: `course not found: ${courseId}`
                })
            }
        }

        const dto : CourseDto = toCourseDto(course);

        return {
            statusCode: 200,
            body: JSON.stringify(dto),
        };
    } catch (err) {
        console.error('get course error' , err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            })
        }
    }
}