import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { Pool } from "pg";
import { getDb, initializeDb } from "../db/client";
import { Student } from "../models/student";
import { StudentDto } from "../dto/studentDto";
import { toStudentDto } from "../mappers/mapper";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const studentId = event.pathParameters?.studentId;

        if(!studentId){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'studentId is required',
                }),
            }
        }

        const db : Pool = getDb();
        await initializeDb(db);

        const result = await db.query<Student>(
            `
            SELECT
                student_ud AS "studentId",
                cognito_sub AS "cognitoSub",
                first_name AS "firstName",
                last_name AS "lastName",
                email,
                enrollment_year AS "enrollmentYear",
                status,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            FROM students
            WHERE student_id = $1
            LIMIT 1
            `,
            [studentId]
        );

        const student = result.rows[0];

        if(!student){
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: `Student not found: ${studentId}`
                })
            }
        }

        const dto : StudentDto = toStudentDto(student);

        return {
            statusCode: 200,
            body: JSON.stringify(dto),
        };
    } catch (err) {
        console.error('get studetn error' , err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            })
        }
    }
}