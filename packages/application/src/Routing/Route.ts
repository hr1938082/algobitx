import Config from "@algobitx/config-loader";
import Request, { HttpMethod } from "@algobitx/request";
import { join } from "node:path";
import Response from "@algobitx/response";
import NotFoundException from '@algobitx/exception/http/NotFoundException'
import InternalServerException from "@algobitx/exception/http/InternalServerException";

export type MiddlewareNext = () => Promise<any> | any

export const ThrottleSymbol = Symbol('throttle');

export interface Middleware {
    (req: Request, res: Response, next: MiddlewareNext): unknown;

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
    private static ins: Route;

    constructor(config: RouteConfig) {
        if (Route.ins) return;
        Route.ins = this;

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
    }

    private resolveRouteFiles(path: string, prefix?: string, mw?: Middleware | Middleware[]) {
        if (prefix) this.prefixStack.push(this.normalizePath(prefix));
        if (mw) this.middlewareStack.push(...(Array.isArray(mw) ? mw : [mw]));

        try {
            require(path);
        } catch (err) {
            console.warn(`Failed to load Route file: ${path}`, err);
        }

        this.prefixStack = [];
        this.currentPrefix = '';
        this.middlewareStack = [];
        this.currentMiddlewares = [];
        this.currentController = null;

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
            } else throw new InternalServerException("Invalid Middleware!");
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
            throw new InternalServerException(`Method "${handler}" not found in controller`);
        }

        return fn.bind(instance);
    }

    private routeKey(method: HttpMethod, path: string) {
        return method + ":" + path;
    }

    private addRoute(method: HttpMethod, path: string, handler: Handler) {
        let finalHandler: Action;
        if (typeof handler === "string") {
            if (!this.currentController) throw new InternalServerException(`Controller not set for handler: ${handler}`);
            finalHandler = this.resolveHandler(this.currentController, handler);
        } else if (Array.isArray(handler)) {
            if (handler.length !== 2) throw new InternalServerException("Invalid Handler Array");
            if (!handler[0]) throw new InternalServerException("Controller not set for Handler Array");
            if (typeof handler[1] !== "string") throw new InternalServerException("Method name must be a string in Handler Array");
            if (handler[1].trim() === "") throw new InternalServerException("Method name cannot be empty in Handler Array");
            finalHandler = this.resolveHandler(handler[0], handler[1]);
        } else if (typeof handler === "function") {
            finalHandler = handler;
        } else {
            throw new InternalServerException("Invalid Handler");
        }

        this.routes.set(
            this.routeKey(method, this.normalizePath(this.prefixStack.join('') + this.currentPrefix + path)),
            {
                middlewares: this.resolveManyMiddlewares([...this.middlewareStack, ...this.currentMiddlewares]),
                action: finalHandler
            }
        );

        return this;
    }

    static prefix(prefix: string) {
        this.ins.currentPrefix = this.ins.normalizePath(prefix);
        return this;
    }

    static middleware(mw: Middleware | Middleware[]) {
        this.ins.currentMiddlewares = [...(Array.isArray(mw) ? mw : [mw])];
        return this;
    }

    static controller(controller: any) {
        this.ins.currentController = controller;
        return this;
    }

    static group(callback: () => void) {
        const prevStack = {
            prefix: [...this.ins.prefixStack],
            middlewares: [...this.ins.middlewareStack]
        }

        this.ins.prefixStack.push(this.ins.currentPrefix);
        this.ins.middlewareStack.push(...this.ins.currentMiddlewares);

        this.ins.currentPrefix = "";
        this.ins.currentMiddlewares = [];

        callback();

        this.ins.prefixStack = prevStack.prefix;
        this.ins.middlewareStack = prevStack.middlewares;
        this.ins.currentController = null;

        return this;
    }

    static get(path: string, handler: Handler) { this.ins.addRoute('GET', path, handler) }
    static post(path: string, handler: Handler) { this.ins.addRoute('POST', path, handler) }
    static put(path: string, handler: Handler) { this.ins.addRoute('PUT', path, handler) }
    static patch(path: string, handler: Handler) { this.ins.addRoute('PATCH', path, handler) }
    static delete(path: string, handler: Handler) { this.ins.addRoute('DELETE', path, handler) }

    static async resolve(req: Request, res: Response) {
        const match = this.ins.routes.get(this.ins.routeKey(req.method, req.url.path));

        if (!match) throw new NotFoundException();

        let i = 0;
        const next: MiddlewareNext = async () => {
            if (i < match.middlewares.length) {
                const mw = match.middlewares[i++];
                await mw(req, res, next);
            } else {
                await match.action(req, res);
            }
        };

        await next();
    }
}

export default Route