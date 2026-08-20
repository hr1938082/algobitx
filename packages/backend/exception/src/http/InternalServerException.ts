import HttpException from "./HttpException";

class InternalServerException extends HttpException {
    constructor(err?: unknown) {
        super(
            "Internal Server Error",
            500,
            err !== undefined ? { cause: err } : undefined
        );
    }
}

export default InternalServerException