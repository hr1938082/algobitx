import ValidatePort from "@algobitx/application/Utils/ValidatePort";

const app = {
    name: process.env.APP_NAME || 'Safty',
    key: process.env.APP_KEY,
    env: process.env.NODE_ENV || 'development',
    port: ValidatePort('app port', process.env.APP_PORT) || 8000,
    url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT || 8000}`,
    timezone: process.env.APP_TIMEZONE || 'UTC',
    force_https: false,
    trust_proxies: []
}

export default app;