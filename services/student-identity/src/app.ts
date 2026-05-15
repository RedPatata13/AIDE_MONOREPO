import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult
} from 'aws-lambda';

import { handler as createStudent } from './handlers/create';
import { handler as getStudents } from './handlers/getStudents';
import { handler as getStudent } from './handlers/getStudent';

import { handler as updateStudent } from './handlers/update';
import { handler as deleteStudent } from './handlers/delete';

export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent,
	context,
	callback
): Promise<APIGatewayProxyResult> => {
	try {
		const { httpMethod, path } = event;

		// Normalize path
		const cleanPath = path?.replace(/\/+$/, '') || '';

		// Split path safely
		const pathParts = cleanPath.split('/').filter(Boolean);

		// Example:
		// /students -> ['students']
		// /students/123 -> ['students', '123']

		const resource = pathParts[0];
		const resourceId = pathParts[1];

		// =========================
		// HEALTH
		// =========================

		if (cleanPath === '/health' && httpMethod === 'GET') {
			return {
				statusCode: 200,
				body: JSON.stringify({
					status: 'ok',
				}),
			};
		}

		// =========================
		// STUDENTS
		// =========================

		if (resource === 'students') {

			// CREATE STUDENT
			if (httpMethod === 'POST' && !resourceId) {
				return await createStudent(event, context, callback)!;
			}

			// GET ALL STUDENTS
			if (httpMethod === 'GET' && !resourceId) {
				return await getStudents(event, context, callback)!;
			}

			// GET SINGLE STUDENT
			if (httpMethod === 'GET' && resourceId) {

				// inject normalized param
				event.pathParameters = {
					...(event.pathParameters || {}),
					studentId: resourceId,
				};

				return await getStudent(event, context, callback)!;
			}

			// UPDATE STUDENT
			if (httpMethod === 'PUT' && resourceId) {
				event.pathParameters = {
					...(event.pathParameters || {}),
					studentId: resourceId,
				};
			
				return await updateStudent(event, context, callback)!;
			}

			// DELETE STUDENT
			if (httpMethod === 'DELETE' && resourceId) {
				event.pathParameters = {
					...(event.pathParameters || {}),
					studentId: resourceId,
				};
			
				return await deleteStudent(event, context, callback)!;
			}
		}

		return {
			statusCode: 404,
			body: JSON.stringify({
				message: 'Route not found',
				path,
				method: httpMethod,
			}),
		};

	} catch (err) {
		console.error('router error', err);

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'Internal server error',
			}),
		};
	}
};