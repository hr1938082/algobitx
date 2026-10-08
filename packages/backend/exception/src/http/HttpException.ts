import Response from "@bitx/response";
import Exception from "../Exception";

abstract class HttpException extends Exception {

    constructor(
        message: string,
        public readonly status: number = 500,
        options?: ErrorOptions
    ) {
        super(message, options);
    }

    render(res: Response): void | Promise<void> {
        res.json({ message: this.message }, this.status);
    }
}

export default HttpException;