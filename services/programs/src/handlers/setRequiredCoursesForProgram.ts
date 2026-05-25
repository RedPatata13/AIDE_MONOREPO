import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { Prisma } from "@prisma/client";
import { ProgramRepository } from "../db/programRepository.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { publishProgramEvent } from "../publisher.js";
import { NoIdError } from "../errors/noIdError.js";
import { NoBodyError } from "../errors/noBodyError.js";
import { NotAdminError } from "../errors/notAdminError.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    try {
        const id = event.pathParameters?.id;
        if (!id) throw new NoIdError();

        if (!event.body) throw new NoBodyError();

        const body = JSON.parse(event.body);

        if (!Array.isArray(body.requiredCourseIds)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "requiredCourseIds must be an array" }),
            };
        }

        const user = requireAdmin(event);
        const repo = new ProgramRepository();
        const program = await repo.setRequiredCoursesForProgram(id, body.requiredCourseIds);

        console.log(`Required courses updated for program ${id} by ${user.sub}`);
        await publishProgramEvent("program.updated", program);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Required courses updated for program ${id}` }),
        };
    } catch (err) {
        console.error(err);

        if (err instanceof NotAdminError) {
            return { statusCode: 401, body: JSON.stringify({ message: "User must be admin" }) };
        }
        if (err instanceof NotAuthorizedError) {
            return { statusCode: 401, body: JSON.stringify({ message: "Authorization Error. Please log in first." }) };
        }
        if (err instanceof NoIdError) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing required parameters: id" }) };
        }
        if (err instanceof NoBodyError) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing required parameters: body" }) };
        }
        if (err instanceof SyntaxError) {
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON body" }) };
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return { statusCode: 404, body: JSON.stringify({ message: "Program not found" }) };
        }
        if (err instanceof Error && err.message === "ONE_OR_MORE_COURSES_NOT_FOUND") {
            return { statusCode: 404, body: JSON.stringify({ message: "One or more courses not found" }) };
        }

        return { 
            statusCode: 500, 
            body: JSON.stringify({ 
                message: "Internal Server Error" 
            }) 
        };
    }
};