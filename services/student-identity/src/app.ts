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

// ----------------------
// ROUTE HELPERS
// ----------------------

const matchRoute = (path: string, pattern: RegExp) => {
	return path.match(pattern);
};

export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent,
	context,
	callback
): Promise<APIGatewayProxyResult> => {
	try {
		const { httpMethod } = event;

		// Normalize path (remove trailing slashes except root)
		const path = (event.path ?? '').replace(/\/+$/, '') || '/';

		// =========================
		// HEALTH
		// =========================

		if (path === '/health' && httpMethod === 'GET') {
			return {
				statusCode: 200,
				body: JSON.stringify({ status: 'ok' })
			};
		}

		// =========================
		// STUDENTS ROUTES
		// =========================

		// GET ALL + CREATE
		const studentsRootMatch = matchRoute(path, /^\/students$/);

		if (studentsRootMatch) {
			if (httpMethod === 'POST') {
				return createStudent(event, context, callback)!;
			}

			if (httpMethod === 'GET') {
				return getStudents(event, context, callback)!;
			}
		}

		// GET / UPDATE / DELETE BY ID
		const studentByIdMatch = matchRoute(path, /^\/students\/([^/]+)$/);

		if (studentByIdMatch) {
			const studentId = studentByIdMatch[1];

			event.pathParameters = {
				...(event.pathParameters || {}),
				studentId
			};

			if (httpMethod === 'GET') {
				return getStudent(event, context, callback)!;
			}

			if (httpMethod === 'PUT') {
				return updateStudent(event, context, callback)!;
			}

			if (httpMethod === 'DELETE') {
				return deleteStudent(event, context, callback)!;
			}
		}

		// =========================
		// NOT FOUND
		// =========================

		return {
			statusCode: 404,
			body: JSON.stringify({
				message: 'Route not found',
				path: event.path,
				method: httpMethod
			})
		};

	} catch (err) {
		console.error('router error', err);

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'Internal server error'
			})
		};
	}
};