"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiSend } from "react-icons/fi";
import { CONTACT_LIMITS, contact, contactForm } from "@/lib/content/site";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Server error codes → copy the visitor can act on. Anything unmapped falls back
 * to the generic message, so a new server-side code can never render a raw
 * identifier into the UI.
 */
const ERROR_COPY: Record<string, string> = {
  message_required: "Add a message first.",
  message_too_short: `Message needs at least ${CONTACT_LIMITS.messageMin} characters.`,
  message_too_long: `Message is over the ${CONTACT_LIMITS.messageMax} character limit.`,
  email_invalid: "That email doesn't look right.",
  too_fast: "That was too quick — give it another go.",
  rate_limited: "You've sent a few already. Try again in a bit.",
  not_configured: contactForm.disabledNote,
};

export interface ContactFormProps {
  /**
   * Whether the server can actually deliver mail. Resolved on the server via
   * `isEmailConfigured()` and passed down, so the form never renders as live
   * when submitting would fail.
   */
  enabled: boolean;
}

export function ContactForm({ enabled }: ContactFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  /** Honeypot — humans never see or focus this. */
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");

  /** Form mount time, used for the server-side submit-timing check. */
  const mountedAt = useRef(Date.now());

  const tooShort = message.trim().length < CONTACT_LIMITS.messageMin;
  const nearLimit = message.length > CONTACT_LIMITS.messageMax * 0.9;
  const isSending = status === "sending";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSending || tooShort) return;

    setStatus("sending");
    setErrorText("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          email,
          website,
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });

      const data: { ok?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus("sent");
        setEmail("");
        setMessage("");
        // Reset the timing baseline so a second message isn't flagged as too fast.
        mountedAt.current = Date.now();
        return;
      }

      setStatus("error");
      setErrorText(
        (data.error && ERROR_COPY[data.error]) || contactForm.genericError,
      );
    } catch {
      // Network failure, offline, request aborted.
      setStatus("error");
      setErrorText(contactForm.genericError);
    }
  }

  // ── Fallback: no provider key, so don't pretend the form works ──
  if (!enabled) {
    return (
      <motion.div
        className="w-full rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-4 text-sm text-text-muted">{contactForm.disabledNote}</p>
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-6 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-bg transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {contact.email}
          <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      noValidate
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Honeypot. Off-screen rather than display:none, and unfocusable so it
          never traps keyboard users. */}
      <div className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-4">
        {/* ── Email (optional) ── */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-email"
            className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-text-muted"
          >
            {contactForm.emailLabel}
            <span className="ml-2 normal-case tracking-normal text-text-muted/50">
              {contactForm.emailHint}
            </span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.emailMax}
            placeholder={contactForm.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSending}
            className="min-h-[44px] w-full rounded-lg border border-border bg-surface-2/60 px-4 py-3 text-sm text-text placeholder:text-text-muted/40 transition-colors duration-200 focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          />
        </div>

        {/* ── Message ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor="contact-message"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-text-muted"
            >
              {contactForm.messageLabel}
            </label>
            <span
              className={`font-[family-name:var(--font-mono)] text-[11px] tabular-nums transition-colors ${
                nearLimit ? "text-accent" : "text-text-muted/40"
              }`}
              aria-hidden="true"
            >
              {message.length}/{CONTACT_LIMITS.messageMax}
            </span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            maxLength={CONTACT_LIMITS.messageMax}
            placeholder={contactForm.messagePlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            aria-describedby="contact-status"
            className="w-full resize-y rounded-lg border border-border bg-surface-2/60 px-4 py-3 text-sm leading-relaxed text-text placeholder:text-text-muted/40 transition-colors duration-200 focus:border-accent/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          />
        </div>

        {/* ── Submit + result ── */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isSending || tooShort}
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-6 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-bg transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isSending ? contactForm.submittingLabel : contactForm.submitLabel}
            <FiSend
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </button>

          {/* Single live region for both outcomes — screen readers announce the
              result without the button losing focus. */}
          <p
            id="contact-status"
            role="status"
            aria-live="polite"
            className={`text-xs ${
              status === "sent"
                ? "text-accent"
                : status === "error"
                  ? "text-accent/80"
                  : "text-text-muted/50"
            }`}
          >
            {status === "sent"
              ? contactForm.successText
              : status === "error"
                ? errorText
                : ""}
          </p>
        </div>
      </div>
    </motion.form>
  );
}
