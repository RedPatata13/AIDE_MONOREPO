import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { getDb, initializeDb } from '../db/client';
import { CreateAdminInput, Admin } from '../models/admin';
import { Pool } from 'pg';
import { publishIdentityEvent } from '../events/publisher';

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
) : Promise<APIGatewayProxyResult> => {
    try {
        const input: CreateAdminInput = JSON.parse(event.body ?? '{}');

        const db: Pool = getDb();
        await initializeDb(db);

        const adminId = randomUUID();

        const insertResult = await db.query<Admin>(
            `INSERT INTO admins
                (admin_id, cognito_sub, username, email, status)
             VALUES
                ($1, $2, $3, $4, 'active')
             RETURNING *`,
            [
                adminId,
                input.cognitoSub,
                input.username,
                input.email,
            ]
        );

        const admin = insertResult.rows[0];

        if (!admin) {
            throw new Error('Admin insert failed — no row returned');
        }

        await publishIdentityEvent('admin.created', admin);

        return {
            statusCode: 201,
            body: JSON.stringify(admin),
        };
    } catch (err) {
        console.error('create admin error', err);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};