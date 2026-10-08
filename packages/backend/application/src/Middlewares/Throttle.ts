import RateLimiter from "@bitx/rate-limiter";
import Request from "@bitx/request";
import { Middleware, ThrottleSymbol } from "@bitx/router";
import TooManyAttemptsException from '@bitx/exception/http/TooManyAttemptsException'
import InternalServerException from "@bitx/exception/http/InternalServerException";

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