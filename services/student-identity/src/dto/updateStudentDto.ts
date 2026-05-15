export interface UpdateStudentInput {
    firstName? : string;
    lastName? : string;
    email? : string;
    enrollmentYear? : number;
    status? : 'active' | 'inactive' | 'suspended';
}