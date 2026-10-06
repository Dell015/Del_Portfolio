"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";

interface ParallaxProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Travel in px from entering to leaving the viewport. Positive moves the layer
   * up slower than the page (reads as "further away"). Keep content layers
   * small (≤ 24) and decorative layers larger (40–120).
   */
  distance?: number;
  "aria-hidden"?: boolean;
}

/**
 * Depth layer driven by the section's own scroll position inside the site's
 * scroll container. The raw value is spring-smoothed so wheel "notches" and
 * trackpad momentum both resolve to the same soft glide.
 */
export function Parallax({ children, className, style, distance = 40, ...rest }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { containerRef } = useSnapScroll();

  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(scrollYProgress, [0, 1], [distance / 2, -distance / 2]);
  const y = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, y: reduced ? 0 : y, willChange: reduced ? undefined : "transform" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
