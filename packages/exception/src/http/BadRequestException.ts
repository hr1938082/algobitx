import HttpException from "./HttpException";

class BadRequestException extends HttpException {
    constructor(message?: string) {
        super(message ?? "Bad Request", 400);
    }

    report(): void | Promise<void> {
        console.error(this);
    }
}

export default BadRequestException