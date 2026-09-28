import BootException from "@algobitx/exception/server/BootException";
import { Middleware, ThrottleSymbol } from ".."

const ResolveMiddlewares = (mws: Middleware[]): Middleware[] => {
    const out: Middleware[] = [];
    let lastThrottle: Middleware | null = null;

    for (const mw of mws) {
        if (typeof mw === 'function') {
            if (mw[ThrottleSymbol] === true) lastThrottle = mw;
            else out.push(mw);
        } else throw new BootException(
            new Error("Invalid Middleware!")
        );
    }

    return lastThrottle ? [lastThrottle, ...out] : out;
}

export default ResolveMiddlewares