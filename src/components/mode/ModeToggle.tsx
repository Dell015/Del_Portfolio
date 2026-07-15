"use client";

import { motion } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";

/**
 * Glassmorphism mode toggle with animated sliding pill.
 * Compact, elegant, with a satisfying spring animation on switch.
 */
export function ModeToggle() {
  const mode = useModeStore((s) => s.mode);
  const toggleMode = useModeStore((s) => s.toggleMode);

  return (
    <button
      onClick={toggleMode}
      aria-label={`Switch to ${mode === "clean" ? "Immersive" : "Clean"} mode`}
      aria-pressed={mode === "immersive"}
      className="relative flex items-center rounded-full px-1 py-1 text-[11px] font-medium backdrop-blur-xl transition-all duration-300 hover:border-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Clean label */}
      <span
        className={`relative z-10 rounded-full px-3 py-1.5 transition-all duration-300 ${
          mode === "clean" ? "text-bg font-semibold" : "text-text-muted/50"
        }`}
      >
        Clean
      </span>

      {/* Immersive label */}
      <span
        className={`relative z-10 rounded-full px-3 py-1.5 transition-all duration-300 ${
          mode === "immersive" ? "text-bg font-semibold" : "text-text-muted/50"
        }`}
      >
        Immersive
      </span>

      {/* Animated sliding pill indicator */}
      <motion.span
        className="absolute top-1 bottom-1 rounded-full bg-accent"
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
          mass: 0.8,
        }}
        style={{
          left: mode === "clean" ? "4px" : "calc(50% + 0px)",
          width: mode === "clean" ? "calc(50% - 4px)" : "calc(50% - 4px)",
        }}
      />

      {/* Subtle glow on the active side */}
      <motion.span
        className="absolute top-0 bottom-0 rounded-full pointer-events-none"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          left: mode === "clean" ? "4px" : "calc(50%)",
          width: mode === "clean" ? "calc(50% - 4px)" : "calc(50% - 4px)",
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.15) 0%, transparent 70%)",
        }}
      />
    </button>
  );
}
