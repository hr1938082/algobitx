import Exception from "../Exception";

class RequestAbortedException extends Exception {
    constructor() {
        super("Request Aborted");
    }

    report(): void | Promise<void> { }

}

export default RequestAbortedException