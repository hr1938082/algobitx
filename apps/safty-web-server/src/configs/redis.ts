import { RedisConfig } from "@algobitx/redis"

const redis: RedisConfig = {
    default: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number.isInteger(process.env.REDIS_PORT) ? Number(process.env.REDIS_PORT) : 6379,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        db: Number.isInteger(process.env.REDIS_DB) ? Number(process.env.REDIS_DB) : 0,
        keyPrefix: (process.env.APP_NAME || 'Safty').toLowerCase().split(' ').join('_')
    }
}

export default redis