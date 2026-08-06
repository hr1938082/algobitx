import Config from "@algobitx/config-loader";
import InternalServerException from "@algobitx/exception/http/InternalServerException";
import ipaddr from "ipaddr.js";
import { IncomingMessage } from "node:http";

type CIDR = [ipaddr.IPv4 | ipaddr.IPv6, number];
type TrustedProxy = "*" | string | CIDR;

class IP {
    // private 
    private static trustProxies: Set<TrustedProxy>;
    private _address?: string;
    private _chain?: string[];


    constructor(private readonly request: IncomingMessage) {
        if (!IP.trustProxies) IP.loadTrustProxies();
    }

    private static loadTrustProxies() {
        const proxies = Config('app.trust_proxies');

        if (!proxies) {
            IP.trustProxies = new Set();
            return;
        }

        if (proxies === "*") {
            IP.trustProxies = new Set(["*"]);
            return;
        }

        const list = Array.isArray(proxies) ? proxies : [proxies];

        const trustProxies = list.map(proxy => {
            try {
                return proxy.includes("/")
                    ? ipaddr.parseCIDR(proxy)
                    : ipaddr.process(proxy).toNormalizedString();

            } catch {
                throw new InternalServerException(
                    new Error(`Invalid trusted proxy IP/CIDR: ${proxy}`)
                );
            }
        });

        this.trustProxies = new Set(trustProxies);
    }

    private static isTrustedProxy(ip: string): boolean {
        if (this.trustProxies.size === 0) return false;
        if (this.trustProxies.has("*")) return true;
        if (this.trustProxies.has(ip)) return true;

        const addr = ipaddr.process(ip);
        for (const proxy of this.trustProxies)
            if (Array.isArray(proxy) && addr.match(proxy)) return true;

        return false;
    }

    private resolve() {
        if (this._chain) return;

        const remote = this.request.socket.remoteAddress;
        if (!remote) throw new InternalServerException("Unable to determine remote address");

        const remoteAddress = ipaddr.process(remote).toNormalizedString();

        if (!IP.isTrustedProxy(remoteAddress)) {
            this._chain = [remoteAddress];
            this._address = remoteAddress;
            return;
        }

        const forwarded = this.request.headers["x-forwarded-for"];

        if (!forwarded) {
            this._chain = [remoteAddress];
            this._address = remoteAddress;
            return;
        }

        const forwardedForArr = (
            Array.isArray(forwarded)
                ? forwarded.join(',')
                : forwarded
        ).split(',');


        const forwardedAddresses: string[] = [];
        for (const ip of forwardedForArr) {
            try {
                forwardedAddresses.push(ipaddr.process(ip.trim()).toNormalizedString());
            } catch {
                // Ignore invalid forwarded IP
            }
        }

        if (forwardedAddresses.length === 0) {
            this._chain = [remoteAddress];
            this._address = remoteAddress;
            return;
        }

        forwardedAddresses.push(remoteAddress);

        this._chain = forwardedAddresses;

        for (let i = forwardedAddresses.length - 1; i >= 0; i--)
            if (!IP.isTrustedProxy(forwardedAddresses[i])) {
                this._address = forwardedAddresses[i];
                break;
            }

        if (!this._address) this._address = forwardedAddresses[0];

    }

    get address(): string {
        this.resolve();
        return this._address!;
    }

    get chain(): string[] {
        this.resolve();
        return [...this._chain!];
    }

    get remote(): string {
        this.resolve();
        const chain = this._chain!;
        return chain[chain.length - 1];
    }

    get forwardedChain(): string[] {
        this.resolve();
        return this._chain!.slice(0, -1);
    }

}

export default IP;