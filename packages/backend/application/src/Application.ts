import Config, { defineConfig as DefineConfig, Load } from "@algobitx/config-loader";
import Request from "@algobitx/request";
import Response from "@algobitx/response";
import { Server, createServer } from "node:http";
import { NetworkInterfaceInfo, networkInterfaces } from "node:os";
import Redis from '@algobitx/redis';
import Route, { RouteConfig } from "./Routing/Route";
import InternalServerException from "@algobitx/exception/http/InternalServerException";
import HttpException from "@algobitx/exception/http/HttpException";
import BootException from "@algobitx/exception/server/BootException";

interface ApplicationConfig {
    name: string;
    key: string;
    env: string;
    port: number;
    url: string;
    timezone: string;
    force_https: boolean;
    trust_proxies: string[];
}

class Application {
    private static ins: Application
    private server: Server;
    private shuttingDown = false;
    private isDev = false;
    private onBootCallback?: () => void | Promise<void>;

    constructor(options: RouteConfig) {
        if (Application.ins) throw new Error("Application already Initialized");
        Application.ins = this;
        this.server = this.configure(options)
    }

    private configureServer() {
        const server = createServer(async (req, res) => {
            let timer: string | undefined;

            if (this.isDev) {
                timer = `${req.method}:${req.url}:${performance.now()}`;
                console.time(timer);
            }

            const request = new Request(req);
            const response = new Response(res);
            try {
                await Route.resolve(request, response);
            } catch (err) {
                const ex = err instanceof HttpException
                    ? err
                    : new InternalServerException(err as Error);

                try {
                    ex.report();
                } catch { }

                try {
                    await ex.render(response);
                } catch (ex) {
                    if (!res.headersSent && !res.writableEnded) {
                        res.statusCode = 500;
                        res.end();
                    }
                }
            } finally {
                if (timer) console.timeEnd(timer);
            }
        });

        server.on('error', (err) => {
            new BootException(err).report();
            process.exit(1);
        })

        return server;
    }

    private configure(options: RouteConfig) {
        Load();

        this.isDev = Config('app.env') === 'development';

        new Route(options);

        return this.configureServer();
    }

    private setupGracefulShutdown() {
        const shutdown = (signal: NodeJS.Signals) => {
            if (this.shuttingDown) return;
            this.shuttingDown = true;

            console.log(`\nReceived ${signal}, shutting down gracefully...`);

            this.server.close(async (err) => {
                if (err) {
                    console.error('Error during shutdown:', err);
                    process.exit(1);
                }
                await Redis.shutdown();

                console.log('All connections closed, exiting.');
            });

            this.server.closeIdleConnections();

            setTimeout(() => {
                console.warn('Forcing shutdown after timeout...');
                this.server.closeAllConnections();
                process.exit(0);
            }, 10_000).unref();
        };

        process.once('SIGINT', () => shutdown('SIGINT'));
        process.once('SIGTERM', () => shutdown('SIGTERM'));
        process.once('SIGUSR2', () => shutdown('SIGUSR2'));
    }

    private consoleServerInfo(ip: string, port: number) {
        const color = "\x1b[32m%s\x1b[0m";
        console.log(color, `Server is listening at http://${ip}:${port}`);
    }

    private getLocalIPs(): string[] {
        const ips: string[] = [];

        const interfaces: NodeJS.Dict<NetworkInterfaceInfo[]> = networkInterfaces();

        for (const addresses of Object.values(interfaces)) {
            if (!addresses) continue;

            for (const address of addresses) {
                if (address.family === "IPv4" && !address.internal) {
                    ips.push(address.address);
                }
            }
        }

        return ips;
    }

    static defineConfig(config: ApplicationConfig) {
        DefineConfig({
            name: 'app',
            values: config,
            rules: {
                name: {
                    required: true,
                    string: true,
                    min: 3,
                    max: 50
                },
                key: {
                    required: true,
                    string: true,
                    min: 32,
                    max: 64
                },
                env: {
                    required: true,
                    string: true,
                    enum: ['development', 'production', 'test']
                },
                port: {
                    required: true,
                    integer: true,
                    min: 1,
                    max: 65535
                },
                url: {
                    required: true,
                    string: true,
                },
                timezone: {
                    required: true,
                    string: true,
                },
                force_https: {
                    required: true,
                    boolean: true
                },
                trust_proxies: {
                    required: true,
                    array: true,
                },
                'trust_proxies.*': {
                    required: true,
                    string: true,
                }
            }
        });
    }

    onBoot(callback: () => void | Promise<void>) {
        if (this.server.listening)
            throw new Error("Server Starts Listening call onBoot before start method");
        this.onBootCallback = callback;
    }

    async start() {
        if (this.onBootCallback)
            await this.onBootCallback();

        this.setupGracefulShutdown();

        const port = Config('app.port');

        this.server.listen(port, '0.0.0.0', () => {
            for (const ip of this.getLocalIPs())
                this.consoleServerInfo(ip, port);

            this.consoleServerInfo('127.0.0.1', port);
            this.consoleServerInfo('localhost', port);
        });
    }
}

export default Application;