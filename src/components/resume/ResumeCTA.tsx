"use client";

import { AnimatedSection } from "@/components/AnimatedSection";

export function ResumeCTA() {
  return (
    <AnimatedSection id="resume" className="flex items-center justify-center px-6 py-20 text-center md:py-24">
      <div className="mx-auto max-w-md">
        <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-text-muted">
          Want the short version?
        </p>
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
          Download Resume
        </h2>
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-bg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Download resume (coming soon)"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
            />
          </svg>
          Resume.pdf
        </a>
        <p className="mt-3 text-xs text-text-muted/50 italic">
          PDF coming soon — placeholder link
        </p>
      </div>
    </AnimatedSection>
  );
}
