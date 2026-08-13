import Request from "@algobitx/request";
import Response from "@algobitx/response";
import { MiddlewareNext } from "../Route"

const Web = async (req: Request, res: Response) => {
    (req as any).enableSession(res);
    await req.session.start();
}

export default Web