export interface CourseDto {
	id: string;
	courseName: string;
	status: 'active' | 'inactive';
	createdAt: string;
}