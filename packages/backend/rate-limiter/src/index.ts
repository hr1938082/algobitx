import Redis from "@bitx/redis";

interface AttemptMethodResult {
    status: boolean;
    remaining: number;
    retry_after: number;
}

class RateLimiter {
    private static prefix: string = "rate-limiter";

    private constructor() { }

    private static getActualKey(key: string) {
        if (!key)
            throw new TypeError("Rate limiter key must be a valid string");

        return `${this.prefix}|${key}`;
    }

    private static validateAttempts(attempts: number) {
        if (!Number.isInteger(attempts) || attempts <= 0)
            throw new TypeError(
                "Rate limiter attempts must be a positive integer."
            );
    }

    private static validate(attempts: number, seconds: number): void {

        this.validateAttempts(attempts);

        if (!Number.isInteger(seconds) || seconds <= 0)
            throw new TypeError(
                "Rate limiter seconds must be a positive integer."
            );
    }

    static async isAvailable(key: string, attempts: number): Promise<boolean> {
        key = this.getActualKey(key);
        this.validateAttempts(attempts);
        const raw = await Redis.connection().get(key);
        const current = raw ? parseInt(raw, 10) : 0;
        return current < attempts;
    }

    static async availableIn(key: string): Promise<number> {
        key = this.getActualKey(key);
        const ttl = await Redis.connection().ttl(key);
        return ttl > 0 ? ttl : 0;
    }

    static async increment(key: string, attempts: number, seconds: number): Promise<number> {
        key = this.getActualKey(key);
        this.validate(attempts, seconds);
        const current = await Redis.connection().eval(
            `
                local current = tonumber(redis.call('GET', KEYS[1]) or '0')
                local limit = tonumber(ARGV[1])
                local increment = 1

                if current + increment > limit then
                    return limit + 1
                end

                local newCount = redis.call('INCRBY', KEYS[1], increment)

                if current == 0 then
                    redis.call('EXPIRE', KEYS[1], ARGV[2])
                end

                return newCount

            `,
            1,
            key,
            attempts,
            seconds
        );

        return Number(current);
    }

    static async remaining(key: string, attempts: number): Promise<number> {
        key = this.getActualKey(key);
        this.validateAttempts(attempts);
        const remaining = await Redis.connection().get(key);
        const current = parseInt(remaining || "0", 10);
        return Math.max(attempts - current, 0);
    }

    static async attempt(
        key: string,
        attempts: number,
        seconds: number
    ): Promise<AttemptMethodResult> {
        key = this.getActualKey(key);
        this.validate(attempts, seconds);
        const res = await Redis.connection().eval(
            `
                local current = tonumber(redis.call('GET', KEYS[1]) or '0')
                local limit = tonumber(ARGV[1])
                local increment = 1

                if current + increment > limit then
                    local ttl = redis.call('TTL', KEYS[1])
                    return cjson.encode({
                        status = false,
                        remaining = 0,
                        retry_after = ttl
                    })
                end

                local newCount = redis.call('INCRBY', KEYS[1], increment)

                if current == 0 then
                    redis.call('EXPIRE', KEYS[1], ARGV[2])
                end

                return cjson.encode({
                    status = true,
                    remaining = limit - newCount,
                    retry_after = 0
                })
            `,
            1,
            key,
            attempts,
            seconds
        );

        return JSON.parse(res as string) as AttemptMethodResult;
    }
}

export default RateLimiter;
