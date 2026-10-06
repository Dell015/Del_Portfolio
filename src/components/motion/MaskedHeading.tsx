"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { DURATION, EASE } from "./tokens";

interface MaskedHeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  delay?: number;
}

/** A heading that rises out of a clipped line box. See SectionHeader. */
export function MaskedHeading({ children, as = "h2", id, className = "", delay = 0 }: MaskedHeadingProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  // The observer must watch the clip wrapper, not the heading: the heading starts
  // translated out of its own overflow-hidden parent, so an observer on it sees
  // a fully clipped element and never reports it as in view.
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "0px 0px -12% 0px" });
  return (
    <div ref={wrapRef} className="overflow-hidden pb-[0.12em]">
      <Tag
        id={id}
        className={className}
        initial={reduced ? false : { y: "105%" }}
        animate={inView || reduced ? { y: 0 } : { y: "105%" }}
        transition={{ duration: DURATION.slow, delay, ease: EASE.out }}
      >
        {children}
      </Tag>
    </div>
  );
}
