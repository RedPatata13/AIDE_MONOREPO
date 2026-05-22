export class NotAdminError extends Error {
    constructor(message = 'User needs to be an admin') {
        super(message);
        this.name = "NotAdminError";
    }
}