import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { NoIdError } from "../errors/noIdError.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ProgramRepository } from "../db/programRepository.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";
import { NoBodyError } from "../errors/noBodyError.js";
import { Prisma, ProgramStatus } from "@prisma/client";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { publishProgramEvent } from "../publisher.js";

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    try {
        if(!event.body) throw new NoBodyError();

        const body = JSON.parse(event.body);
        
        if (
            typeof body.name !== "string" ||
            body.name.trim().length === 0 ||
            typeof body.description !== "string" ||
            body.description === 0 
        ) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Body is missing required parameters. Verify if body conains all of the following parameters: name, description'
                })
            }
        }

        const user = requireAdmin(event);

        const input: Prisma.ProgramCreateInput = {
            programName: body.name.trim(),
            description: body.description.trim(),
            status: ProgramStatus.INACTIVE
        };

        const repo = new ProgramRepository();
        const program = await repo.createProgram(input);

        console.log(`Program Created with ID: ${program.id} by user: ${user.sub}`);
        await publishProgramEvent('program.created', program);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully fetched program with Id: ${program.id} by user: ${user.sub}`,
                data: program
            })
        }
    } catch (err) {
        if (err instanceof NoIdError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required parameters: id'
                })
            }
        }
        if (err instanceof NotAuthorizedError) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Missing required Authorization'
                })
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error'
            })
        }
    }
}