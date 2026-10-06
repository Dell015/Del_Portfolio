"use client";

import { create } from "zustand";

export type Mode = "clean" | "immersive";

interface ModeState {
  mode: Mode;
  reducedMotion: boolean;
  hydrated: boolean;
  /** True while the hero's particle canvas is mounted. The Projects section
   *  reads this to choose between the 3D sphere and the plain grid. */
  particlesActive: boolean;
  setParticlesActive: (active: boolean) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = "site-mode";

export const useModeStore = create<ModeState>((set, get) => ({
  mode: "clean",
  reducedMotion: false,
  hydrated: false,
  particlesActive: false,
  setParticlesActive: (particlesActive) => set({ particlesActive }),

  setMode: (mode) => {
    set({ mode });
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage unavailable (SSR or private browsing)
    }
  },

  toggleMode: () => {
    const next = get().mode === "clean" ? "immersive" : "clean";
    get().setMode(next);
  },

  hydrate: () => {
    // Read persisted mode from localStorage
    let persisted: Mode = "clean";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "clean" || stored === "immersive") {
        persisted = stored;
      }
    } catch {
      // localStorage unavailable
    }

    // Read prefers-reduced-motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mql.matches;

    set({ mode: persisted, reducedMotion, hydrated: true });

    // Listen for OS-level reduced-motion changes
    const handler = (e: MediaQueryListEvent) => {
      set({ reducedMotion: e.matches });
    };
    mql.addEventListener("change", handler);

    // Return cleanup (not used directly, but available if needed)
    return () => mql.removeEventListener("change", handler);
  },
}));
