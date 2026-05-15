export interface Student {
  studentId: string;
  cognitoSub: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentYear: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentInput {
  cognitoSub: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentYear: number;
}