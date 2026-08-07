import HttpException from "./HttpException";

class PayloadTooLargeException extends HttpException {
    constructor() {
        super("Payload Too Large", 413);
    }

    report(): void | Promise<void> {
        console.error(this);
    }
}

export default PayloadTooLargeException