import Request from "@algobitx/request";
import Response from "@algobitx/response";

class HomeController {

    index(request: Request, response: Response) {
        return response.json({ test: request.url.href });
    }

}

export default HomeController;