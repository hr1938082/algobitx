import Application from "@algobitx/application/Application";

Application.defineConfig({
    name: process.env.APP_NAME || 'Algobitx',
    key: process.env.APP_KEY || '',
    env: process.env.NODE_ENV || 'development',
    port: Number(process.env.APP_PORT) || 8000,
    url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT || 8000}`,
    timezone: process.env.APP_TIMEZONE || 'UTC',
    force_https: false,
    trust_proxies: []
});