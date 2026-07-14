"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";
import { useMagneticHover } from "@/lib/hooks/useMagneticHover";

interface MagneticHoverProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum displacement in pixels (default: 6) */
  strength?: number;
  /** Radius in pixels within which the effect activates */
  radius?: number;
}

export function MagneticHover({
  children,
  className,
  strength = 6,
  radius,
}: MagneticHoverProps) {
  const { mode, reducedMotion } = useModeStore();
  const ref = useRef<HTMLDivElement>(null);
  const { x, y, onMouseMove, onMouseLeave } = useMagneticHover(ref, {
    strength,
    radius,
  });

  // In Clean mode or with reduced motion, render children without effect
  if (mode === "clean" || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}
