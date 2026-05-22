export class NotFoundError extends Error {
    constructor(message = "Course Not Found"){
        super(message);
        this.name = "CourseNotFoundError";
    }
}