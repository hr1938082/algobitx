import Response from "@algobitx/response";
import Exception from "../Exception";

abstract class HttpException extends Exception {

    constructor(
        message: string,
        protected readonly status: number = 500,
        options?: ErrorOptions
    ) {
        super(message, options);
    }

    render(res: Response): void | Promise<void> {
        res.json({ message: this.message }, this.status);
    }
}

export default HttpException;