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

        const current = await Redis.connection().eval(
            `
                local current = tonumber(redis.call('GET', KEYS[1]) or '0')
                local limit = tonumber(ARGV[1])
                local increment = 1

                if current + increment > limit then
                    return limit
                end

                local newCount = redis.call('INCRBY', KEYS[1], increment)

                if current == 0 then
                    redis.call('EXPIRE', KEYS[1], ARGV[2])
                end

                return newCount

            `,
            1,
            actualKey,
            attempts,
            seconds
        );

        return Number(current);
    }

    static async remaining(key: string, attempts: number): Promise<number> {
        const remaining = await Redis.connection().get(this.getActualKey(key));
        const current = parseInt(remaining || "0", 10);
        return Math.max(attempts - current, 0);
    }
}

export default RateLimiter;
