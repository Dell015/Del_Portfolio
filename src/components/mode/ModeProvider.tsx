"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";

/**
 * ModeProvider hydrates the mode store from localStorage and
 * sets up the prefers-reduced-motion listener. Place once in layout.
 *
 * When the mode toggles, it triggers a quick opacity dip (1 → 0 → 1)
 * over ~0.35s to create a cross-fade feel without remounting children.
 */
export function ModeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useModeStore((s) => s.hydrate);
  const hydrated = useModeStore((s) => s.hydrated);
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);

  const prevModeRef = useRef(mode);
  const controls = useAnimationControls();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Trigger cross-fade when mode changes (skip initial hydration)
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;

      // Skip animation if user prefers reduced motion
      if (reducedMotion) return;

      // Dip opacity: 1 → 0 → 1 over ~0.35s total
      controls.start({
        opacity: [1, 0, 1],
        transition: {
          duration: 0.35,
          times: [0, 0.4, 1], // reach 0 at ~40% of duration, then ease back
          ease: "easeInOut",
        },
      });
    }
  }, [mode, reducedMotion, controls]);

  // Prevent flash of wrong mode by not rendering until hydrated.
  // This is a brief moment on first paint — content still loads fast
  // because the store hydrates synchronously from localStorage.
  if (!hydrated) {
    return null;
  }

  return (
    <motion.div animate={controls} style={{ opacity: 1 }}>
      {children}
    </motion.div>
  );
}
