/**
 * Visitor-adjustable look of the project sphere. Kept free of three.js so the
 * overlay UI and the canvas can both import it; colors are plain hex strings.
 */

export type PaletteId = "white" | "ember" | "aurora" | "ice" | "projects";

export interface SphereSettings {
  /** Particle size multiplier. */
  size: number;
  /** Sphere radius multiplier. */
  scale: number;
  /** Rotation speed multiplier (0 = still). */
  spin: number;
  /** Bloom intensity multiplier. */
  glow: number;
  palette: PaletteId;
  /** Ambient particles behind the sphere. */
  backdrop: boolean;
}

export const DEFAULT_SPHERE_SETTINGS: SphereSettings = {
  size: 1,
  scale: 1,
  spin: 1,
  glow: 1,
  palette: "white",
  backdrop: true,
};

export const SETTING_LIMITS = {
  size: { min: 0.5, max: 2, step: 0.05 },
  scale: { min: 0.7, max: 1.3, step: 0.05 },
  spin: { min: 0, max: 3, step: 0.1 },
  glow: { min: 0, max: 2, step: 0.1 },
} as const;

export interface PaletteDef {
  id: PaletteId;
  label: string;
  /** Colors handed out to the sphere's orbs in rotation (empty for "projects"). */
  orbs: string[];
  /** Two colors the background particles blend between. */
  backdrop: [string, string];
  /** Swatch shown in the picker. */
  swatch: [string, string];
}

export const PALETTES: PaletteDef[] = [
  {
    id: "white",
    label: "Mono",
    orbs: ["#ffffff", "#f0f0f0", "#e8e8e8", "#f5f0ff", "#fff5f5", "#f0f8ff"],
    backdrop: ["#ffffff", "#cfd3dc"],
    swatch: ["#ffffff", "#bfc3cc"],
  },
  {
    id: "ember",
    label: "Ember",
    orbs: ["#ff4d5a", "#ff7a45", "#ffb347", "#ffd37a", "#d11a2a", "#ffe3b8"],
    backdrop: ["#d11a2a", "#ffb347"],
    swatch: ["#d11a2a", "#ffb347"],
  },
  {
    id: "aurora",
    label: "Aurora",
    orbs: ["#7cf2c9", "#5ec8ff", "#8a7bff", "#c27bff", "#4df0ff", "#a8ffd9"],
    backdrop: ["#5ec8ff", "#8a7bff"],
    swatch: ["#7cf2c9", "#8a7bff"],
  },
  {
    id: "ice",
    label: "Ice",
    orbs: ["#ffffff", "#dff3ff", "#bfe3ff", "#9fd0ff", "#e8f6ff", "#cfe9ff"],
    backdrop: ["#bfe3ff", "#ffffff"],
    swatch: ["#ffffff", "#9fd0ff"],
  },
  {
    id: "projects",
    label: "Projects",
    orbs: [],
    backdrop: ["#ffffff", "#9aa0ff"],
    swatch: ["#7cf205", "#e3b43c"],
  },
];

export function getPalette(id: PaletteId): PaletteDef {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]!;
}

const STORAGE_KEY = "sphere-settings";

function clamp(v: unknown, min: number, max: number, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}

/** Reads saved settings, falling back to defaults for anything missing or invalid. */
export function loadSphereSettings(): SphereSettings {
  const d = DEFAULT_SPHERE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return d;
    const s = JSON.parse(raw) as Partial<SphereSettings>;
    const L = SETTING_LIMITS;
    return {
      size: clamp(s.size, L.size.min, L.size.max, d.size),
      scale: clamp(s.scale, L.scale.min, L.scale.max, d.scale),
      spin: clamp(s.spin, L.spin.min, L.spin.max, d.spin),
      glow: clamp(s.glow, L.glow.min, L.glow.max, d.glow),
      palette: PALETTES.some((p) => p.id === s.palette) ? (s.palette as PaletteId) : d.palette,
      backdrop: typeof s.backdrop === "boolean" ? s.backdrop : d.backdrop,
    };
  } catch {
    return d;
  }
}

export function saveSphereSettings(settings: SphereSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable, settings just won't persist
  }
}
