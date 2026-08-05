import Config from "@algobitx/config-loader";
import InternalServerException from "@algobitx/exception/http/InternalServerException";
import { IncomingMessage } from "node:http";
import { isIP } from "node:net";

class IP {
    private static trustProxies: Set<string>;
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

        for (const proxy of list)
            if (isIP(proxy) === 0)
                throw new InternalServerException(
                    new Error(`Invalid trusted proxy IP: ${proxy}`)
                );

        this.trustProxies = new Set(list.map(IP.normalizeIP));
    }

    private static isTrustedProxy(ip: string): boolean {
        if (this.trustProxies.size === 0) return false;
        if (this.trustProxies.has("*")) return true;
        return this.trustProxies.has(ip);
    }

    private static normalizeIP(ip: string): string {
        ip = ip.trim().toLowerCase();
        if (ip.startsWith("::ffff:")) ip = ip.substring(7);
        return ip;
    }

    private resolve() {
        if (this._chain) return;

        const remote = this.request.socket.remoteAddress;
        if (!remote) throw new InternalServerException("Unable to determine remote address");

        const remoteAddress = IP.normalizeIP(remote);

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
            const normalizedIP = IP.normalizeIP(ip);
            if (isIP(normalizedIP) !== 0)
                forwardedAddresses.push(normalizedIP)
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