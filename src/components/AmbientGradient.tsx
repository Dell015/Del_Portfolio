"use client";

import { motion } from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";

/**
 * Ambient Gradient — a subtle moving gradient overlay that accompanies
 * the particle background. Fixed position, fades in after the hero reveal
 * and fades out when particles do.
 *
 * Uses multiple radial gradients with slow CSS animation for organic movement.
 * Noticeable but not distracting — enhances the living background feel.
 */
export function AmbientGradient() {
  const { scrollProgress } = useSnapScroll();

  // Visible during hero dissolve → about section (scroll 0.2 to 2.0)
  const opacity =
    scrollProgress < 0.2
      ? 0
      : scrollProgress < 0.5
        ? (scrollProgress - 0.2) / 0.3 // fade in
        : scrollProgress > 1.8
          ? Math.max(0, 1 - (scrollProgress - 1.8) / 0.4) // fade out
          : 1;

  if (opacity <= 0) return null;

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      animate={{ opacity }}
      transition={{ duration: 0.3 }}
    >
      {/* Primary accent gradient — moves slowly */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 40%, rgba(209, 26, 42, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 70% 60%, rgba(209, 26, 42, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 30%, rgba(180, 20, 50, 0.04) 0%, transparent 50%)
          `,
          animation: "gradientDrift 25s ease-in-out infinite",
        }}
      />

      {/* Secondary warm gradient — moves in opposite direction */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 45% 55% at 65% 35%, rgba(242, 184, 75, 0.04) 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 35% 65%, rgba(209, 26, 42, 0.06) 0%, transparent 50%)
          `,
          animation: "gradientDrift2 30s ease-in-out infinite",
        }}
      />
    </motion.div>
  );
}
