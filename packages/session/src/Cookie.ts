import { createHmac, timingSafeEqual } from "node:crypto";
import Config from '@algobitx/config-loader';
import Response from '@algobitx/response';

export interface CookieConfig {
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: CookieSameSite;
    path?: string;
    domain?: string;
    signed?: boolean;
    priority?: "low" | "medium" | "high";
}

class Cookie {
    private static key: string;
    private cookies: Map<string, string> = new Map();
    private outgoing: string[] = [];
    private res: Response

    constructor(res: Response, cookie?: string) {
        if (!Cookie.key) Cookie.key = Config("app.key");
        this.res = res;

        if (!cookie) return;

        for (const pair of cookie.split(";")) {
            const [name, ...rest] = pair.trim().split("=");
            if (!name) continue;

            try {
                this.cookies.set(decodeURIComponent(name), decodeURIComponent(rest.join("=")));
            } catch {
                continue;
            }
        }
    }

    private sign(value: string): string {
        return createHmac("sha256", Cookie.key).update(value).digest("base64url");
    }

    private serialize(name: string, value: string, options: CookieConfig = {}): string {
        const parts: string[] = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

        if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
        if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
        if (options.httpOnly) parts.push("HttpOnly");
        if (options.secure) parts.push("Secure");
        if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
        if (options.path) parts.push(`Path=${options.path}`);
        if (options.domain) parts.push(`Domain=${options.domain}`);
        if (options.priority) parts.push(`Priority=${options.priority}`);

        return parts.join("; ");
    }

    get(name: string, signed: boolean = false) {
        const value = this.cookies.get(name);
        if (!value) return undefined;
        if (!signed) return value;

        const index = value.lastIndexOf(".");
        if (index === -1) return undefined;

        const val = value.slice(0, index);
        const sig = value.slice(index + 1);

        const expected = this.sign(val);

        const bufA = Buffer.from(sig);
        const bufB = Buffer.from(expected);

        if (bufA.length !== bufB.length) return undefined;

        return timingSafeEqual(bufA, bufB) ? val : undefined;
    }

    set(name: string, value: string, options: CookieConfig = {}) {
        if (options.signed) {
            const signature = this.sign(value);
            value = `${value}.${signature}`;
        }

        this.cookies.set(name, value);
        this.outgoing.push(this.serialize(name, value, options));
        this.res.setHeader('set-cookie', this.outgoing);
    }

    delete(name: string, options: CookieConfig = {}) {
        const deleteOptions: CookieConfig = {
            ...options,
            expires: new Date(0),
            maxAge: 0,
        };

        this.cookies.delete(name);
        this.outgoing.push(this.serialize(name, "", deleteOptions));
        this.res.setHeader('set-cookie', this.outgoing);
    }

    clear() {
        for (const name of this.cookies.keys()) this.delete(name);
    }
}

export default Cookie;