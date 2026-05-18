import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { getDb, initializeDb } from '../db/client';
import { CreateCourseInput, Course } from '../models/course';
import { Pool } from 'pg';
import { publishIdentityEvent } from '../events/publisher';
import { CourseRepository } from '../db/CourseRepository';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const input: Partial<Course> = JSON.parse(event.body ?? '{}');
    const db = getDb();
    await initializeDb(db);

    const repo = new CourseRepository(db);
    const course = await repo.create(input);

    await publishIdentityEvent('course.created', course);

    return { statusCode: 201, body: JSON.stringify(course) };
  } catch (err) {
    console.error('create course error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};