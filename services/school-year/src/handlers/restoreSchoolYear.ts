import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SchoolYearInstanceRepository } from "../db/repository.js";
import { publishSchoolYearEvent } from "../events/publisher.js";
import { Prisma } from "@prisma/client";

export const handler : APIGatewayProxyHandler = async (
    event : APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.id;
    if(!id) throw new Error("NO_ID");

    try {
        const repo = new SchoolYearInstanceRepository();
        const sy = (await repo.restoreSchoolyear(id)).restored;

        await publishSchoolYearEvent('schoolYearInstance.reactivated', sy);
        console.log("School year restored with id: ", id);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully restored school year with id: ${id}`
            })
        }
    } catch (err) {
        if (err instanceof Error) {
            switch(err.message){
                case "NO_ID" :
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: "Missing required parameters: id"
                        })
                    }
                case "COMP_DATE_MISSING":
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: "Specified school year does not have a completion date:  " + id 
                        })
                    }
                case "SY_NOT_COMPLETE":
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            message: "Specified school year is not completed yet with id: " + id
                        })
                    }
            }
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message : `School year not found with id: ${id}`
                })
            }
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error"
            })
        }
    }
}