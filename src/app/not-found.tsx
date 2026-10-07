import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center outline-none"
    >
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-accent">
        Error 404
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-6xl">
        That page doesn&apos;t exist.
      </h1>
      <p className="max-w-md text-text-muted">
        The link may be old or mistyped. The projects and the rest of the portfolio are one click away.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center rounded-full bg-accent px-7 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-white transition-colors duration-300 hover:bg-text hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Back to the portfolio
        </Link>
        <Link
          href="/#projects"
          className="inline-flex min-h-[48px] items-center rounded-full border border-white/20 px-7 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-text transition-colors duration-300 hover:border-white/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          See the projects
        </Link>
      </div>
    </main>
  );
}
