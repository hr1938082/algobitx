import Response from "@algobitx/response";
import HttpException from "./HttpException";

class InternalServerException extends HttpException {
    constructor(err?: unknown) {
        super("Internal Server Error", 500);
        if (err instanceof Error) {
            this.cause = err.cause;
            this.stack = err.stack;
        } else {
            this.cause = err;
        }
    }

    report(): void | Promise<void> {
        console.error(this.stack ?? this.cause);
    }

    render(res: Response): void | Promise<void> {
        res.json({ message: this.message }, this.status);
    }
}

export default InternalServerException