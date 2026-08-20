import Exception from "../Exception";

class RequestAbortedException extends Exception {
    constructor() {
        super("Request Aborted");
    }

    override report(): void { }

}

export default RequestAbortedException