import { IncomingMessage } from 'node:http';
import Cookie from '@algobitx/session/Cookie';
import Session from '@algobitx/session/Session';
import Response from '@algobitx/response';
import URL from '@algobitx/url';
import Body from './Body';
import IP from './IP';
import InternalServerException from '@algobitx/exception/http/InternalServerException';

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

class Request {
    private _url?: URL;
    private _body?: Body;
    private _ip?: IP;
    private _cookie?: Cookie;
    private _session?: Session;

    constructor(private readonly raw: IncomingMessage) { }

    header<K extends StrictHeaderKey>(key: K): StrictHeaderValue<K> {
        return this.raw.headers[key] as StrictHeaderValue<K>;
    }

    get method(): HttpMethod {
        return (this.raw.method || "GET") as HttpMethod;
    }

    get ip() {
        if (!this._ip) this._ip = new IP(this.raw);
        return this._ip;
    }

    get url() {
        if (!this._url) this._url = new URL(this.raw.url || "");
        return this._url;
    }

    get body() {
        if (!this._body) this._body = new Body(this.raw);
        return this._body;
    }

    enableSession(res: Response) {

        if (!this._cookie) {
            this._cookie = new Cookie(res, this.header('cookie'));
        }

        if (!this._session && this._cookie) {
            this._session = new Session(this._cookie);
        }
    }

    get cookie() {
        if (!this._cookie)
            throw new InternalServerException(
                new Error("Cookie not enabled. Call enableSession() first.")
            );

        return this._cookie;
    }

    get session() {
        if (!this._session)
            throw new InternalServerException(
                new Error("Session not enabled. Call enableSession() first.")
            );

        return this._session;
    }

}

export default Request