import HttpException from "./HttpException";

class UnAuthenticatedException extends HttpException {
    constructor(err?: unknown) {
        super(
            "Unauthenticated",
            401,
            err !== undefined ? { cause: err } : undefined
        );
    }
}

export default UnAuthenticatedException