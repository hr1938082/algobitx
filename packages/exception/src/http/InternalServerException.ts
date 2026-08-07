import HttpException from "./HttpException";

class InternalServerException extends HttpException {
    constructor(err?: Error) {
        super(
            "Internal Server Error",
            500,
            err ? { cause: err } : undefined
        );
    }

    report(): void | Promise<void> {
        console.error(this);
    }
}

export default InternalServerException