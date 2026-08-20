import Config from "@algobitx/config-loader";
import Request, { HttpMethod } from "@algobitx/request";
import { join } from "node:path";
import Response from "@algobitx/response";
import NotFoundException from '@algobitx/exception/http/NotFoundException'
import BootException from "@algobitx/exception/server/BootException";
import InternalServerException from "@algobitx/exception/http/InternalServerException";

export const ThrottleSymbol = Symbol('throttle');

export interface Middleware {
    (req: Request, res: Response): unknown;

    [ThrottleSymbol]?: boolean;
}

type Action = (req: Request, res: Response) => Promise<any> | any

type Handler = string | [any, string] | Action;

interface RouteDefinition {
    middlewares: Middleware[];
    action: Action;
}

export interface RouteOptions {
    path: string
    middleware?: Middleware | Middleware[],
    prefix?: string
}

export type RouteConfig = RouteOptions | RouteOptions[];


class Route {
    private routes: Map<string, RouteDefinition> = new Map();
    private currentPrefix: string = "";
    private prefixStack: string[] = [];
    private currentMiddlewares: Middleware[] = [];
    private middlewareStack: Middleware[] = [];
    private controllerCache: Map<any, any> = new Map();
    private currentController: any = null;
    private static ins?: Route;

    constructor(config: RouteConfig) {
        if (Route.ins)
            throw new BootException(
                new Error("Route has already been initialized")
            );

        Route.ins = this;

        try {

            const baseDir = Config('app.dir')
            if (Array.isArray(config)) {
                for (const cf of config) {
                    const fullPath = join(baseDir, cf.path);
                    this.resolveRouteFiles(fullPath, cf.prefix, cf.middleware);
                }
            } else {
                const fullPath = join(baseDir, config.path);
                this.resolveRouteFiles(fullPath, config.prefix, config.middleware);
            }
            this.controllerCache.clear();
        } catch (error) {
            Route.ins = undefined;
            throw new BootException(error);
        }
    }

    private resolveRouteFiles(path: string, prefix?: string, mw?: Middleware | Middleware[]) {
        if (prefix) this.prefixStack.push(this.normalizePath(prefix));
        if (mw) this.middlewareStack.push(...(Array.isArray(mw) ? mw : [mw]));

        try {
            require(path);
        } finally {
            this.prefixStack = [];
            this.currentPrefix = '';
            this.middlewareStack = [];
            this.currentMiddlewares = [];
            this.currentController = null;
        }
    }

    private normalizePath(path: string) {
        if (path === "/") return "/";
        return "/" + path.replace(/^\/|\/$/g, "");
    }

    private resolveManyMiddlewares(mws: Middleware[]): Middleware[] {
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

    private resolveHandler(controller: any, handler: string) {
        let instance: any;
        if (typeof controller === "function") {
            if (typeof controller[handler] === "function") {
                instance = controller;
            } else {
                instance = this.controllerCache.get(controller);
                if (!instance) {
                    instance = new controller();
                    this.controllerCache.set(controller, instance);
                }
            }
        } else {
            instance = controller;
        }

        const fn = instance[handler];

        if (typeof fn !== "function") {
            throw new BootException(
                new Error(`Method "${handler}" not found in controller`)
            );
        }

        return fn.bind(instance);
    }

    private routeKey(method: HttpMethod, path: string) {
        return method + ":" + path;
    }

    private addRoute(method: HttpMethod, path: string, handler: Handler) {
        let finalHandler: Action;
        if (typeof handler === "string") {
            if (!this.currentController) throw new BootException(
                new Error(`Controller not set for handler: ${handler}`)
            );
            finalHandler = this.resolveHandler(this.currentController, handler);
        } else if (Array.isArray(handler)) {
            if (handler.length !== 2) throw new BootException(
                new Error("Invalid Handler Array")
            );
            if (!handler[0]) throw new BootException(
                new Error("Controller not set for Handler Array")
            );
            if (typeof handler[1] !== "string") throw new BootException(
                new Error("Method name must be a string in Handler Array")
            );
            if (handler[1].trim() === "") throw new BootException(
                new Error("Method name cannot be empty in Handler Array")
            );
            finalHandler = this.resolveHandler(handler[0], handler[1]);
        } else if (typeof handler === "function") {
            finalHandler = handler;
        } else {
            throw new BootException(new Error("Invalid Handler"));
        }

        const key = this.routeKey(
            method,
            this.normalizePath(
                this.prefixStack.join('') +
                this.currentPrefix +
                path
            )
        );

        if (this.routes.has(key))
            throw new BootException(
                new Error(`Duplicate route: ${method} ${path}`)
            );


        this.routes.set(
            key,
            {
                middlewares: this.resolveManyMiddlewares([
                    ...this.middlewareStack,
                    ...this.currentMiddlewares
                ]),
                action: finalHandler
            }
        );

        return this;
    }

    private static getIns() {
        if (!this.ins) throw new BootException(
            new Error("Route has not been initialized call new Route() first")
        );

        return this.ins
    }

    static prefix(prefix: string) {
        const ins = this.getIns();
        ins.currentPrefix = ins.normalizePath(prefix);
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
        ins.addRoute('GET', path, handler)
    }

    static post(path: string, handler: Handler) {
        const ins = this.getIns();
        ins.addRoute('POST', path, handler)
    }

    static put(path: string, handler: Handler) {
        const ins = this.getIns();
        ins.addRoute('PUT', path, handler)
    }

    static patch(path: string, handler: Handler) {
        const ins = this.getIns();
        ins.addRoute('PATCH', path, handler)
    }

    static delete(path: string, handler: Handler) {
        const ins = this.getIns();
        ins.addRoute('DELETE', path, handler)
    }

    static async resolve(req: Request, res: Response) {
        const ins = this.getIns();
        const match = ins.routes.get(ins.routeKey(req.method, req.url.path));

        if (!match) throw new NotFoundException();

        for (const mw of match.middlewares) {
            await mw(req, res);
            if (res.ended) return;
        }

        await match.action(req, res);

        if (!res.ended) throw new InternalServerException(
            new Error("Response Expected")
        );
    }
}

export default Route