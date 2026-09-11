import Redis from "@algobitx/application/Redis";

Redis.defineConfig({
    default: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
        keyPrefix: (process.env.APP_NAME || 'algobitx').toLowerCase().split(' ').join('_')
    },
});