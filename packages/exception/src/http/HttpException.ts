import Response from "@algobitx/response";
import Exception from "../Exception";

abstract class HttpException extends Exception {

    constructor(
        message: string,
        protected readonly status: number = 500
    ) {
        super(message);
        this.name = this.constructor.name;
    }

    abstract render(res: Response): void | Promise<void>
}

export default HttpException;