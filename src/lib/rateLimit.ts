/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Scope and limitations, read before relying on this:
 * - State is per-process. On serverless (Vercel) each warm instance keeps its own
 *   window, so a determined attacker hitting cold starts can exceed the nominal
 *   limit. It stops casual abuse and accidental double-submits, which is what a
 *   portfolio contact form actually needs.
 * - For a hard guarantee, swap the `store` for Redis (Upstash) keyed the same way.
 *   The `rateLimit()` signature is designed so that swap touches only this file.
 */

/** Timestamps (ms) of recent hits, newest last, keyed by caller-supplied key. */
type HitStore = Map<string, number[]>;

/**
 * Survives dev-server hot reloads. Without this, every HMR cycle hands out a
 * fresh Map and the limiter effectively never triggers while developing.
 */
const globalStore = globalThis as typeof globalThis & {
  __contactRateLimitStore?: HitStore;
};

const store: HitStore = (globalStore.__contactRateLimitStore ??= new Map());

/** Drop keys with no activity inside this window to keep the Map bounded. */
const PRUNE_AFTER_MS = 60 * 60 * 1000;
let lastPrune = 0;

function prune(now: number) {
  if (now - lastPrune < PRUNE_AFTER_MS) return;
  lastPrune = now;
  for (const [key, hits] of store) {
    const live = hits.filter((t) => now - t < PRUNE_AFTER_MS);
    if (live.length === 0) store.delete(key);
    else store.set(key, live);
  }
}

export interface RateLimitOptions {
  /** Bucket identifier, e.g. `contact:ip:1.2.3.4` or `contact:global`. */
  key: string;
  /** Max allowed hits inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Hits left in the current window (0 when blocked). */
  remaining: number;
  /** Seconds until the oldest hit ages out, suitable for a `Retry-After` header. */
  retryAfterSec: number;
}

/**
 * Records a hit against `key` and reports whether it's within the limit.
 *
 * A blocked call does NOT record a hit, so hammering a blocked endpoint can't
 * extend the caller's own lockout indefinitely.
 */
export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  prune(now);

  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const oldest = hits[0] ?? now;
    store.set(key, hits);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  hits.push(now);
  store.set(key, hits);

  return { allowed: true, remaining: limit - hits.length, retryAfterSec: 0 };
}

/**
 * Best-effort client IP from proxy headers.
 *
 * `x-forwarded-for` is client-controllable in principle, but on Vercel the edge
 * rewrites it, so the leftmost entry is trustworthy there. Falls back to a
 * shared "unknown" bucket, which fails closed: unidentifiable callers all
 * contend for the same allowance rather than each getting a fresh one.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
