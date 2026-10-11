/**
 * Contact-form email delivery.
 *
 * Server-only. Never import this from a client component, it reads the API key
 * from the environment, and a key that reaches the browser lets anyone send mail
 * as you.
 *
 * Provider: Resend, called over plain `fetch` rather than the `resend` SDK. Same
 * result, no extra dependency. To switch providers, replace `deliver()`, nothing
 * else in the app knows which service is behind this module.
 */

import { contact } from "@/lib/content/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Resend's shared testing sender. It only delivers to the address that owns the
 * API key, which is fine here since we always send to Randel. Set
 * CONTACT_FROM_EMAIL once a custom domain is verified.
 */
const DEFAULT_FROM = "Portfolio Contact <onboarding@resend.dev>";

/**
 * Whether email delivery is available. The UI uses this to decide between a live
 * form and a `mailto:` fallback, so the site stays functional before any key
 * exists.
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Strips CR/LF, which are the characters that would let user input break out of
 * one header into another. Resend takes JSON and builds the MIME itself, so this
 * is defence in depth rather than the only barrier.
 */
function stripHeaderChars(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface ContactMessage {
  /** Already validated and trimmed by the route handler. */
  message: string;
  /** Already validated; omitted when the visitor didn't supply one. */
  replyTo?: string;
}

export type SendResult = { ok: true } | { ok: false; error: string };

function buildSubject(replyTo?: string): string {
  return replyTo
    ? `Portfolio message from ${stripHeaderChars(replyTo)}`
    : "Portfolio message (no reply address)";
}

function buildText({ message, replyTo }: ContactMessage): string {
  return [
    "New message from your portfolio contact form.",
    "",
    `From: ${replyTo ?? "not provided"}`,
    `Received: ${new Date().toISOString()}`,
    "",
    "---",
    "",
    message,
  ].join("\n");
}

function buildHtml({ message, replyTo }: ContactMessage): string {
  const from = replyTo
    ? `<a href="mailto:${escapeHtml(replyTo)}">${escapeHtml(replyTo)}</a>`
    : "<em>not provided</em>";

  return `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#111">
  <p style="margin:0 0 4px;font-size:13px;color:#666">New message from your portfolio contact form.</p>
  <p style="margin:0 0 16px;font-size:13px;color:#666">From: ${from}</p>
  <div style="white-space:pre-wrap;border-left:3px solid #D11A2A;padding:8px 0 8px 16px;font-size:15px">${escapeHtml(
    message,
  )}</div>
</div>`;
}

async function deliver(payload: ContactMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "not_configured" };

  const to = process.env.CONTACT_TO_EMAIL || contact.email;
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: buildSubject(payload.replyTo),
        text: buildText(payload),
        html: buildHtml(payload),
        // Lets Randel hit reply in Gmail and reach the visitor directly.
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
      }),
      // Don't let a hanging provider hold the serverless function open.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      // Logged server-side only, the client gets a generic message so provider
      // internals and quota state aren't exposed.
      console.error(`[contact] Resend responded ${res.status}: ${detail}`);
      return { ok: false, error: "provider_error" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[contact] Email delivery threw:", err);
    return { ok: false, error: "provider_error" };
  }
}

export async function sendContactEmail(payload: ContactMessage): Promise<SendResult> {
  return deliver(payload);
}
