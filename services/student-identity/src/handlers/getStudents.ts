import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult
} from 'aws-lambda';

import { Pool } from 'pg';

import { getDb, initializeDb } from '../db/client';
import { Student } from '../models/student';
import { StudentDto } from '../dto/studentDto';
import { toStudentDto } from '../mappers/mapper';

export const handler: APIGatewayProxyHandler = async (
	_event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	try {
		const db: Pool = getDb();

		await initializeDb(db);

		const result = await db.query<Student>(
			`
			SELECT
				student_id AS "studentId",
				cognito_sub AS "cognitoSub",
				first_name AS "firstName",
				last_name AS "lastName",
				email,
				enrollment_year AS "enrollmentYear",
				status,
				created_at AS "createdAt",
				updated_at AS "updatedAt"
			FROM students
			ORDER BY created_at DESC
			`
		);

		const students: StudentDto[] = result.rows.map(toStudentDto);

		return {
			statusCode: 200,
			body: JSON.stringify(students),
		};
	} catch (err) {
		console.error('get students error', err);

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'Internal server error',
			}),
		};
	}
};