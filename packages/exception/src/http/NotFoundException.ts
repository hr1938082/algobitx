import Response from "@algobitx/response";
import HttpException from "./HttpException";

class NotFoundException extends HttpException {
    constructor(message?: string) {
        super(message ?? "Not Found", 404);
    }

    report(): void | Promise<void> {
        console.error(this);
    }

    render(res: Response): void | Promise<void> {
        res.json({ message: this.message }, this.status);
    }
}

export default NotFoundException