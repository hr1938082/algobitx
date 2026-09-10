import { IncomingMessage } from 'node:http';
import Cookie from '@algobitx/session/Cookie';
import Session, { SessionConfig } from '@algobitx/session/Session';
import Response from '@algobitx/response';
import URL from '@algobitx/url';
import Body from './Body';
import IP from './IP';
import InternalServerException from '@algobitx/exception/http/InternalServerException';
import { HeaderKey, HeaderValue } from './Header';
import Config from '@algobitx/config-loader';
import Validator, { Bail, Message, Rules } from '@algobitx/validator';
import UnprocessableContent from '@algobitx/exception/http/UnprocessableContent';

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ValidateConfig<T extends Record<string, unknown>> = {
    rules: Rules<T>;
    messages?: Message<T>;
    bail?: boolean | Bail<T>;
}

class Request {
    private _url?: URL;
    private _body?: Body;
    private _ip?: IP;
    private _cookie?: Cookie;
    private _session?: Session;

    constructor(private readonly raw: IncomingMessage) { }

    static defineConfig(config: SessionConfig) {
        Session.defineConfig(config);
    }

    header<K extends HeaderKey>(key: K): HeaderValue<K> | undefined {
        return this.raw.headers[key] as HeaderValue<K> | undefined;
    }

    get method(): HttpMethod {
        return (this.raw.method || "GET") as HttpMethod;
    }

    get ip() {
        if (!this._ip) this._ip = new IP(this.raw);
        return this._ip;
    }

    get url() {
        if (!this._url) {
            let host = this.header('host');
            let scheme = 'http://';

            if (this.ip.isTrustedProxy) {
                host = this.header('x-forwarded-host') || host;
                const rawScheme = this.header('x-forwarded-proto');
                if (rawScheme) {
                    const forwardedProto = rawScheme
                        .split(',')[0]
                        .trim()
                        .toLowerCase();

                    if (forwardedProto === 'http' || forwardedProto === 'https')
                        scheme = `${forwardedProto}://`;

                }
            }

            const origin = host ? scheme + host : Config('app.url');
            this._url = new URL(this.raw.url || "", origin);
        }
        return this._url;
    }

    get body() {
        if (!this._body) this._body = new Body(this.raw);
        return this._body;
    }

    async validate<T extends Record<string, unknown>>(config: ValidateConfig<T>) {
        const all = await this.body.all<T>();
        const validator = Validator.define({
            values: all,
            rules: config.rules,
            messages: config.messages,
            bail: config.bail
        }).validate();
        if (validator.failed) throw new UnprocessableContent(validator.errors);
        return validator.validated;
    }

    enableSession(res: Response) {
        if (!this._cookie)
            this._cookie = new Cookie(res, this.header('cookie'));

        if (!this._session && this._cookie)
            this._session = new Session(this._cookie);

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