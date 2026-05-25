import { EventBridgeEvent } from "aws-lambda";
import { CourseRepository } from "../../db/courseRespository.js";
import { Prisma } from "@prisma/client";

type CourseUpdatedEvent = {
	id: string;
	courseName: string;
	description: string;
	status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
};

export const handler = async (
	event: EventBridgeEvent<
		"course.updated",
		CourseUpdatedEvent
	>
) => {
	try {
		console.log(
			"COURSE UPDATED EVENT RECEIVED:",
			JSON.stringify(event, null, 2)
		);

		const detail = event.detail;

		const repo = new CourseRepository();

		const input: Prisma.CourseUpdateInput = {
			courseName: detail.courseName,
			description: detail.description,
			status: detail.status
		};

		await repo.update(detail.id, input);

		console.log(
			`Updated replicated course ${detail.id}`
		);

	} catch (err) {
		console.error(
			"Error processing course.updated event:",
			err
		);
		throw err;
	}
};