import Exception from "../Exception";

class TimeoutException extends Exception {
    constructor(timeout: number) {
        super(`Processing timeout after ${timeout}ms.`);
    }

}

export default TimeoutException