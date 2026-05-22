export async function isCycleCreated(
	tx: any,
	courseId: string,
	requiredCourseId: string
): Promise<boolean> {

	const visited = new Set<string>();

	async function dfs(current: string): Promise<boolean> {

		if (current === courseId) {
			return true;
		}

		if (visited.has(current)) return false;
		visited.add(current);

		const edges = await tx.courseRequirement.findMany({
			where: {
				courseId: current
			},
			select: {
				requiredCourseId: true
			}
		});

		for (const edge of edges) {
			if (await dfs(edge.requiredCourseId)) {
				return true;
			}
		}

		return false;
	}

	return dfs(requiredCourseId);
}