import HttpException from "./HttpException";

class NotFoundException extends HttpException {
    constructor(message?: string) {
        super(message ?? "Not Found", 404);
    }
}

export default NotFoundException