import { hostname } from './../../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/src/v4/core/regexes';
import { IncomingMessage } from 'node:http';
import Cookie from '@algobitx/session/Cookie';
import Session from '@algobitx/session/Session';
import Response from '@algobitx/response';
import URL from '@algobitx/url';
import Body from './Body';
import IP from './IP';
import InternalServerException from '@algobitx/exception/http/InternalServerException';
import { StrictHeaderKey, StrictHeaderValue } from './Header';
import Config from '@algobitx/config-loader';

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
        const hostname = this.header('host');
        const scheme = 'http://';
        const origin = hostname ? scheme + hostname : Config('app.url');
        if (!this._url) this._url = new URL(this.raw.url || "", origin);
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