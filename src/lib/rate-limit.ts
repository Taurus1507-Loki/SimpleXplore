/**
 * Small fixed-window rate limiter kept in server memory.
 *
 * Limits are per server instance (on serverless hosts each warm instance counts
 * separately), which is enough to blunt floods and secret-guessing. For strict
 * global limits put a shared store (e.g. Upstash Redis) or the host's firewall in front.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: { limit: number; windowMs: number; maxKeys?: number }) {
  const { limit, windowMs, maxKeys = 10_000 } = options;
  const buckets = new Map<string, Bucket>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      if (buckets.size >= maxKeys) {
        // Drop expired buckets first, then the oldest, so memory stays bounded.
        buckets.forEach((b, k) => {
          if (b.resetAt <= now) buckets.delete(k);
        });
        if (buckets.size >= maxKeys) buckets.delete(buckets.keys().next().value as string);
      }
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    const allowed = bucket.count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSeconds: allowed ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
    };
  };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
}
