/**
 * lib/rateLimit.ts
 *
 * Lightweight, edge-compatible rate limiter using in-memory sliding window.
 * No Redis dependency — works on Vercel Edge Functions.
 */

interface Window { count: number; resetAt: number; }

interface RateLimitResult { ok: boolean; remaining: number; resetAt: number; limit: number; }

const _store = new Map<string, Window>();

let _cleanupTimer: NodeJS.Timeout | null = null;
function _ensureCleanup() {
  if (_cleanupTimer) return;
  _cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, window] of _store) { if (window.resetAt < now) _store.delete(key); }
  }, 5 * 60_000);
  if (_cleanupTimer.unref) _cleanupTimer.unref();
}

export interface RateLimitConfig { windowMs: number; max: number; }

export function rateLimit(config: RateLimitConfig) {
  _ensureCleanup();
  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const resetAt = now + config.windowMs;
      let window = _store.get(key);
      if (!window || window.resetAt < now) { window = { count: 0, resetAt }; _store.set(key, window); }
      window.count++;
      const remaining = Math.max(0, config.max - window.count);
      const ok = window.count <= config.max;
      return { ok, remaining, resetAt: window.resetAt, limit: config.max };
    },
  };
}

export const authLimiter = rateLimit({ windowMs: 60_000, max: 5 });
export const apiLimiter = rateLimit({ windowMs: 60_000, max: 60 });
export const aiLimiter = rateLimit({ windowMs: 60_000, max: 10 });
export const uploadLimiter = rateLimit({ windowMs: 60_000, max: 5 });

export function getClientIP(req: Request): string {
  const headers = req.headers;
  return (
    (headers as Headers).get('x-forwarded-for')?.split(',')[0]?.trim() ??
    (headers as Headers).get('x-real-ip') ??
    'unknown'
  );
}

export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfterSecs = Math.ceil((result.resetAt - Date.now()) / 1000);
  return Response.json(
    { ok: false, error: 'Too many requests.', code: 'RATE_LIMITED' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSecs), 'X-RateLimit-Limit': String(result.limit), 'X-RateLimit-Remaining': String(result.remaining) } }
  );
}
