/**
 * POST /api/contact, delivers a visitor's message to Randel's inbox.
 *
 * This is a PUBLIC, UNAUTHENTICATED endpoint that sends email. That makes it a
 * spam-relay target by default, so it is layered:
 *   1. Per-IP rate limit , the primary defence.
 *   2. Global rate limit , caps blast radius of distributed abuse so the
 *                           provider quota can't be drained in one go.
 *   3. Honeypot field    , silently absorbs naive bots.
 *   4. Submit timing     , rejects impossibly fast fills.
 *   5. Strict validation , length caps, email format, no user input in headers.
 *
 * Deliberately NOT here: a captcha. Add Cloudflare Turnstile at the marked spot
 * below if real spam ever materialises, no point making visitors pay that cost
 * pre-emptively.
 */

import type { NextRequest } from "next/server";
import { CONTACT_LIMITS } from "@/lib/content/site";
import { isEmailConfigured, sendContactEmail } from "@/lib/email/sendContactEmail";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

/** Needs the Node runtime for `console.error` semantics and fetch timeouts. */
export const runtime = "nodejs";

const PER_IP = { limit: 3, windowMs: 10 * 60 * 1000 } as const;
const GLOBAL = { limit: 30, windowMs: 60 * 60 * 1000 } as const;

/** Below this, the submission wasn't typed by a human. */
const MIN_ELAPSED_MS = 2000;

/** Reject oversized bodies before parsing rather than after. */
const MAX_BODY_BYTES = 16 * 1024;

/**
 * Pragmatic email check. Not RFC 5322, that grammar accepts addresses no mail
 * provider honours. This rejects anything that couldn't be delivered, which is
 * the only thing we actually need, and guarantees no CR/LF reaches a header.
 */
const EMAIL_RE = /^[^\s@,;:<>"'\\]+@[^\s@,;:<>"'\\]+\.[a-z]{2,}$/i;

function json(body: unknown, status: number, headers?: HeadersInit) {
  return Response.json(body, { status, headers });
}

function fail(error: string, status: number, field?: string) {
  return json({ ok: false, error, ...(field ? { field } : {}) }, status);
}

interface RawBody {
  message?: unknown;
  email?: unknown;
  /** Honeypot. Hidden from humans; bots fill it in. */
  website?: unknown;
  /** Milliseconds between form mount and submit, reported by the client. */
  elapsedMs?: unknown;
}

export async function POST(request: NextRequest) {
  // ── Reject before doing any work if delivery isn't possible ──
  if (!isEmailConfigured()) {
    return fail("not_configured", 503);
  }

  // ── Size guard ──
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return fail("too_large", 413);
  }

  // ── Parse ──
  let body: RawBody;
  try {
    body = await request.json();
  } catch {
    return fail("invalid_json", 400);
  }

  if (typeof body !== "object" || body === null) {
    return fail("invalid_json", 400);
  }

  // ── Honeypot: pretend success so the bot doesn't learn anything ──
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true }, 200);
  }

  // ── Timing ──
  const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : 0;
  if (elapsedMs < MIN_ELAPSED_MS) {
    return fail("too_fast", 400);
  }

  // ── Validate message ──
  if (typeof body.message !== "string") {
    return fail("message_required", 400, "message");
  }
  const message = body.message.trim();
  if (message.length < CONTACT_LIMITS.messageMin) {
    return fail("message_too_short", 400, "message");
  }
  if (message.length > CONTACT_LIMITS.messageMax) {
    return fail("message_too_long", 400, "message");
  }

  // ── Validate optional email ──
  let replyTo: string | undefined;
  if (typeof body.email === "string" && body.email.trim() !== "") {
    const candidate = body.email.trim();
    if (candidate.length > CONTACT_LIMITS.emailMax || !EMAIL_RE.test(candidate)) {
      return fail("email_invalid", 400, "email");
    }
    replyTo = candidate;
  }

  // ── TURNSTILE HOOK ──
  // To enable: verify `body.turnstileToken` against
  // https://challenges.cloudflare.com/turnstile/v0/siteverify using
  // TURNSTILE_SECRET_KEY, and `return fail("captcha_failed", 400)` on rejection.

  // ── Rate limits ──
  const ip = getClientIp(request.headers);
  const perIp = rateLimit({ key: `contact:ip:${ip}`, ...PER_IP });
  if (!perIp.allowed) {
    return json({ ok: false, error: "rate_limited" }, 429, {
      "Retry-After": String(perIp.retryAfterSec),
    });
  }

  const global = rateLimit({ key: "contact:global", ...GLOBAL });
  if (!global.allowed) {
    return json({ ok: false, error: "rate_limited" }, 429, {
      "Retry-After": String(global.retryAfterSec),
    });
  }

  // ── Deliver ──
  const result = await sendContactEmail({ message, replyTo });
  if (!result.ok) {
    return fail("send_failed", 502);
  }

  return json({ ok: true }, 200);
}
