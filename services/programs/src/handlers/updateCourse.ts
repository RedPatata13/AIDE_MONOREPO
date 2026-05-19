import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
// import { UpdateStudentInput } from "../dto/updateStudentDto";
import { UpdateCourseInput } from "../dto/updateProgram";
import { getDb, initializeDb } from "../db/client";
import { Course } from "../models/Program";
import { CourseDto } from "../dto/ProgramDto";
import { toCourseDto } from "../mappers/mapper";
import { publishIdentityEvent } from "../events/publisher";
import { ProgramRepository } from "../db/ProgramRepository";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const programId = event.pathParameters?.programId;

        if(!programId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'programId is required'
                })
            }
        }

        const input : UpdateCourseInput = JSON.parse(event.body ?? '{}');

        const db = getDb();
        await initializeDb(db);

        const repo = new ProgramRepository(db);
        const program = await repo.update(programId, input);

        await publishIdentityEvent('program.updated', {
            programId: program.programId,
            status: program.status
        });

        const dto: CourseDto = toCourseDto(program);

        return {
            statusCode: 200,
            body: JSON.stringify(dto)
        }
    } catch (err) {
        if (err instanceof Error) {
            if (err.message === 'NO_FIELDS') {
                return {statusCode: 400, body: JSON.stringify({ message: 'No fields provied.' })};
            }
            if( err.message === 'NOT_FOUND'){
                return { statusCode: 404, body: JSON.stringify({ message: 'Course not found' })};
            }
        }
        console.error(`update program error`, err);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error'
            })
        }
    }
}