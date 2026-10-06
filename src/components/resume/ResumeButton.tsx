"use client";

import { FiArrowRight, FiDownload, FiMail } from "react-icons/fi";
import { contact, resume } from "@/lib/content/site";

export interface ResumeButtonProps {
  /**
   * Whether the button is interactive. In the immersive section this is driven by
   * scroll progress: it stays inert until the resume has appeared, so it can't
   * be clicked while it is still visually dormant.
   */
  active: boolean;
}

/**
 * The payoff of the resume section.
 *
 * Until a resume PDF exists (`resume.href === "#"`) it becomes an honest
 * "request it by email" link rather than a dead download.
 */
export function ResumeButton({ active }: ResumeButtonProps) {
  const hasPdf = resume.href !== "#";
  const href = hasPdf
    ? resume.href
    : `mailto:${contact.email}?subject=${encodeURIComponent("Resume request")}`;
  const Icon = hasPdf ? FiDownload : FiMail;

  return (
    <a
      href={href}
      {...(hasPdf ? { download: true } : {})}
      aria-disabled={!active ? true : undefined}
      tabIndex={active ? undefined : -1}
      className={`group relative inline-flex min-h-[52px] items-center gap-3 overflow-hidden rounded-full px-8 py-3.5 font-[family-name:var(--font-display)] text-[15px] font-semibold whitespace-nowrap text-white transition-[background-color,box-shadow,transform] duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
        active
          ? "bg-accent shadow-[0_10px_40px_-8px_rgba(209,26,42,0.7)] hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-8px_rgba(209,26,42,0.85)] active:translate-y-0"
          : "pointer-events-none bg-accent/40"
      }`}
    >
      {/* Sheen that sweeps across on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100"
      />
      <Icon className="relative h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="relative">{hasPdf ? resume.ctaLabel : resume.requestLabel}</span>
      <FiArrowRight
        className="relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </a>
  );
}
