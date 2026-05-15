import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { UpdateStudentInput } from "../dto/updateStudentDto";
import { getDb, initializeDb } from "../db/client";
import { Student } from "../models/student";
import { publishIdentityEvent } from "../events/publisher";
import { StudentDto } from "../dto/studentDto";
import { toStudentDto } from "../mappers/mapper";


export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const studentId = event.pathParameters?.studentId;

        if(!studentId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'studentId is required'
                })
            }
        }

        const input : UpdateStudentInput = JSON.parse(event.body ?? '{}');

        const db = getDb();
        await initializeDb(db);

        const updates: string[] = [];
        const values: unknown[] = [];

        let index = 1;

        if (input.firstName !== undefined){
            updates.push(`first_name = $${index++}`);
            values.push(input.firstName);
        }

        if (input.lastName !== undefined) {
            updates.push(`last_name = $${index++}`);
            values.push(input.lastName);
        }

        if(input.email !== undefined){
            updates.push(`email = $${index++}`);
            values.push(input.email);
        }

        if (input.enrollmentYear !== undefined) {
            updates.push(`enrollment_year = $${index++}`);
            values.push(input.enrollmentYear);
        }

        if (input.status !== undefined) {
            updates.push(`status = $${index++}`);
            values.push(input.status);
        }

        if(updates.length === 0){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'No fields provided for update'
                })
            }
        }

        updates.push(`updated_at = NOW()`);

        values.push(studentId);

		const query = `
			UPDATE students
			SET
				${updates.join(', ')}
			WHERE student_id = $${index}
			RETURNING
				student_id AS "studentId",
				cognito_sub AS "cognitoSub",
				first_name AS "firstName",
				last_name AS "lastName",
				email,
				enrollment_year AS "enrollmentYear",
				status,
				created_at AS "createdAt",
				updated_at AS "updatedAt"
		`;

        const result = await db.query<Student>(query, values);

        const student = result.rows[0];

        if(!student) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Student not found'
                })
            };
        }

        await publishIdentityEvent('student.updated', {
            studentId: student.studentId,
            email: student.email,
            status: student.status
        });

        const dto: StudentDto = toStudentDto(student);

        return {
            statusCode: 200,
            body: JSON.stringify(dto)
        }
    } catch (err) {
        console.error(`update student error`, err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error'
            })
        }
    }
}