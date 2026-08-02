import Request from "@algobitx/request";
import Response from "@algobitx/response";

class HomeController {

    index(request: Request, response: Response) {
        return response.json({ test: 'test' });
    }

}

export default HomeController;