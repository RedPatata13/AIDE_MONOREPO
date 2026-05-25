export const handler = async () => {
	return {
		statusCode: 200,
		body: JSON.stringify({
			service: "school-year",
			status: "healthy"
		})
	};
};