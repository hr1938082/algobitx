import Config, { Load } from "@algobitx/config-loader";
import Request from "@algobitx/request";
import Response from "@algobitx/response";
import { Server, createServer } from "node:http";
import { NetworkInterfaceInfo, networkInterfaces } from "node:os";
import Redis from '@algobitx/redis';
import Route, { RouteConfig } from "./Routing/Route";
import Exception from "@algobitx/exception/Exception";
import InternalServerException from "@algobitx/exception/http/InternalServerException";
import HttpException from "@algobitx/exception/http/HttpException";

class Application {
    private server: Server;
    private shuttingDown = false;
    private isDev = false;

    constructor(options: RouteConfig) {
        this.server = this.configure(options)
    }

    private configureServer() {
        return createServer(async (req, res) => {
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
                const ex = err instanceof Exception
                    ? err
                    : new InternalServerException(err as Error);

                try {
                    await ex.report();
                } catch { }

                if (ex instanceof HttpException) {
                    try {
                        await ex.render(response);
                    } catch (ex) {

                        console.error(ex);

                        if (!res.headersSent) {
                            res.statusCode = 500;
                            res.end();
                        }
                    }
                }
            } finally {
                if (timer) console.timeEnd(timer);
            }
        });
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

                try {
                    await Redis.shutdown();
                }
                catch (err) {
                    console.error(err);
                }

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

    start() {
        const port = Config('app.port');
        this.server.listen(port, '0.0.0.0', () => {
            for (const ip of this.getLocalIPs())
                this.consoleServerInfo(ip, port);

            this.consoleServerInfo('127.0.0.1', port);
            this.consoleServerInfo('localhost', port);
            this.setupGracefulShutdown();
        });
    }
}

export default Application;