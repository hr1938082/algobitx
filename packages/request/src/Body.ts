import { IncomingMessage } from "node:http";
import { HttpMethod } from ".";
import BadRequestException from "@algobitx/exception/http/BadRequestException";
import PayloadTooLargeException from "@algobitx/exception/http/PayloadTooLargeException";
import RequestAbortedException from "@algobitx/exception/server/RequestAbortedException";
import InternalServerException from "@algobitx/exception/http/InternalServerException";

class Body {
    private readonly raw: IncomingMessage;

    private static readonly noBodyMethods = new Set([
        "GET",
        "HEAD",
        "OPTIONS",
        "TRACE",
        "CONNECT"
    ]);

    private _maxBodySize: number = 1024 * 1024; // byte
    private _cacheBuffer: boolean = false;
    private _buffer?: Buffer;
    private _body?: Promise<unknown>;

    constructor(raw: IncomingMessage) {
        this.raw = raw;
    }

    get maxBodySize() {
        return this._maxBodySize;
    }

    set maxBodySize(byte: number) {
        this._maxBodySize = byte;
    }

    get cacheBuffer() {
        return this._cacheBuffer;
    }

    set cacheBuffer(value: boolean) {
        if (this._body)
            throw new InternalServerException(
                "Cannot enable raw buffer caching after body parsing has started."
            );
        this._cacheBuffer = value;
    }

    private static isPlainObject(value: unknown): value is Record<string, unknown> {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            Object.getPrototypeOf(value) === Object.prototype
        );
    }

    private async doParse(): Promise<unknown> {

        const method = (this.raw.method || "GET") as HttpMethod;

        if (Body.noBodyMethods.has(method)) return;

        const lengthHeader = this.raw.headers["content-length"];
        const transferEncoding = this.raw.headers["transfer-encoding"];

        if (lengthHeader && transferEncoding)
            throw new BadRequestException(
                "Content-Length and Transfer-Encoding cannot both be present."
            );

        if (lengthHeader) {

            const length = Number(lengthHeader);

            if (!Number.isFinite(length) || length < 0 || !Number.isInteger(length))
                throw new BadRequestException("Invalid Content-Length");

            if (length > this._maxBodySize) throw new PayloadTooLargeException();

            if (length === 0) return;

        } else if (!transferEncoding) return;

        const chunks: Buffer[] = [];
        let received: number = 0;

        await new Promise<void>((resolve, reject) => {
            const onData = (chunk: Buffer) => {
                const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                received += buffer.length;

                if (received > this._maxBodySize) {
                    const error = new PayloadTooLargeException();
                    cleanup();
                    this.raw.destroy(error);
                    reject(error);
                    return;
                }

                chunks.push(buffer);
            };

            const onEnd = () => {
                cleanup();
                resolve();
            };

            const onError = (error: Error) => {
                cleanup();
                reject(error);
            };

            const onAborted = () => {
                cleanup();
                reject(new RequestAbortedException());
            }

            const cleanup = () => {
                this.raw.off("data", onData);
                this.raw.off("end", onEnd);
                this.raw.off("error", onError);
                this.raw.off("aborted", onAborted)
            };

            this.raw.on("data", onData);
            this.raw.once("end", onEnd);
            this.raw.once("error", onError);
            this.raw.once('aborted', onAborted)
        });

        if (received === 0) return;

        const raw = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks, received);

        if (this._cacheBuffer) this._buffer = raw;

        let type = (this.raw.headers['content-type'] || "")
            .split(';')[0]
            .trim()
            .toLowerCase();

        if (type !== "" && type !== 'application/json' && !type.endsWith('+json'))
            throw new BadRequestException("Unsupported Content-Type: " + type);

        try {
            return JSON.parse(raw.toString());
        } catch {
            throw new BadRequestException();
        }
    }

    private parse(): Promise<unknown> {
        return this._body ??= this.doParse();
    }

    async getBuffer(): Promise<Buffer | undefined> {
        if (!this._cacheBuffer)
            throw new InternalServerException(
                "Raw buffer caching is disabled for this request."
            );

        if (this._buffer) return this._buffer;

        await this.parse();

        return this._buffer;

    }

    parsed<T = unknown>(): Promise<T | undefined> {
        return this.parse() as Promise<T | undefined>;
    }

    async get<T = unknown>(key: string): Promise<T | undefined> {
        const body = await this.parse();
        if (!body || !Body.isPlainObject(body)) return;
        return (key in body ? body[key] : undefined) as T | undefined;
    };

    async only<T extends Record<string, unknown>>(...keys: (keyof T)[]): Promise<T> {
        const body = await this.parse();

        const result: Record<string, unknown> = {};

        if (!body || !Body.isPlainObject(body)) return result as T;

        for (const key of keys)
            if (key in body)
                result[key as string] = body[key as string];

        return result as T;
    }

    async all<T extends Record<string, unknown>>(): Promise<T> {
        const body = await this.parse();
        if (!body || !Body.isPlainObject(body)) return {} as T;
        return body as T;
    };
}

export default Body