import Request from "@bitx/application/Request";

Request.defineConfig({
    name: process.env.SESSION_NAME || process.env.APP_NAME?.toLowerCase() || "bitx" + "_session",
    lifetime: (process.env.SESSION_LIFETIME ? Number(process.env.SESSION_LIFETIME) : 120) * 60,
    httpOnly: process.env.SESSION_HTTP_ONLY === 'true',
    secure: process.env.SESSION_SECURE === 'true',
    sameSite: process.env.SESSION_SAMESITE as CookieSameSite || 'lax',
    path: process.env.SESSION_PATH || '/',
    domain: process.env.SESSION_DOMAIN || undefined,
});