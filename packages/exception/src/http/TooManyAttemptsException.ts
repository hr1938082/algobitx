import Response from "@algobitx/response";
import HttpException from "./HttpException";

class TooManyAttemptsException extends HttpException {
    constructor(
        private readonly key: string,
        public readonly retryTimeInSeconds: number
    ) {
        super("Too Many Attempts", 429);
    }

    report(): void | Promise<void> {
        console.error(this);
    }

    override render(res: Response): void | Promise<void> {
        res.json(
            {
                message: this.message,
                retry_after_seconds: this.retryTimeInSeconds
            },
            this.status
        );
    }
}

export default TooManyAttemptsException