import HttpException from "./HttpException";

class BadRequestException extends HttpException {
    constructor(message?: string) {
        super(message ?? "Bad Request", 400);
    }
}

export default BadRequestException