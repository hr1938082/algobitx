import RateLimiter from "@algobitx/rate-limiter";
import Request from "@algobitx/request";
import Response from "@algobitx/response";
import { Middleware, MiddlewareNext, ThrottleSymbol } from "../Route";
import TooManyAttemptsException from '@algobitx/exception/http/TooManyAttemptsException'

const Throttle = (attempts: number, seconds: number): Middleware => {
    const middleware = async (req: Request, res: Response, next: MiddlewareNext) => {
        const ip = req.ip.address;
        const url = req.url.path;
        const method = req.method;

        const key = `${ip}|${method}|${url}`;

        const remaining = await RateLimiter.remaining(key, attempts);

        if (remaining <= 0) {
            const timeInSeconds = await RateLimiter.availableIn(key);
            throw new TooManyAttemptsException(key, timeInSeconds);
        }

        await RateLimiter.increment(key, attempts, seconds);

        await next();
    }

    middleware[ThrottleSymbol] = true;

    return middleware;
}

export default Throttle;