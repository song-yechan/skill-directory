/**
 * Edge Runtime compatible in-memory rate limiter (fixed window algorithm).
 */

interface RateLimitEntry {
  readonly count: number;
  readonly resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10_000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  if (store.size > MAX_STORE_SIZE) {
    cleanup();
  }

  const existing = store.get(key);

  // Window expired or no entry — start fresh
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  // Within window — check limit
  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // Increment (immutable)
  store.set(key, { ...existing, count: existing.count + 1 });
  return {
    allowed: true,
    remaining: limit - (existing.count + 1),
    resetAt: existing.resetAt,
  };
}
