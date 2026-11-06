import Link from "next/link";
import type { Metadata } from "next";
import { contact } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this portfolio collects (very little), why, and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "November 2026";

const mono = "font-[family-name:var(--font-mono)]";

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-white/10 py-8 md:grid-cols-[11rem_1fr] md:gap-10">
      <h2 className={`${mono} text-[11px] uppercase tracking-[0.18em] text-white/45`}>
        <span className="text-accent">{n}</span> {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-white/70">{children}</div>
    </section>
  );
}

/**
 * Plain-language privacy notice. Kept short and true to what the code does:
 * update it whenever the contact form, analytics or browser storage changes.
 */
export default function PrivacyPage() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto w-full max-w-3xl px-5 pb-24 pt-32 outline-none sm:px-8">
      <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-accent`}>Privacy</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-text md:text-5xl">
        What this site keeps about you.
      </h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/65">
        Short version: almost nothing. No accounts, no ads, no tracking cookies, and nothing is sold or shared.
      </p>
      <p className={`mt-3 ${mono} text-[11px] text-white/40`}>Updated {UPDATED}</p>

      <div className="mt-12">
        <Block n="01" title="Contact form">
          <p>
            When you send a message, your message and the email address you type in are emailed to me through
            Resend, an email delivery service. I use them only to read and reply to you. They stay in my inbox and
            aren&apos;t added to any list.
          </p>
          <p>
            To stop spam, the server briefly counts requests per IP address in memory. That count isn&apos;t saved
            anywhere and disappears on its own.
          </p>
        </Block>
        <Block n="02" title="Visit statistics">
          <p>
            The site uses Vercel Web Analytics to count page views. It doesn&apos;t use cookies and doesn&apos;t
            identify you; I only see totals like how many people visited and which pages they opened.
          </p>
          <p>Like any website host, Vercel also keeps short-lived server logs to keep the site running.</p>
        </Block>
        <Block n="03" title="Your browser">
          <p>
            Two small settings are stored in your own browser, never sent to me: which view you picked (the full
            experience or the Quick Look) and, for this tab only, which planet you last looked at.
          </p>
        </Block>
        <Block n="04" title="Your rights">
          <p>
            Under the Philippine Data Privacy Act of 2012 you can ask what I have about you, have it corrected, or
            have it deleted. Email{" "}
            <a
              href={`mailto:${contact.email}?subject=Privacy%20request`}
              className="text-text underline decoration-accent underline-offset-4 hover:text-white"
            >
              {contact.email}
            </a>{" "}
            and I&apos;ll handle it.
          </p>
        </Block>
      </div>

      <Link
        href="/"
        className={`mt-10 inline-flex min-h-[44px] items-center gap-2 border-b border-accent ${mono} text-[12px] uppercase tracking-[0.16em] text-text transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
      >
        <span aria-hidden="true">←</span> Back to the portfolio
      </Link>
    </main>
  );
}
