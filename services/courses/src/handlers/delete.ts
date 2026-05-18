import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult
} from 'aws-lambda';

import { Pool } from 'pg';
import { getDb, initializeDb } from '../db/client';
import { Course } from '../models/course';
import { CourseDto } from '../dto/courseDto';
import { toCourseDto } from '../mappers/mapper';
import { publishIdentityEvent } from '../events/publisher';
import { CourseRepository } from '../db/CourseRepository';

export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

	try {
		const courseId = event.pathParameters?.courseId;

		if (!courseId) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: 'courseId is required'
				})
			};
		}

		const db = getDb();
		await initializeDb(db);

		const repo = new CourseRepository(db);
		const course = await repo.delete(courseId);

		await publishIdentityEvent('course.deactivated', {
			courseId: course.courseId,
		});

		const dto: CourseDto = toCourseDto(course);

		return {
			statusCode: 200,
			body: JSON.stringify(dto)
		};

	} catch (err) {
		if (err instanceof Error) {
			if (err.message === 'NOT_FOUND') {
				return { statusCode: 404, body: JSON.stringify({ message: 'Course not found' })};
			}
		}
		console.error('deactivate course error', err);

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'Internal server error'
			})
		};
	}
};