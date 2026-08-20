import HttpException from "./HttpException";

class PayloadTooLargeException extends HttpException {
    constructor() {
        super("Payload Too Large", 413);
    }
}

export default PayloadTooLargeException