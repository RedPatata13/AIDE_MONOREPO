import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { Pool } from "pg";
import { getDb, initializeDb } from "../db/client";
import { Admin } from "../models/course";
import { AdminDto } from "../dto/adminDto";
import { toAdminDto } from "../mappers/mapper";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const db : Pool = getDb();
        await initializeDb(db);

        const result = await db.query<Admin>(
            `
            SELECT
                admin_id AS "adminId",
                cognito_sub AS "cognitoSub",
                username,
                email,
                status,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            FROM admins
            `,
        );

        const adminDtos: AdminDto[] = result.rows.map(toAdminDto);


        return {
            statusCode: 200,
            body: JSON.stringify(adminDtos),
        };
    } catch (err) {
        console.error('get admins error' , err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            })
        }
    }
}