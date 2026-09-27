import BootException from "@algobitx/exception/server/BootException";
import Route, { Middleware, RouteConfig, ThrottleSymbol } from ".";
import Config from "@algobitx/config-loader";
import { join } from "node:path";
import Request, { HttpMethod } from "@algobitx/request";
import Response from "@algobitx/response";
import NotFoundException from "@algobitx/exception/http/NotFoundException";
import InternalServerException from "@algobitx/exception/http/InternalServerException";

type Action = (req: Request, res: Response) => Promise<void> | void

export type Handler = string | [any, string] | Action;

interface StaticRouteDefinition {
    middlewares: Middleware[];
    action: Action;
}

interface DynamicRouteDefinition {
    middlewares: Middleware[];
    action: Action;
    path: string;
    regex: RegExp;
    params: string[]
}

class Base {
    private staticRoutes: Map<string, StaticRouteDefinition> = new Map();
    private dynamicRoutes: Map<string, DynamicRouteDefinition[]> = new Map();
    protected currentPrefix: string = "";
    protected prefixStack: string[] = [];
    protected currentMiddlewares: Middleware[] = [];
    protected middlewareStack: Middleware[] = [];
    private controllerCache: Map<any, any> = new Map();
    protected currentController: any = null;
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


    protected normalizePath(path: string) {
        if (path === "/") return "/";
        return "/" + path.replace(/^\/|\/$/g, "");
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

    private dynamicRouteKey(path: string) {
        return path.replace(/\{([^}]+)\}/g, (_, name) => {
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
                throw new BootException(
                    new Error(`Invalid route parameter: {${name}}`)
                );
            }

            return "{}";
        });
    }

    private compileDynamicPath(path: string) {
        const params: string[] = [];

        const pattern = path.replace(
            /\{([^}]+)\}/g,
            (_, name: string) => {
                params.push(name);
                return "([^/]+)";
            }
        );

        return {
            regex: new RegExp(`^${pattern}$`),
            params
        };
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

    private routeKey(method: HttpMethod, path: string) {
        return method + ":" + path;
    }

    protected static getIns() {
        if (!this.ins) throw new BootException(
            new Error("Route has not been initialized call new Route() first")
        );

        return this.ins
    }

    protected addRoute(method: HttpMethod, path: string, handler: Handler) {
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

        const normalizedPath = this.normalizePath(
            this.prefixStack.join('') +
            this.currentPrefix +
            path
        );

        if (/\{[^}]+\}/.test(normalizedPath)) {
            let routes = this.dynamicRoutes.get(method);

            if (!routes) {
                routes = [];
                this.dynamicRoutes.set(method, routes);
            } else {
                const dynamicRouteKey = this.dynamicRouteKey(normalizedPath);

                if (routes.some(r => this.dynamicRouteKey(r.path) === dynamicRouteKey))
                    throw new BootException(
                        new Error(`Duplicate route: ${method}:${normalizedPath}`)
                    );
            }

            const { regex, params } = this.compileDynamicPath(normalizedPath);

            routes.push({
                middlewares: this.resolveManyMiddlewares([
                    ...this.middlewareStack,
                    ...this.currentMiddlewares
                ]),
                action: finalHandler,
                path: normalizedPath,
                regex,
                params
            })

        } else {
            const key = this.routeKey(method, normalizedPath);

            if (this.staticRoutes.has(key))
                throw new BootException(
                    new Error(`Duplicate route: ${method}:${normalizedPath}`)
                );


            this.staticRoutes.set(
                key,
                {
                    middlewares: this.resolveManyMiddlewares([
                        ...this.middlewareStack,
                        ...this.currentMiddlewares
                    ]),
                    action: finalHandler
                }
            );
        }


        return this;
    }

    static async resolve(req: Request, res: Response) {
        const ins = this.getIns();
        const match = ins.staticRoutes.get(ins.routeKey(req.method, req.url.path));

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

export default Base;