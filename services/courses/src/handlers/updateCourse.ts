import {
	APIGatewayProxyEventV2WithJWTAuthorizer,
	APIGatewayProxyResultV2
} from "aws-lambda";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { CourseRepository } from "../db/repository.js";
import { publishCourseEvent } from "../publisher/publisher.js";
import { NoIdError } from "../errors/noIdError.js";
import { NoBodyError } from "../errors/noBodyError.js";
import { NotAdminError } from "../errors/notAdminError.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";
import { NotFoundError } from "../errors/notFoundError.js";

export const handler = async (
	event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {
	try {
		const id = event.pathParameters?.id;

		if (!id) {
			throw new NoIdError();
		}

		if (!event.body) {
			throw new NoBodyError();
		}

		const body = JSON.parse(event.body);
		const user = requireAdmin(event);
		const input: Prisma.CourseUpdateInput = {};

		if (typeof body.name === "string") {
			if (body.name.trim().length === 0) {
				return {
					statusCode: 400,
					body: JSON.stringify({
						message:
							"name cannot be empty"
					})
				};
			}
			input.courseName = body.name.trim();
		}

		if (typeof body.description === "string") {
			if (
				body.description.trim().length === 0
			) {
				return {
					statusCode: 400,
					body: JSON.stringify({
						message:
							"description cannot be empty"
					})
				};
			}
			input.description =	body.description.trim();
		}
		// prevent empty update request
		if (Object.keys(input).length === 0) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message:
						"No valid fields provided for update"
				})
			};
		}

		const repo = new CourseRepository();
		const updatedCourse = await repo.update(id, input);

		console.log( `Course Updated with ID: ${updatedCourse.id} by user: ${user.sub}`);

		await publishCourseEvent("course.updated", updatedCourse);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message:
					"Course Updated with ID: " +
					updatedCourse.id,
				data: updatedCourse
			})
		};

	} catch (err) {
		console.error("Error updating course:", err);
		if (err instanceof NoIdError) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message:
						"Missing required path parameter: id"
				})
			};
		}

		if (err instanceof NoBodyError) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message:
						"Missing required request body"
				})
			};
		}

		if (err instanceof NotAdminError) {
			return {
				statusCode: 403,
				body: JSON.stringify({
					message:
						"User must be an admin to update courses"
				})
			};
		}

		if (err instanceof NotAuthorizedError) {
			return {
				statusCode: 401,
				body: JSON.stringify({
					message:
						"Authorization Error. Please log in first."
				})
			};
		}

		if (err instanceof NotFoundError) {
			return {
				statusCode: 404,
				body: JSON.stringify({
					message: "Course not found"
				})
			};
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
				message: "Internal Server Error"
			})
		};
	}
};