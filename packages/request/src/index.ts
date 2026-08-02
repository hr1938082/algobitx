import { IncomingMessage } from 'node:http';
import Cookie from '@algobitx/session/Cookie';
import Session from '@algobitx/session/Session';
import Response from '@algobitx/response';
import Config from '@algobitx/config-loader';
import BadRequestException from '@algobitx/exception/http/BadRequestException';
import PayloadTooLargeException from '@algobitx/exception/http/PayloadTooLargeException';
import { isIP } from 'node:net';
import RequestAbortedException from '@algobitx/exception/server/RequestAbortedException';
import URL from '@algobitx/url';

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface StrictIncomingHttpHeaders {
    // Content negotiation
    "accept"?: string;
    "accept-encoding"?: string;
    "accept-language"?: string;

    // Authentication
    "authorization"?: string;
    "proxy-authorization"?: string;

    // Caching
    "cache-control"?: string;
    "pragma"?: string;

    // Connection
    "connection"?: string;
    "upgrade"?: string;

    // Content
    "content-length"?: string;
    "content-type"?: string;
    "content-encoding"?: string;
    "content-language"?: string;
    "content-range"?: string;

    // Cookies
    "cookie"?: string;

    // Request metadata
    "date"?: string;
    "expect"?: string;
    "forwarded"?: string;
    "from"?: string;
    "host"?: string;
    "origin"?: string;
    "referer"?: string;
    "user-agent"?: string;

    // Conditional requests
    "if-match"?: string;
    "if-modified-since"?: string;
    "if-none-match"?: string;
    "if-unmodified-since"?: string;

    // Range requests
    "range"?: string;

    // Fetch Metadata
    "sec-fetch-dest"?: string;
    "sec-fetch-mode"?: string;
    "sec-fetch-site"?: string;
    "sec-fetch-user"?: string;

    // WebSocket
    "sec-websocket-key"?: string;
    "sec-websocket-version"?: string;
    "sec-websocket-protocol"?: string;
    "sec-websocket-extensions"?: string;

    "x-forwarded-for"?: string;
    "x-forwarded-proto"?: string;
    "x-forwarded-host"?: string;
    "x-real-ip"?: string;
}

type StrictHeaderKey = keyof StrictIncomingHttpHeaders;

type StrictHeaderValue<K extends StrictHeaderKey> = StrictIncomingHttpHeaders[K];

enum BodyStatus {
    PENDING,
    PARSING,
    PARSED
}

export interface RequestOption {
    trustProxies?: '*' | string | string[],
    maxBodySize?: number // MB
}

class Request {
    private readonly raw: IncomingMessage;

    private static readonly noBodyMethods = new Set([
        "GET",
        "HEAD",
        "OPTIONS",
        "TRACE",
        "CONNECT"
    ]);

    private _url?: URL;
    private bodyStatus: BodyStatus = BodyStatus.PENDING;
    private static trustProxies: ReadonlyArray<string> = [];
    private static maxBodySize: number = 1024 * 1024; // byte
    private _body?: Record<string, unknown>;
    private _ip = "";
    private cookie?: Cookie;
    private _session?: Session;

    constructor(raw: IncomingMessage) {
        this.raw = raw;
    }

    method(): HttpMethod {
        return (this.raw.method || "GET") as HttpMethod;
    }

    get url() {
        if (!this._url) this._url = new URL(this.raw.url || "");
        return this._url;
    }

    header<K extends StrictHeaderKey>(key: K): StrictHeaderValue<K> {
        return this.raw.headers[key] as StrictHeaderValue<K>;
    }

    private static isTrustedProxy(ip: string): boolean {
        if (Request.trustProxies.length === 0) return false;
        if (Request.trustProxies.includes("*")) return true;
        return Request.trustProxies.includes(ip);
    }

    private static normalizeIP(ip: string): string {
        ip = ip.trim();
        if (ip.startsWith("::ffff:")) ip = ip.substring(7);
        return ip;
    }

    ip(): string {
        if (this._ip) return this._ip;

        const remoteAddress = Request.normalizeIP(this.raw.socket.remoteAddress || "");
        if (!Request.isTrustedProxy(remoteAddress)) return (this._ip = remoteAddress);

        const forwarded = this.header("x-forwarded-for");

        if (!forwarded) return (this._ip = remoteAddress);

        let forwardedForArr = (
            Array.isArray(forwarded)
                ? forwarded.join(',')
                : forwarded
        ).split(',');

        const validForwardedForArr: string[] = [];
        for (const ip of forwardedForArr) {
            const normalizedIP = Request.normalizeIP(ip);
            if (isIP(normalizedIP) !== 0)
                validForwardedForArr.push(normalizedIP)
        }

        if (validForwardedForArr.length === 0) return (this._ip = remoteAddress);

        validForwardedForArr.push(remoteAddress);

        for (let i = validForwardedForArr.length - 1; i >= 0; i--) {
            if (!Request.isTrustedProxy(validForwardedForArr[i])) {
                return (this._ip = validForwardedForArr[i]);
            }
        }

        return (this._ip = validForwardedForArr[0]);
    }

    static setTrustProxies(proxies: string | string[]) {
        if (this.trustProxies.length > 0)
            throw new Error("Request.setTrustProxies() can only be called once.");

        if (proxies === "*") {
            this.trustProxies = ["*"];
            return;
        }

        const list = Array.isArray(proxies) ? proxies : [proxies];

        for (const proxy of list)
            if (isIP(proxy) === 0)
                throw new Error(`Invalid trusted proxy IP: ${proxy}`);

        this.trustProxies = [...list];
    }

    static setMaxBodySize(size: number) {
        this.maxBodySize = size * 1024 * 1024;
    }

    private static isPlainObject(value: unknown): value is Record<string, unknown> {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            Object.getPrototypeOf(value) === Object.prototype
        );
    }

    async parseBody(): Promise<void> {
        if (this.bodyStatus !== BodyStatus.PENDING) return;

        const method = this.method();

        if (Request.noBodyMethods.has(method)) {
            this.bodyStatus = BodyStatus.PARSED;
            return;
        }

        this.bodyStatus = BodyStatus.PARSING;

        try {
            const lengthHeader = this.header("content-length");
            if (lengthHeader) {
                const length = Number(lengthHeader);

                if (!Number.isFinite(length) || length < 0 || !Number.isInteger(length))
                    throw new BadRequestException("Invalid Content-Length");

                if (length > Request.maxBodySize) throw new PayloadTooLargeException();
            }

            const chunks: Buffer[] = [];
            let received: number = 0;

            await new Promise<void>((resolve, reject) => {
                const onData = (chunk: Buffer) => {
                    received += chunk.length;

                    if (received > Request.maxBodySize) {
                        cleanup();
                        this.raw.destroy();
                        reject(new PayloadTooLargeException());
                        return;
                    }

                    chunks.push(chunk);
                };

                const onEnd = () => {
                    cleanup();
                    resolve();
                };

                const onError = (error: Error) => {
                    cleanup();
                    reject(error);
                };

                const onAborted = () => {
                    cleanup();
                    reject(new RequestAbortedException());
                }

                const cleanup = () => {
                    this.raw.off("data", onData);
                    this.raw.off("end", onEnd);
                    this.raw.off("error", onError);
                    this.raw.off("aborted", onAborted)
                };

                this.raw.on("data", onData);
                this.raw.once("end", onEnd);
                this.raw.once("error", onError);
                this.raw.once('aborted', onAborted)
            });

            if (chunks.length === 0) return;

            const raw = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);

            let type = (this.header('content-type') || "")
                .split(';')[0]
                .trim()
                .toLowerCase();

            if (type === "" || type === 'application/json' || type.endsWith('+json')) {

                let parsed: unknown;

                try {
                    parsed = JSON.parse(raw.toString());
                } catch {
                    throw new BadRequestException();
                }

                if (!Request.isPlainObject(parsed)) throw new BadRequestException();

                this._body = parsed;
            }
        } finally {
            this.bodyStatus = BodyStatus.PARSED;
        }
    }

    body<T extends Record<string, unknown>>(): Partial<T>;
    body<T = unknown>(key: string): T | undefined;
    body<T extends Record<string, unknown>>(...keys: (keyof T)[]): Partial<T>;
    body(...key: string[]) {
        if (!this._body) {
            if (key.length === 1) {
                return undefined;
            } else return {};
        }

        if (key.length === 1) return this._body[key[0]];

        if (key.length === 0) return this._body;

        const result: Record<string, unknown> = {};
        for (const k of key) if (k in this._body) result[k] = this._body[k];

        return result;
    }

    private enableSession(res: Response) {

        if (!this.cookie) {
            this.cookie = new Cookie(res, this.header('cookie'));
        }

        if (!this._session && this.cookie) {
            this._session = new Session(this.cookie);
        }
    }

    get session() {
        if (!this._session) {
            throw new Error("Session not enabled");
        }

        return this._session;
    }
}

export default Request