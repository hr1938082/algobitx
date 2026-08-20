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

export type HeaderKey = StrictHeaderKey | (string & {});

export type HeaderValue<K extends HeaderKey> =
    K extends StrictHeaderKey
    ? StrictIncomingHttpHeaders[K]
    : string | string[];