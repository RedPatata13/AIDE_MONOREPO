export class NotAuthorizedError extends Error {
    constructor(message = 'User needs to be authorized') {
        super(message);
        this.name = "NotAuthorizedError";
    }
}