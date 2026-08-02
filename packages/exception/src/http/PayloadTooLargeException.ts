import Response from "@algobitx/response"
import HttpException from "./HttpException";

class PayloadTooLargeException extends HttpException {
    constructor() {
        super("Payload Too Large", 413);
    }

    report(): void | Promise<void> {
        console.error(this.message);
    }

    render(res: Response): void | Promise<void> {
        res.json({ message: this.message }, 413);
    }
}

export default PayloadTooLargeException