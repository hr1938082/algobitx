import { SessionConfig } from "@algobitx/session/Session";


const session: SessionConfig = {
    name: process.env.SESSION_NAME || process.env.APP_NAME?.toLowerCase() + "_session" || "algobitx_session",
    lifetime: parseInt(process.env.SESSION_LIFETIME || "120", 10) * 60,
    httpOnly: process.env.SESSION_HTTP_ONLY === 'true' || true,
    secure: process.env.SESSION_SECURE === 'true' || false,
    sameSite: process.env.SESSION_SAMESITE as CookieSameSite || 'lax',
    path: process.env.SESSION_PATH || '/',
    domain: process.env.SESSION_DOMAIN || undefined,
}

export default session;