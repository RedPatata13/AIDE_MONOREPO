export interface AdminDto {
	id: string;
	username: string;
	email: string;
	status: 'active' | 'inactive' | 'suspended';
	createdAt: string;
}