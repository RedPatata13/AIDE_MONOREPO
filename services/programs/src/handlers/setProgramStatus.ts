import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { NoIdError } from "../errors/noIdError.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ProgramRepository } from "../db/programRepository.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";
import { NoBodyError } from "../errors/noBodyError.js";
import { Prisma, ProgramStatus } from "@prisma/client";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { publishProgramEvent } from "../publisher.js";
import { NotAdminError } from "../errors/notAdminError.js";

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    const id = event.pathParameters?.id;
    try {
        if(!id) throw new Error();
        if(!event.body) throw new NoBodyError();

        const body = JSON.parse(event.body);
        
        if(!Object.values(ProgramStatus).includes(body.status)) return {
            statusCode: 400,
            body:JSON.stringify({message:"Invalid status"})
        };
        
        const user = requireAdmin(event);

        const repo = new ProgramRepository();
        const program = await repo.setProgramStatus(id, body.status);

        console.log(`Program ${id} status updated by ${user.sub}`);
		await publishProgramEvent("program.updated", program);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Succesfully program status with Id: ${program.id} by user: ${user.sub}`,
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
        if (err instanceof NotAuthorizedError || NotAdminError) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Missing required Authorization'
                })
            }
        }
        if (err instanceof NoBodyError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required parameters: body'
                })
            }
        }

        if (err instanceof SyntaxError){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid JSON body'
                })
            }
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return { 
                statusCode: 404, 
                body: JSON.stringify({ 
                    message: "Program not found" 
                }) 
            };
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error'
            })
        }
    }
}