"use client";

import { motion } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";

const OPTIONS = [
  { value: "clean", label: "Clean", hint: "Fast, simple, no heavy effects" },
  { value: "immersive", label: "Immersive", hint: "Particle portrait and 3D project sphere" },
] as const;

/**
 * Two-option switch between the clean page and the immersive (WebGL) one.
 * Built as a proper radio group so assistive tech announces both choices and
 * what each does, not just "button".
 */
export function ModeToggle() {
  const mode = useModeStore((s) => s.mode);
  const setMode = useModeStore((s) => s.setMode);

  return (
    <div
      role="radiogroup"
      aria-label="Site experience"
      className="relative flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 text-xs font-medium"
    >
      {OPTIONS.map((opt) => {
        const selected = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={opt.hint}
            onClick={() => setMode(opt.value)}
            className={`relative z-10 rounded-full px-3.5 py-1.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selected ? "text-white" : "text-text-muted hover:text-text"
            }`}
          >
            {selected && (
              <motion.span
                layoutId="mode-pill"
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-full bg-accent"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
