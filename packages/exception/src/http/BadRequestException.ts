import Response from "@algobitx/response";
import HttpException from "./HttpException";

class BadRequestException extends HttpException {
    constructor(message?: string) {
        super(message ?? "Bad Request", 400);
    }

    report(): void | Promise<void> {
        console.error(this.message);
    }

    render(res: Response): void | Promise<void> {
        res.json({ message: this.message }, this.status);
    }
}

export default BadRequestException