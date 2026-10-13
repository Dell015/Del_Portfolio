"use client";

import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiCheck, FiDownload, FiMail } from "react-icons/fi";
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
 * Downloads the PDF directly. If `resume.href` is ever set back to "#" it falls
 * back to an honest "request it by email" link rather than a dead download.
 *
 * Idle: a sheen crosses it every few seconds and the arrow bobs, so it keeps
 * inviting the click. On click it confirms with a check for a moment.
 */
export function ResumeButton({ active }: ResumeButtonProps) {
  // `resume.href` is a literal type, so widen it: it may be flipped back to "#".
  const hasPdf = (resume.href as string) !== "#";
  const href = hasPdf
    ? resume.href
    : `mailto:${contact.email}?subject=${encodeURIComponent("Resume request")}`;

  const [clicked, setClicked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function onClick() {
    if (!active) return;
    setClicked(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setClicked(false), 2200);
  }

  const Icon = clicked ? FiCheck : hasPdf ? FiDownload : FiMail;
  const label = clicked
    ? hasPdf ? "Downloading" : "Opening mail"
    : hasPdf ? resume.ctaLabel : resume.requestLabel;

  return (
    <a
      href={href}
      {...(hasPdf ? { download: resume.fileName } : {})}
      onClick={onClick}
      aria-disabled={!active ? true : undefined}
      aria-live="polite"
      tabIndex={active ? undefined : -1}
      className={`group relative inline-flex min-h-[54px] items-center gap-3 overflow-hidden rounded-full py-2 pl-2 pr-7 font-[family-name:var(--font-display)] text-[15px] font-semibold whitespace-nowrap text-white transition-[background-color,box-shadow,transform] duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
        active
          ? "bg-accent shadow-[0_10px_40px_-8px_rgba(209,26,42,0.7)] hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-8px_rgba(209,26,42,0.9)] active:translate-y-0 active:scale-[0.98]"
          : "pointer-events-none bg-accent/40"
      }`}
    >
      {/* Sheen: crosses on its own every few seconds, and faster on hover */}
      {active && (
        <span
          aria-hidden="true"
          className="resume-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 bg-white/30"
        />
      )}

      {/* Icon puck */}
      <span
        aria-hidden="true"
        className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
          clicked ? "bg-[#16a34a]" : "bg-black/25 group-hover:bg-black/40"
        }`}
      >
        <Icon className={`h-[18px] w-[18px] ${hasPdf && !clicked && active ? "resume-bob" : ""}`} />
      </span>

      <span className="relative">{label}</span>
      <FiArrowRight
        className="relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </a>
  );
}
