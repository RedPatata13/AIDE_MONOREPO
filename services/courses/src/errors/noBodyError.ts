export class NoBodyError extends Error {
    constructor(message = "Missing parameters required: body"){
        super(message);
        this.name = "NoBodyError";
    }
}