import { EventBridgeEvent } from "aws-lambda";
import { CourseRepository } from "../../db/respository.js";

type CourseCreatedEvent = {
	id: string;
	courseName: string;
	description: string;
	status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
};

export const handler = async (
	event: EventBridgeEvent<
		"course.created",
		CourseCreatedEvent
	>
) => {

	try {

		console.log(
			"COURSE CREATED EVENT RECEIVED:",
			JSON.stringify(event, null, 2)
		);

		const detail = event.detail;

		const repo = new CourseRepository();

		await repo.create({
			id: detail.id,
			courseName: detail.courseName,
			description: detail.description,
			status: detail.status
		});

		console.log(
			`Replicated course ${detail.id} into Program service`
		);

	} catch (err) {

		console.error(
			"Error processing course.created event:",
			err
		);

		throw err;
	}
};