import Request from "@algobitx/request";
import Response from "@algobitx/response";
import { MiddlewareNext } from "../Route"

const Web = async (req: Request, res: Response, next: MiddlewareNext) => {
    (req as any).enableSession(res);
    await req.session.start();
    next()
}

export default Web