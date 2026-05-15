import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { getDb, initializeDb } from '../db/client';
import { publishIdentityEvent } from '../events/publisher';
import { CreateStudentInput, Student } from '../models/student';
import { Pool } from 'pg';

export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent
) : Promise<APIGatewayProxyResult> => {
	try {
		const input: CreateStudentInput = JSON.parse(event.body ?? '{}');

		const db: Pool = getDb();
		await initializeDb(db);

		const studentId = randomUUID();

		// INSERT + RETURNING (Postgres best feature)
		const insertResult = await db.query<Student>(
			`INSERT INTO students
				(student_id, cognito_sub, first_name, last_name, email, enrollment_year, status)
			 VALUES
				($1, $2, $3, $4, $5, $6, 'active')
			 RETURNING *`,
			[
				studentId,
				input.cognitoSub,
				input.firstName,
				input.lastName,
				input.email,
				input.enrollmentYear
			]
		);

		const student = insertResult.rows[0];

		if (!student) {
			throw new Error('Student insert failed — no row returned');
		}

		await publishIdentityEvent('student.created', student);

		return {
			statusCode: 201,
			body: JSON.stringify(student),
		};
	} catch (err) {
		console.error('create student error', err);

		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Internal server error' }),
		};
	}
};