import { prisma } from "./lib/prisma"

async function main() {
	// Create a School Year Template with Term Templates
	const schoolYearTemplate =
		await prisma.schoolYearTemplate.create({
			data: {
				templateName: "Standard College Academic Calendar",
				description:
					"Default academic structure for college programs",
                templateVersion: "1.0",
				terms: {
					create: [
						{
							name: "First Semester",
							orderNumber: 1,
							defaultStartOffsetDays: 0,
							defaultEndOffsetDays: 120,
						},
						{
							name: "Second Semester",
							orderNumber: 2,
							defaultStartOffsetDays: 130,
							defaultEndOffsetDays: 250,
						},
						{
							name: "Summer Term",
							orderNumber: 3,
							defaultStartOffsetDays: 260,
							defaultEndOffsetDays: 320,
						},
					],
				},
			},

			include: {
				terms: true,
			},
		})

	console.log(
		"Created School Year Template:",
		JSON.stringify(schoolYearTemplate, null, 2),
	)

	// Fetch all School Year Templates with their terms
	const allTemplates =
		await prisma.schoolYearTemplate.findMany({
			include: {
				terms: {
					orderBy: {
						orderNumber: "asc",
					},
				},
			},
		})

	console.log(
		"All School Year Templates:",
		JSON.stringify(allTemplates, null, 2),
	)
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)

		await prisma.$disconnect()

		process.exit(1)
	})