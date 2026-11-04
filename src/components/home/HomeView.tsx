"use client";

import type { ReactNode } from "react";
import { useModeStore } from "@/lib/store/mode";

/**
 * Picks which home page to show: the full experience or the Quick Look. They are
 * separate pages now, not one page with effects switched off.
 *
 * Before the saved choice is read (the server HTML, crawlers, no JS) it is the
 * Quick Look. Reduced motion always gets the Quick Look, which then shows its
 * finished state without the build animation.
 */
export function HomeView({ full, quick }: { full: ReactNode; quick: ReactNode }) {
  const hydrated = useModeStore((s) => s.hydrated);
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const immersive = hydrated && mode === "immersive" && !reducedMotion;
  return <>{immersive ? full : quick}</>;
}
