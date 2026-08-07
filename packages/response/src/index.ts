import { ServerResponse } from "node:http";

export interface StrictOutgoingHttpHeaders {
    // Caching
    "cache-control": string;
    "etag": string;
    "expires": string;
    "last-modified": string;
    "pragma": string;
    "vary": string;

    // Content
    "content-disposition": string;
    "content-encoding": string;
    "content-language": string;
    "content-length": string;
    "content-location": string;
    "content-range": string;
    "content-type": string;

    // CORS
    "access-control-allow-credentials": string;
    "access-control-allow-headers": string;
    "access-control-allow-methods": string;
    "access-control-allow-origin": string;
    "access-control-expose-headers": string;
    "access-control-max-age": string;

    // Redirects
    "location": string;
    "refresh": string;

    // Cookies
    "set-cookie": string | string[];

    // WebSocket
    "sec-websocket-accept": string;
    "sec-websocket-extensions": string;
    "sec-websocket-protocol": string;

    // Authentication
    "www-authenticate": string;
    "proxy-authenticate": string;

    // Connection
    "connection": string;
    "keep-alive": string;
    "transfer-encoding": string;
    "trailer": string;
    "upgrade": string;

    // Server
    "server": string;
    "date": string;
    "retry-after": string;
    "allow": string;
    "accept-ranges": string;
    "alt-svc": string;
    "link": string;

    // Security
    "content-security-policy": string;
    "cross-origin-embedder-policy": string;
    "cross-origin-opener-policy": string;
    "cross-origin-resource-policy": string;
    "permissions-policy": string;
    "strict-transport-security": string;
    "timing-allow-origin": string;
    "x-content-type-options": string;
    "x-frame-options": string;
    "x-permitted-cross-domain-policies": string;
    "x-xss-protection": string;
}

type StrictHeaderKey = keyof StrictOutgoingHttpHeaders;

type StrictHeaderValue<K extends StrictHeaderKey> =
    StrictOutgoingHttpHeaders[K];

type HeaderKey = StrictHeaderKey | Lowercase<string>;

type HeaderValue<K extends HeaderKey> =
    K extends StrictHeaderKey
    ? StrictHeaderValue<K>
    : string | string[];

class Response {
    private readonly raw: ServerResponse;

    constructor(raw: ServerResponse) {
        this.raw = raw;
    }

    getHeader<K extends HeaderKey>(key: K): HeaderValue<K> {
        return this.raw.getHeader(key) as HeaderValue<K>;
    }

    private get canWrite() {
        return !this.raw.headersSent && !this.raw.writableEnded
    }

    setHeader<K extends HeaderKey>(name: K, value: HeaderValue<K>) {
        if (this.canWrite) this.raw.setHeader(name, value);
        return this;
    }


    private status(code: number) {
        if (this.canWrite) this.raw.statusCode = code;
        return this;
    }

    private end(data?: string | Uint8Array, callback?: () => void) {
        this.raw.end(data, callback);
    }

    json(data: unknown, statusCode: number = 200) {
        this.status(statusCode)
            .setHeader("content-type", "application/json; charset=utf-8")
            .end(JSON.stringify(data));
    }

    text(data: string, statusCode: number = 200) {
        this.status(statusCode)
            .setHeader("content-type", "text/plain; charset=utf-8")
            .end(data);
    }

}

export default Response