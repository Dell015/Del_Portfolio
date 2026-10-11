"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE, VIEWPORT_ONCE } from "./tokens";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use small steps (0.06–0.1) to stagger siblings. */
  delay?: number;
  /** Rise distance in px. Kept small on purpose. */
  y?: number;
  as?: "div" | "li" | "p" | "span" | "section" | "article";
}

/**
 * Fade-and-rise entrance, fired once when the element enters the viewport.
 * Opacity + transform only (compositor-friendly, no blur/filter animation).
 * Renders fully visible, with no animation, for reduced-motion users.
 */
export function Reveal({ children, className, delay = 0, y = 16, as = "div" }: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: DURATION.base, delay, ease: EASE.out }}
    >
      {children}
    </Tag>
  );
}
