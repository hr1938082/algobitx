import Request from "@algobitx/request";
import Response from "@algobitx/response";
import TestEvent from "../events/TestEvent";

class HomeController {

    index(request: Request, response: Response) {
        TestEvent.dispatch(123);
        return response.json({ test: request.url.href });
    }

}

export default HomeController;