import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { requireAuth } from "./requireAuth.js";
import { NotAdminError } from "../errors/notAdminError.js";

export function requireAdmin(
	event: APIGatewayProxyEventV2WithJWTAuthorizer
) {
	const user = requireAuth(event);

	if (!user.groups.includes("admins")) {
		throw new NotAdminError();
	}

	return user;
}