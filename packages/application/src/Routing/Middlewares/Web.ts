import Request from "@algobitx/request";
import Response from "@algobitx/response";

const Web = async (req: Request, res: Response) => {
    req.enableSession(res);
    await req.session.start();
}

export default Web