import Config from "@algobitx/config-loader";
import URLQuery from "./URLQuery";

class URL {
    private static origin: string;
    private url: globalThis.URL;
    private _query?: URLQuery;

    constructor(url: string | globalThis.URL) {
        if (!URL.origin) URL.origin = Config('app.url');
        this.url = new globalThis.URL(url, URL.origin);
    }

    get scheme() {
        return this.url.protocol.slice(0, -1);
    }

    get hostname() {
        return this.url.hostname;
    }

    get port() {
        return this.url.port;
    }

    get host() {
        return this.url.host;
    }

    get origin() {
        return this.url.origin;
    }

    get path() {
        return this.url.pathname;
    }

    get hash() {
        return this.url.hash;
    }

    get href() {
        return this.url.href;
    }

    get search() {
        return this.url.search;
    }

    get query() {
        if (!this._query)
            this._query = new URLQuery(this.url.searchParams);
        return this._query;
    }

}

export default URL;