import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult,
} from "aws-lambda"

import { SchoolYearInstanceRepository } from "../../db/repository"
import { toCreateSchoolYearInstanceDTO } from "../../dto/schoolYearInstanceDto";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const repo = new SchoolYearInstanceRepository();
        const result = (await repo.getAll()).map(toCreateSchoolYearInstanceDTO);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error"
            })
        }
    }
}