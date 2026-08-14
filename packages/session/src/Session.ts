import { randomBytes } from "node:crypto";
import Config from "@algobitx/config-loader";
import Crypt from "@algobitx/crypt";
import Redis from "@algobitx/redis";
import Cookie, { CookieConfig } from "./Cookie";
import InternalServerException from "@algobitx/exception/http/InternalServerException";

type SessionCookieConfig = Omit<CookieConfig, "signed" | "maxAge" | "expires">;

export interface SessionConfig extends SessionCookieConfig {
    name: string;
    lifetime: number;
}

type SessionData = Record<string, unknown>;

class Session {
    private static config: SessionConfig;
    private readonly cookie: Cookie;
    private id?: string;
    private started = false;
    private data: SessionData = this.createDefaultData();
    private dirty = false;

    constructor(cookie: Cookie) {
        if (!Session.config) Session.config = Config("session") as SessionConfig
        this.cookie = cookie;
    }

    private generateId(): string {
        return randomBytes(32).toString("hex");
    }

    private resolveId(): string {
        if (this.id) return this.id;

        const encId = this.cookie.get(Session.config.name, true);

        if (!encId) {
            this.id = this.generateId();
            return this.id;
        }

        this.id = Crypt.decrypt(
            Buffer.from(encId, "base64").toString("utf8")
        );

        return this.id;
    }

    private setCookie(): void {
        const { name, lifetime, ...rest } = Session.config;

        if (!this.id) throw new InternalServerException(
            new Error("Session has not been started")
        );

        const encId = Buffer
            .from(Crypt.encrypt(this.id))
            .toString("base64");

        this.cookie.set(name, encId, {
            ...rest,
            signed: true,
            priority: "high",
            maxAge: lifetime,
        });
    }

    private createDefaultData(): SessionData {
        return {
            auth: null,
        };
    }

    private serialize() {
        return Crypt.encrypt(JSON.stringify(this.data));
    }

    private isPlainObject(value: unknown): value is Record<string, unknown> {
        if (value === null || typeof value !== "object") return false;

        const prototype = Object.getPrototypeOf(value);
        return prototype === Object.prototype || prototype === null;
    }

    private deserialize(value: string) {
        const data = JSON.parse(Crypt.decrypt(value));

        if (!this.isPlainObject(data))
            throw new InternalServerException(
                new TypeError("Invalid session data")
            );

        this.data = data;
    }

    async start(): Promise<void> {

        if (this.started) return;

        this.cookie.assertWritable();

        let id = this.resolveId();

        const redis = Redis.connection();

        const payload = await redis.get(id);

        if (!payload) {
            await redis.setex(
                id,
                Session.config.lifetime,
                this.serialize()
            );
        } else {
            try {
                this.deserialize(payload);
            } catch {
                await redis.del(id);

                id = this.id = this.generateId();
                this.data = this.createDefaultData();

                await redis.setex(
                    this.id,
                    Session.config.lifetime,
                    this.serialize()
                );
            }

            await redis.expire(id, Session.config.lifetime);

        }

        this.setCookie();
        this.started = true;
    }

    get<T = unknown>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    get<T = unknown>(key: string, defaultValue?: T): T | undefined {
        return (this.data[key] as T | undefined) ?? defaultValue;
    }

    has(key: string): boolean {
        return key in this.data;
    }

    set(key: string, value: unknown) {
        this.data[key] = value;
        this.dirty = true;
        return this;
    }

    forget(key: string) {
        delete this.data[key];
        this.dirty = true;
        return this;
    }

    all(): SessionData {
        return structuredClone(this.data);
    }

    async save(): Promise<void> {
        if (!this.dirty) return;

        this.cookie.assertWritable();

        if (!this.id) throw new InternalServerException(
            new Error("Session has not been started")
        );

        await Redis.connection().setex(
            this.id,
            Session.config.lifetime,
            this.serialize()
        );

        this.setCookie();

        this.dirty = false;
    }

    async regenerate(): Promise<void> {
        this.cookie.assertWritable();

        if (!this.id) throw new InternalServerException(
            new Error("Session has not been started")
        );

        const oldId = this.id;
        const newId = this.generateId();
        try {
            const result = await Redis.connection().multi()
                .setex(
                    newId,
                    Session.config.lifetime,
                    this.serialize()
                )
                .del(oldId)
                .exec();

            if (!result)
                throw new Error(
                    "Redis session regeneration transaction failed"
                )

            for (const [error] of result) if (error) throw error;

            this.id = newId;
            this.setCookie();
            this.dirty = false;
        } catch (error) {
            this.id = oldId;
            throw new InternalServerException(error);
        }
    }

    async destroy(): Promise<void> {
        this.data = this.createDefaultData();
        await this.regenerate()
    }
}

export default Session;