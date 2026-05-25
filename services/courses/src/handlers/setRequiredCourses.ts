import {
	APIGatewayProxyEventV2,
	APIGatewayProxyEventV2WithJWTAuthorizer,
	APIGatewayProxyResultV2
} from "aws-lambda";

import { CourseRepository } from "../db/repository.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { NotAdminError } from "../errors/notAdminError.js";
import { NotAuthorizedError } from "../errors/notAuthorizedError.js";

export const handler = async (
	event: APIGatewayProxyEventV2WithJWTAuthorizer
): Promise<APIGatewayProxyResultV2> => {

	try {
		const courseId = event.pathParameters?.id;
		await requireAdmin(event);

		if (!courseId) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Missing courseId in path"
				})
			};
		}

		if (!event.body) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Request body is required"
				})
			};
		}

		const body = JSON.parse(event.body);

		if (
			!Array.isArray(body.requiredCourseIds)
		) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message:
						"requiredCourseIds must be an array"
				})
			};
		}

		const repo = new CourseRepository();

		const updated =
			await repo.setRequiredCourses(
				courseId,
				body.requiredCourseIds
			);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Prerequisites updated",
				data: updated
			})
		};

	} catch (err) {

		// known domain errors
		if (err instanceof Error) {

			if (err.name === "CourseNotFoundError") {
				return {
					statusCode: 404,
					body: JSON.stringify({
						message: "Course not found"
					})
				};
			}

			if (
				err.message ===
				"ONE_OR_MORE_COURSES_NOT_FOUND"
			) {
				return {
					statusCode: 400,
					body: JSON.stringify({
						message:
							"One or more required courses do not exist"
					})
				};
			}
			if (err instanceof NotAdminError || err instanceof NotAuthorizedError){
						return {
							statusCode: 401,
							body: JSON.stringify({
								message: 'User needs to be an admin to perform this operation'
							})
						}
					}
			if (
				err.message ===
				"CIRCULAR_DEPENDENCY_DETECTED"
			) {
				return {
					statusCode: 409,
					body: JSON.stringify({
						message:
							"Circular dependency detected"
					})
				};
			}
		}

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Internal Server Error"
			})
		};
	}
};