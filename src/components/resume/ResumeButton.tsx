"use client";

import { FiDownload } from "react-icons/fi";
import { resume } from "@/lib/content/site";

export interface ResumeButtonProps {
  /**
   * Whether the button is interactive. In the immersive section this is driven by
   * scroll progress — the button is inert until the hands have nearly closed the
   * gap, so it can't be clicked while it's still visually dormant.
   */
  active: boolean;
}

/**
 * The payoff of the hand reveal. Sits in the gap between the two fingertips.
 *
 * Visual state is scroll-driven from the parent (opacity/scale/glow live on a
 * wrapper motion.div so they animate without re-rendering). This component owns
 * only the resting appearance and the interactive gate.
 */
export function ResumeButton({ active }: ResumeButtonProps) {
  const isPlaceholder = resume.href === "#";

  return (
    <a
      href={resume.href}
      // A real PDF gets download semantics; the placeholder must not try to
      // download the current page.
      {...(isPlaceholder ? {} : { download: true })}
      aria-disabled={isPlaceholder || !active ? true : undefined}
      tabIndex={active ? undefined : -1}
      onClick={isPlaceholder ? (e) => e.preventDefault() : undefined}
      className={`group inline-flex min-h-[44px] items-center gap-2.5 rounded-full px-7 py-3.5 font-[family-name:var(--font-display)] text-sm font-semibold whitespace-nowrap transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
        active
          ? "bg-accent text-bg"
          : "border border-accent/25 bg-accent/5 text-accent/50"
      } ${isPlaceholder ? "cursor-not-allowed" : ""}`}
    >
      <FiDownload
        className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5"
        aria-hidden="true"
      />
      {resume.ctaLabel}
    </a>
  );
}
