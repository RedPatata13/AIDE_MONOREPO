export class CourseStatusError extends Error {
    constructor(message = "Course has Invalid Status for Operation"){
        super(message);
        this.name = "InvalidCourseStatusError";
    }
}