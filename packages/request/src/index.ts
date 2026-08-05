import { IncomingMessage } from 'node:http';
import Cookie from '@algobitx/session/Cookie';
import Session from '@algobitx/session/Session';
import Response from '@algobitx/response';
import URL from '@algobitx/url';
import Body from './Body';
import { isIP } from 'node:net';

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

export interface RequestOption {
    trustProxies?: '*' | string | string[],
}

class Request {
    private readonly raw: IncomingMessage;
    private _url?: URL;
    private _body?: Body;
    private static trustProxies: ReadonlyArray<string> = [];
    private _ip = "";
    private _cookie?: Cookie;
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

    get body() {
        if (!this._body) this._body = new Body(this.raw);
        return this._body;
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


    private enableSession(res: Response) {

        if (!this._cookie) {
            this._cookie = new Cookie(res, this.header('cookie'));
        }

        if (!this._session && this._cookie) {
            this._session = new Session(this._cookie);
        }
    }

    get session() {
        if (!this._session) {
            throw new Error("Session not enabled");
        }

        return this._session;
    }

    get cookie() {
        if (!this._cookie) {
            throw new Error("Cookie not enabled");
        }

        return this._cookie;
    }
}

export default Request