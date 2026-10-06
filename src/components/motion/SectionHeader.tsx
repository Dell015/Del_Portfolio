"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE, VIEWPORT_ONCE } from "./tokens";
import { MaskedHeading } from "./MaskedHeading";

interface SectionHeaderProps {
  eyebrow: string;
  /** Heading content. Wrap emphasised words in <em> — it is styled as the accent. */
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * Eyebrow + H2. The heading slides up out of a clipped line box (a "masked
 * line reveal") — no letter-by-letter animation, no blur, no overshoot.
 */
export function SectionHeader({ eyebrow, children, id, className = "" }: SectionHeaderProps) {
  const reduced = useReducedMotion();

  return (
    <header className={`mb-12 md:mb-16 ${className}`}>
      <motion.p
        className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-accent"
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: DURATION.base, ease: EASE.out }}
      >
        {eyebrow}
      </motion.p>
      <MaskedHeading
        id={id}
        className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight text-text md:text-5xl lg:text-6xl [&_em]:not-italic [&_em]:text-accent"
      >
        {children}
      </MaskedHeading>
    </header>
  );
}
