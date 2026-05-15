export interface StudentDto {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	enrollmentYear: number;
	status: 'active' | 'inactive' | 'suspended';
	createdAt: string;
}