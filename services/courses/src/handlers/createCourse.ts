import { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { NoIdError } from "../errors/noIdError.js";
import { NoBodyError } from "../errors/noBodyError.js";
import { CourseStatus, Prisma } from "@prisma/client";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { CourseRepository } from "../db/repository.js";
import { publishCourseEvent } from "../publisher/publisher.js";
import { NotAdminError } from "../errors/notAdminError.js";

export const handler = async (
    event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
    try {
        if (!event.body) throw new NoBodyError();
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

        const input: Prisma.CourseCreateInput = {
            courseName: body.name.trim(),
            description: body.description.trim(),
            status: CourseStatus.INACTIVE
        };

        const repo = new CourseRepository();
        const course = await repo.create(input);

        console.log(`Course Created with ID: ${course.id} by user: ${user.sub}`);
        await publishCourseEvent('course.created', course);

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Course Created with ID: ' + course.id
            })
        }
    } catch (err) {
        console.error('Error creating course: ', err);
        if (err instanceof NotAdminError){
            return {
                statusCode: 403,
                body: JSON.stringify({
                    'message': 'User needs to be an admin to access this course: '
                })
            }
        }
        if (err instanceof NoBodyError){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    'message' : "Missing required parameters: body"
                })
            }
        }
        if (err instanceof SyntaxError) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Invalid JSON body"
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