import Config from '@bitx/config-loader';
import URLQuery from "./URLQuery";

class URL {
    private readonly _url: globalThis.URL;
    private _query?: URLQuery;
    private static _forceHttps?: boolean;

    constructor(url: string | globalThis.URL, base?: string | globalThis.URL) {
        URL._forceHttps ??= Config('app.force_https') ?? false;
        this._url = new globalThis.URL(url, base);
        if (URL._forceHttps && this._url.protocol === 'http:') {
            this._url.protocol = 'https:'
        }
    }

    get scheme() {
        return this._url.protocol.slice(0, -1);
    }

    get isSecure() {
        return this._url.protocol === 'https:';
    }

    get hostname() {
        return this._url.hostname;
    }

    get port() {
        return this._url.port;
    }

    get host() {
        return this._url.host;
    }

    get origin() {
        return this._url.origin;
    }

    get path() {
        return this._url.pathname;
    }

    get hash() {
        return this._url.hash;
    }

    get href() {
        return this._url.href;
    }

    get search() {
        return this._url.search;
    }

    get query() {
        if (!this._query)
            this._query = new URLQuery(this._url.searchParams);
        return this._query;
    }

}

export default URL;