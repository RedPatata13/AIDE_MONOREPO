import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult,
} from "aws-lambda"

import { SchoolYearInstanceRepository } from "../../db/repository"
import { toCreateSchoolYearInstanceDTO } from "../../dto/schoolYearInstanceDto";

export const handler : APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id;
        if(!id) return {
            statusCode: 400,
            body: JSON.stringify({
                message: "School Year ID is empty"
            })
        }

        const repo = new SchoolYearInstanceRepository();
        const result = await repo.getById(id);
        if(!result){
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "School Year cannot be found"
                })
            }
        }

        const dto = toCreateSchoolYearInstanceDTO(result);

        return {
            statusCode: 200,
            body: JSON.stringify(dto)
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error"
            })
        }
    }
}