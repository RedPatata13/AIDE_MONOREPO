import { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export type AuthenticatedUser = {
	sub: string;
	email?: string;
	groups: string[];
};

export function requireAuth(
	event: APIGatewayProxyEventV2WithJWTAuthorizer
): AuthenticatedUser {

	const claims =
		event.requestContext.authorizer?.jwt?.claims;

	if (!claims) {
		throw new Error("UNAUTHORIZED");
	}

	const rawGroups =
	event.requestContext.authorizer.jwt.claims[
		"cognito:groups"
	];

    let groups: string[] = [];

    if (Array.isArray(rawGroups)) {
        groups = rawGroups.filter(
            (group): group is string =>
                typeof group === "string"
        );
    } else if (typeof rawGroups === "string") {
        groups = [rawGroups];
    }

	return {
		sub: claims.sub as string,
		email: claims.email as string | undefined,
		groups
	};
}