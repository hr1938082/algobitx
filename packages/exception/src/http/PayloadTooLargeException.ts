import Response from "@algobitx/response"
import HttpException from "./HttpException";

class PayloadTooLargeException extends HttpException {
    constructor() {
        super("Payload Too Large", 413);
    }

    report(): void | Promise<void> {
        console.error(this);
    }

    render(res: Response): void | Promise<void> {
        res.json({ message: this.message }, this.status);
    }
}

export default PayloadTooLargeException