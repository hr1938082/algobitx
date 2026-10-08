import Request from "@bitx/request";
import Response from "@bitx/response";
import TestEvent from "../events/TestEvent";
import Router from "@bitx/application/Router";

class HomeController {

    index(request: Request, response: Response) {
        TestEvent.dispatch(123);
        Router.url('index.test', { test: 'test', test2: 'test2' });
        return response.json({ test: request.url.href });
    }

}

export default HomeController;