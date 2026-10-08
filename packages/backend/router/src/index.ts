import Base, { Handler } from "./Base";
import Request from "@bitx/request";
import Response from "@bitx/response";
import NormalizePath from "./Helpers/NormalizePath";

export const ThrottleSymbol = Symbol('throttle');

export interface Middleware {
    (req: Request, res: Response): unknown;

    [ThrottleSymbol]?: boolean;
}

export interface RouteOptions {
    path: string
    middleware?: Middleware | Middleware[],
    prefix?: string
}

export type RouteConfig = RouteOptions | RouteOptions[];

class Router extends Base {
    static prefix(prefix: string) {
        const ins = this.getIns();
        ins.currentPrefix = NormalizePath(prefix);
        return this;
    }

    static middleware(mw: Middleware | Middleware[]) {
        const ins = this.getIns();
        ins.currentMiddlewares = [...(Array.isArray(mw) ? mw : [mw])];
        return this;
    }

    static controller(controller: any) {
        const ins = this.getIns();
        ins.currentController = controller;
        return this;
    }

    static group(callback: () => void) {
        const ins = this.getIns();
        const prevStack = {
            prefix: [...ins.prefixStack],
            middlewares: [...ins.middlewareStack]
        }

        ins.prefixStack.push(ins.currentPrefix);
        ins.middlewareStack.push(...ins.currentMiddlewares);

        ins.currentPrefix = "";
        ins.currentMiddlewares = [];

        try {
            callback();
        } finally {
            ins.prefixStack = prevStack.prefix;
            ins.middlewareStack = prevStack.middlewares;
            ins.currentController = null;
        }

        return this;
    }

    static get(path: string, handler: Handler) {
        const ins = this.getIns();
        return ins.addRoute('GET', path, handler)
    }

    static post(path: string, handler: Handler) {
        const ins = this.getIns();
        return ins.addRoute('POST', path, handler)
    }

    static put(path: string, handler: Handler) {
        const ins = this.getIns();
        return ins.addRoute('PUT', path, handler)
    }

    static patch(path: string, handler: Handler) {
        const ins = this.getIns();
        return ins.addRoute('PATCH', path, handler)
    }

    static delete(path: string, handler: Handler) {
        const ins = this.getIns();
        return ins.addRoute('DELETE', path, handler)
    }

}

export default Router