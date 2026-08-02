import Redis from "@algobitx/redis";

class RateLimiter {
    private static prefix: string = "rate-limiter";

    private constructor() { }

    private static getActualKey(key: string) {
        return `${this.prefix}|${key}`;
    }

    static async isAvailable(key: string, attempts: number): Promise<boolean> {
        const raw = await Redis.connection().get(this.getActualKey(key));
        const current = raw ? parseInt(raw, 10) : 0;
        return current < attempts;
    }

    static async availableIn(key: string): Promise<number> {
        return await Redis.connection().ttl(this.getActualKey(key)) || 0;
    }

    static async increment(key: string, attempts: number, seconds: number): Promise<number> {
        const actualKey = this.getActualKey(key);

        const tx = Redis.connection().multi();
        tx.incr(actualKey);
        tx.ttl(actualKey);
        const results = await tx.exec();
        if (!results) throw new Error("RateLimiter transaction aborted");
        const [incrResult, ttlResult] = results as [[null, number], [null, number]];

        if (ttlResult[1] === -1) await Redis.connection().expire(actualKey, seconds);
        return Math.max(attempts - incrResult[1], 0);
    }

    static async remaining(key: string, attempts: number): Promise<number> {
        const remaining = await Redis.connection().get(this.getActualKey(key));
        const current = parseInt(remaining || "0", 10);
        return Math.max(attempts - current, 0);
    }
}

export default RateLimiter;
