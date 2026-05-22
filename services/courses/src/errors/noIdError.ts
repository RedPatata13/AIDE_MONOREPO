export class NoIdError extends Error {
    constructor(message = "Course has no ID"){
        super(message);
        this.name = "NoIdError";
    }
}