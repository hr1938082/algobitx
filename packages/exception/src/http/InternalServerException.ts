import Response from "@algobitx/response";
import HttpException from "./HttpException";

class InternalServerException extends HttpException {
    constructor(err?: unknown) {
        super(
            "Internal Server Error",
            500,
            err instanceof Error
                ? { cause: err }
                : undefined
        );
    }

    report(): void | Promise<void> {
        if (this.cause instanceof Error) {
            console.error(this.cause);
        } else {
            console.error(this);
        }
    }

    render(res: Response): void | Promise<void> {
        res.json({ message: this.message }, this.status);
    }
}

export default InternalServerException