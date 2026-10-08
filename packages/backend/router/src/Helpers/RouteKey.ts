import { HttpMethod } from "@bitx/request"

const RouteKey = (method: HttpMethod, path: string) => {
    return method + ":" + path;
}

export default RouteKey