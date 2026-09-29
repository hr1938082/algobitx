import BootException from "@algobitx/exception/server/BootException";
import Route, { Middleware, RouteConfig, ThrottleSymbol } from ".";
import Config from "@algobitx/config-loader";
import { join } from "node:path";
import Request, { HttpMethod } from "@algobitx/request";
import Response from "@algobitx/response";
import NotFoundException from "@algobitx/exception/http/NotFoundException";
import InternalServerException from "@algobitx/exception/http/InternalServerException";
import BadRequestException from "@algobitx/exception/http/BadRequestException";
import ResolveHandler from "./Helpers/ResolveHandler";
import ResolveMiddlewares from "./Helpers/ResolveMiddlewares";
import DynamicRouteKey from "./Helpers/DynamicRouteKey";
import NormalizePath from "./Helpers/NormalizePath";
import CompileDynamicPath from "./Helpers/CompileDynamicPath";
import RouteKey from "./Helpers/RouteKey";

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
    key: string;
    regex: RegExp;
    params: string[]
}

interface NamedRouteDefinition {
    path: string;
    params: string[];
}

export type RouteParameterValue = string | number | boolean;
export type RouteParameters = Record<string, RouteParameterValue | readonly RouteParameterValue[]>;

class Base {
    private staticRoutes: Map<string, StaticRouteDefinition> = new Map();
    private dynamicRoutes: Map<string, DynamicRouteDefinition[]> = new Map();
    protected namedRoutes: Map<string, NamedRouteDefinition> = new Map();
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

    private resolveRouteFiles(path: string, prefix?: string, mw?: Middleware | Middleware[]) {
        if (prefix) this.prefixStack.push(NormalizePath(prefix));
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
            finalHandler = ResolveHandler(this.currentController, handler, this.controllerCache);
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
            finalHandler = ResolveHandler(handler[0], handler[1], this.controllerCache);
        } else if (typeof handler === "function") {
            finalHandler = handler;
        } else {
            throw new BootException(new Error("Invalid Handler"));
        }

        const normalizedPath = NormalizePath(
            this.prefixStack.join('') +
            this.currentPrefix +
            path
        );

        let params: string[] = [];

        if (/\{[^}]+\}/.test(normalizedPath)) {
            let routes = this.dynamicRoutes.get(method);

            if (!routes) {
                routes = [];
                this.dynamicRoutes.set(method, routes);
            }

            const dynamicRouteKey = DynamicRouteKey(normalizedPath);
            if (routes.some(r => r.key === dynamicRouteKey))
                throw new BootException(
                    new Error(`Duplicate route: ${method}:${normalizedPath}`)
                );

            const compiledPath = CompileDynamicPath(normalizedPath);
            params = compiledPath.params;

            routes.push({
                middlewares: ResolveMiddlewares([
                    ...this.middlewareStack,
                    ...this.currentMiddlewares
                ]),
                action: finalHandler,
                path: normalizedPath,
                key: dynamicRouteKey,
                regex: compiledPath.regex,
                params
            })

        } else {
            const key = RouteKey(method, normalizedPath);
            if (this.staticRoutes.has(key))
                throw new BootException(
                    new Error(`Duplicate route: ${method}:${normalizedPath}`)
                );

            this.staticRoutes.set(
                key,
                {
                    middlewares: ResolveMiddlewares([
                        ...this.middlewareStack,
                        ...this.currentMiddlewares
                    ]),
                    action: finalHandler
                }
            );
        }

        return {
            name: (name: string) => this.name(name, normalizedPath, params)
        }
    }

    private name(name: string, path: string, params: string[]) {
        const normalizedName = name.trim();

        if (!normalizedName) throw new BootException(
            new Error("Route name cannot be empty")
        );

        if (this.namedRoutes.has(normalizedName)) throw new BootException(
            new Error(`Duplicate route name: ${normalizedName}`)
        );

        this.namedRoutes.set(normalizedName, {
            path,
            params
        });
    }


    static url(name: string, parameters: RouteParameters = {}) {
        const ins = this.getIns();
        const route = ins.namedRoutes.get(name);

        if (!route) {
            throw new BootException(
                new Error(`Route [${name}] not found`)
            );
        }

        const used = new Set<string>();
        const path = route.path.replace(/\{([^}]+)\}/g, (_, parameter: string) => {
            const value = parameters[parameter];
            if (
                value === undefined ||
                value === null
            ) {
                throw new BootException(
                    new Error(`Missing route parameter: ${parameter}`)
                );
            }

            if (Array.isArray(value)) {
                throw new BootException(
                    new Error(`Route parameter cannot be an array: ${parameter}`)
                );
            }

            used.add(parameter);
            return encodeURIComponent(String(parameters[parameter]));
        });

        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(parameters)) {
            if (used.has(key) || value === undefined || value === null) continue;

            if (Array.isArray(value)) {
                for (const item of value) query.append(key, String(item));
            } else {
                query.append(key, String(value));
            }
        }

        const queryString = query.toString();
        return queryString ? `${path}?${queryString}` : path;
    }


    static async resolve(req: Request, res: Response) {
        const ins = this.getIns();
        let match = ins.staticRoutes.get(RouteKey(req.method, req.url.path));
        if (!match) {
            const dynamicRoutes = ins.dynamicRoutes.get(req.method);

            if (!dynamicRoutes) throw new NotFoundException();

            for (const dynamicRoute of dynamicRoutes) {
                const dMatch = dynamicRoute.regex.exec(req.url.path);

                if (!dMatch) continue;

                for (let i = 0; i < dynamicRoute.params.length; i++) {
                    try {
                        req.params.set(dynamicRoute.params[i], decodeURIComponent(dMatch[i + 1]));
                    } catch (error) {
                        throw new BadRequestException("Malformed URI");
                    }
                }

                match = {
                    middlewares: dynamicRoute.middlewares,
                    action: dynamicRoute.action
                }

                break;
            }
        }

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