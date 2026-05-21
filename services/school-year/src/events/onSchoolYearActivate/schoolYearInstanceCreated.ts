import { APIGatewayProxyResult, EventBridgeEvent } from "aws-lambda"
import { publishTermEvent } from "../publisher.js";
import { SchoolYearServiceRepository } from "../../db/repository.js";
import { Prisma } from "@prisma/client";

export const handler = async (event: EventBridgeEvent<string, any>): Promise<APIGatewayProxyResult>  => {
    try {
        console.log(`EVENT RECEIVED`, JSON.stringify(event, null, 2));

        const schoolYear = event.detail;

        console.log(`School Year Created: `, schoolYear);

        const repo = new SchoolYearServiceRepository();
        const terms = await repo.generateTermsForSchoolYear(schoolYear.id ?? "Missing ID");

        await Promise.all(
            terms.map(t => publishTermEvent('term.created', t))
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'processed' })
        };
    } catch (err) {
        if(err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025"){
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Current School Year Template cannot be found'
                    })
                }
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        }
    }
}