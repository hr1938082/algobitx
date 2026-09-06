import Response from "@algobitx/response";
import HttpException from "./HttpException";

class UnprocessableContent extends HttpException {
    constructor(private readonly errors?: string | unknown) {
        super("Unprocessable Content", 422, { cause: errors });
    }

    override render(res: Response): void | Promise<void> {
        res.json({ message: this.message, errors: this.errors }, this.status);
    }
}

export default UnprocessableContent