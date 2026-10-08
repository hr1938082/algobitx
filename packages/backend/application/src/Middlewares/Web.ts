import Request from "@bitx/request";
import Response from "@bitx/response";

const Web = async (req: Request, res: Response) => {
    req.enableSession(res);
    await req.session.start();
}

export default Web