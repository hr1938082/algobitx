import Application from "@algobitx/application/Application";

Application.defineConfig({
    name: process.env.APP_NAME || 'algobitx',
    key: process.env.APP_KEY || '',
    env: process.env.NODE_ENV || 'development',
    port: process.env.APP_PORT ? Number(process.env.APP_PORT) : 8000,
    url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT || 8000}`,
    timezone: process.env.APP_TIMEZONE || 'UTC',
    force_https: false,
    trust_proxies: []
});