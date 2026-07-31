"use client";

import { create } from "zustand";

interface SphereHoverState {
  /** Index of the hovered project in the projects array, or null */
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

export const useSphereHoverStore = create<SphereHoverState>((set) => ({
  hoveredIndex: null,
  setHoveredIndex: (index) => set({ hoveredIndex: index }),
}));
