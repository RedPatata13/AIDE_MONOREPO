export class EnrollmentStatusError extends Error {
    constructor(message = "Status related error occured"){
        super(message);
        this.name = "StatusError"
    }
}