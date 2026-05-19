export interface UpdateCourseInput {
    username?: string;
    email? : string;
    status? : 'active' | 'inactive';
}