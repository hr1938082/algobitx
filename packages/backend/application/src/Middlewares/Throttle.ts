import RateLimiter from "@algobitx/rate-limiter";
import Request from "@algobitx/request";
import { Middleware, ThrottleSymbol } from "@algobitx/router";
import TooManyAttemptsException from '@algobitx/exception/http/TooManyAttemptsException'
import InternalServerException from "@algobitx/exception/http/InternalServerException";

const Throttle = (attempts: number, seconds: number): Middleware => {
    const middleware = async (req: Request) => {
        const ip = req.ip.address;
        const url = req.url.path;
        const method = req.method;

        const key = `${ip}|${method}|${url}`;

        try {
            const attempt = await RateLimiter.attempt(key, attempts, seconds);
            if (!attempt.status) throw new TooManyAttemptsException(key, attempt.retry_after);
        } catch (error) {
            if (error instanceof TooManyAttemptsException) throw error;

            throw new InternalServerException(error)
        }
    }

    middleware[ThrottleSymbol] = true;

    return middleware;
}

export default Throttle;