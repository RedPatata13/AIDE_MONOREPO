import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult
} from 'aws-lambda';

import { Pool } from 'pg';
import { getDb, initializeDb } from '../db/client';
import { Admin } from '../models/admin';
import { AdminDto } from '../dto/adminDto';
import { toAdminDto } from '../mappers/mapper';
import { publishIdentityEvent } from '../events/publisher';

export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

	try {
		const adminId = event.pathParameters?.adminId;

		if (!adminId) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: 'adminId is required'
				})
			};
		}

		const db: Pool = getDb();

		await initializeDb(db);

		const result = await db.query<Admin>(
			`
			UPDATE admins
			SET
				status = 'inactive',
				updated_at = NOW()
			WHERE admin_id = $1
			RETURNING
				admin_id AS "adminId",
				cognito_sub AS "cognitoSub",
                username,
				email,
				status,
				created_at AS "createdAt",
				updated_at AS "updatedAt"
			`,
			[adminId]
		);

		const admin = result.rows[0];

		if (!admin) {
			return {
				statusCode: 404,
				body: JSON.stringify({
					message: 'Admin not found'
				})
			};
		}

		await publishIdentityEvent('admin.deactivated', {
			adminId: admin.adminId,
			email: admin.email
		});

		const dto: AdminDto = toAdminDto(admin);

		return {
			statusCode: 200,
			body: JSON.stringify(dto)
		};

	} catch (err) {

		console.error('deactivate admin error', err);

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'Internal server error'
			})
		};
	}
};