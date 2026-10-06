"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";

/**
 * ModeProvider hydrates the mode store from localStorage and
 * sets up the prefers-reduced-motion listener. Place once in layout.
 * Children always render, so the server HTML contains the real page.
 *
 * When the mode toggles, it triggers a quick opacity dip (1 → 0 → 1)
 * over ~0.35s to create a cross-fade feel without remounting children.
 */
export function ModeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useModeStore((s) => s.hydrate);
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

  // Always render children. The server (and anything that doesn't run JS — search
  // crawlers, link previews, AI readers) gets the full "clean" page; the stored
  // mode is applied right after hydration. Returning null here used to ship an
  // empty <body>, which made the whole site invisible to non-browser readers.
  return (
    <motion.div animate={controls} style={{ opacity: 1 }}>
      {children}
    </motion.div>
  );
}
