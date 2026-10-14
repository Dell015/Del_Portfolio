"use client";

import { create } from "zustand";

export type Mode = "clean" | "immersive";

interface ModeState {
  mode: Mode;
  reducedMotion: boolean;
  hydrated: boolean;
  /** True once the visitor has picked "quick look" or "have fun" (now or on an earlier visit). */
  chosen: boolean;
  /** True while the hero's particle canvas is mounted. The Projects section
   *  reads this to choose between the 3D sphere and the plain grid. */
  particlesActive: boolean;
  setParticlesActive: (active: boolean) => void;
  /** The visitor's pick on the first-visit screen: saves it and closes the screen. */
  choose: (mode: Mode) => void;
  /** Shows the first-visit screen again (footer link). */
  reopenChoice: () => void;
  hydrate: () => void;
}

// v2: the old key held the Clean/Immersive toggle, which was a default rather than a real pick,
// so everyone sees the first-visit screen once.
const STORAGE_KEY = "site-mode-v2";

export const useModeStore = create<ModeState>((set) => ({
  mode: "clean",
  reducedMotion: false,
  hydrated: false,
  chosen: false,
  particlesActive: false,
  setParticlesActive: (particlesActive) => set({ particlesActive }),

  choose: (mode) => {
    set({ mode, chosen: true });
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage unavailable (SSR or private browsing)
    }
  },

  reopenChoice: () => set({ chosen: false }),

  hydrate: () => {
    // Read persisted mode from localStorage
    let persisted: Mode = "clean";
    let chosen = false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "clean" || stored === "immersive") {
        persisted = stored;
        chosen = true;
      }
    } catch {
      // localStorage unavailable
    }

    // Read prefers-reduced-motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mql.matches;

    set({ mode: persisted, chosen, reducedMotion, hydrated: true });

    // Listen for OS-level reduced-motion changes
    const handler = (e: MediaQueryListEvent) => {
      set({ reducedMotion: e.matches });
    };
    mql.addEventListener("change", handler);

    // Return cleanup (not used directly, but available if needed)
    return () => mql.removeEventListener("change", handler);
  },
}));
