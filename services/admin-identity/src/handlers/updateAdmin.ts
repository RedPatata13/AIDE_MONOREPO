import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
// import { UpdateStudentInput } from "../dto/updateStudentDto";
import { UpdateAdminInput } from "../dto/updateAdminDto";
import { getDb, initializeDb } from "../db/client";
import { Admin } from "../models/admin";
import { AdminDto } from "../dto/adminDto";
import { toAdminDto } from "../mappers/mapper";
import { publishIdentityEvent } from "../events/publisher";

// import { Student } from "../models/admin";
// import { publishIdentityEvent } from "../events/publisher";
// import { StudentDto } from "../dto/adminDto";
// import { toStudentDto } from "../mappers/mapper";


export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const adminId = event.pathParameters?.adminId;

        if(!adminId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'adminId is required'
                })
            }
        }

        const input : UpdateAdminInput = JSON.parse(event.body ?? '{}');

        const db = getDb();
        await initializeDb(db);

        const updates: string[] = [];
        const values: unknown[] = [];

        let index = 1;

        if (input.username !== undefined) {
            updates.push(`username = $${index++}`);
            values.push(input.username);
        }

        if(input.email !== undefined){
            updates.push(`email = $${index++}`);
            values.push(input.email);
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

        values.push(adminId);

		const query = `
			UPDATE admins
			SET
				${updates.join(', ')}
			WHERE admin_id = $${index}
			RETURNING
				admin_id AS "adminId",
				cognito_sub AS "cognitoSub",
                username,
				email,
				status,
				created_at AS "createdAt",
				updated_at AS "updatedAt"
		`;

        const result = await db.query<Admin>(query, values);

        const admin = result.rows[0];

        if(!admin) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Admin not found'
                })
            };
        }

        await publishIdentityEvent('admin.updated', {
            adminId: admin.adminId,
            email: admin.email,
            status: admin.status
        });

        const dto: AdminDto = toAdminDto(admin);

        return {
            statusCode: 200,
            body: JSON.stringify(dto)
        }
    } catch (err) {
        console.error(`update admin error`, err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error'
            })
        }
    }
}