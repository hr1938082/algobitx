import { RedisOptions, Redis as IORedis } from "ioredis";
import Config, { PathValue, ConfigData, defineConfig as DefineConfig } from "@algobitx/config-loader";
import InternalServerException from "@algobitx/exception/http/InternalServerException";

type RedisConfig = {
    default: RedisOptions;
    [key: string]: RedisOptions;
}

type RedisKeys = PathValue<ConfigData, 'redis'>

class Redis {
    private static connections: Map<keyof RedisKeys, IORedis> = new Map();
    private static initialized: boolean = false;
    private static isShuttingDown: boolean = false;

    private static init() {
        if (this.isShuttingDown) throw new InternalServerException(
            new Error(
                "Redis is shutting down and cannot initiate now."
            )
        );

        if (this.initialized) return;

        const config = Config('redis') as RedisConfig;

        if (
            config === null ||
            typeof config !== "object" ||
            Array.isArray(config)
        ) throw new InternalServerException(
            new TypeError("Redis config must be an object.")
        );

        if (!('default' in config)) throw new InternalServerException(
            new Error('Redis config must include a "default" connection')
        );

        try {
            for (const [key, value] of Object.entries(config))
                this.createInstance(key as keyof RedisKeys, value);

            this.initialized = true;
        } catch (error) {
            for (const instance of this.connections.values()) {
                try {
                    instance.disconnect(false);
                } catch { }
            }
            this.connections.clear();

            throw new InternalServerException(error);
        }
    }

    private static createInstance(key: keyof RedisKeys, opt: RedisOptions) {
        if (this.connections.has(key)) return;

        if (
            opt === null ||
            typeof opt !== "object" ||
            Array.isArray(opt)
        ) throw new InternalServerException(
            new TypeError(
                `Redis connection "${String(key)}" config must be an object.`
            )
        );

        const client = new IORedis({
            lazyConnect: true,
            retryStrategy: (times) => Math.min(times * 100, 5000),
            enableOfflineQueue: true,
            maxRetriesPerRequest: 3,
            ...opt
        });

        this.connections.set(key, client);
    }

    static defineConfig(config: RedisConfig) {
        DefineConfig({ name: 'redis', values: config });
    }

    static connection(key?: keyof RedisKeys) {
        if (this.isShuttingDown) throw new InternalServerException(
            new Error(
                "Redis is shutting down and cannot accept new connections."
            )
        );

        if (!this.initialized) this.init();

        const connectionKey = key ?? 'default';

        const client = this.connections.get(connectionKey);
        if (!client) throw new InternalServerException(
            new Error(`Redis connection "${String(connectionKey)}" not found`)
        );

        return client;
    }

    private static cleanupListeners(redis: IORedis) {
        const redisEvents = [
            'connect',
            'connecting',
            'ready',
            'error',
            'close',
            'reconnecting',
            'end',
            'message',
            'messageBuffer',
            'pmessage',
            'pmessageBuffer',
            'wait'
        ];

        for (const event of redisEvents) {
            redis.removeAllListeners(event);
        }
    }

    static async shutdown(): Promise<void> {
        if (this.isShuttingDown) return;

        this.isShuttingDown = true;

        const closers = [...this.connections.values()].map(async (instance) => {
            try {
                await instance.quit();
            } catch {
                try { instance.disconnect(false); } catch { }
            } finally {
                this.cleanupListeners(instance);
            }
        });

        await Promise.allSettled(closers);
        this.connections.clear();
        this.initialized = false;
    }
}

export default Redis;

export { RedisConfig }