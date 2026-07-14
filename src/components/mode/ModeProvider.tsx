"use client";

import { useEffect } from "react";
import { useModeStore } from "@/lib/store/mode";

/**
 * ModeProvider hydrates the mode store from localStorage and
 * sets up the prefers-reduced-motion listener. Place once in layout.
 */
export function ModeProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useModeStore((s) => s.hydrate);
  const hydrated = useModeStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Prevent flash of wrong mode by not rendering until hydrated.
  // This is a brief moment on first paint — content still loads fast
  // because the store hydrates synchronously from localStorage.
  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}
