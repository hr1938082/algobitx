import { RedisOptions, Redis as IORedis } from "ioredis";
import Config, { PathValue, ConfigData } from "@algobitx/config-loader";

type RedisConfig = {
    default: RedisOptions;
} & Record<string, RedisOptions>

type RedisKeys = PathValue<ConfigData, 'redis'>

class Redis {
    private static connections: Map<keyof RedisKeys, IORedis> = new Map();
    private static initialized: boolean = false;
    private static isShuttingDown: boolean = false;

    constructor() { }

    private static init() {
        const config = Config('redis') as RedisConfig;
        if (!('default' in config)) {
            throw new Error('Redis config must include a "default" connection');
        }

        if (this.initialized) return;

        for (const [key, value] of Object.entries(config)) {
            this.createInstance(key as keyof RedisKeys, value);
        }

        this.initialized = true;

    }

    private static createInstance(key: keyof RedisKeys, opt: RedisOptions) {
        if (this.connections.has(key)) return;

        const client = new IORedis({
            lazyConnect: true,
            retryStrategy: (times) => Math.min(times * 100, 5000),
            enableOfflineQueue: true,
            maxRetriesPerRequest: 3,
            ...opt
        })

        client.on('end', () => this.connections.delete(key));

        this.connections.set(key, client);
    }

    static connection(key?: keyof RedisKeys) {
        if (this.isShuttingDown) {
            throw new Error(
                "Redis is shutting down and cannot accept new connections."
            );
        }
        if (!this.initialized) this.init();
        const client = this.connections.get(key || 'default');
        if (!client) throw new Error(`Redis connection "${String(key)}" not found`);
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
        if (!this.initialized || this.isShuttingDown) return;

        this.isShuttingDown = true;

        const closers = [...this.connections.values()].map(async (instance) => {
            try {
                await instance.quit();
            } catch (e) {
                try { instance.disconnect(false); } catch { }
            } finally {
                this.cleanupListeners(instance);
            }
        });

        await Promise.allSettled(closers);
        this.connections.clear();
        this.initialized = false;
        this.isShuttingDown = false;
    }
}

export default Redis;

export { RedisConfig }