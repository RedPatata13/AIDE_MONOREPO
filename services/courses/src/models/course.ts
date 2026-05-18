export interface Course {
    courseId: string;
    courseName: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCourseInput {
    courseName : string;
    status: 'active';
    createdAt: Date;
}