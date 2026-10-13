import { HAND_LENGTH } from "./proceduralHands";

/** Fingertip separation at full progress, in CSS pixels. The fresco's negative
 *  space is the whole point, the hands must never close it. */
export const GAP_PX_DESKTOP = 72;
/** Portrait gets a slightly wider gap: the button sits inside it. */
export const GAP_PX_PORTRAIT = 88;

/** Each hand's wrist-to-fingertip length as a fraction of the smaller viewport side. */
export const HAND_SCALE_LANDSCAPE = 0.42;
export const HAND_SCALE_PORTRAIT = 0.5;

/** Spacing between particles on screen, in CSS px. Low-end devices get fewer. */
const SPACING_PX = { high: 2.4, low: 3.4 } as const;

export interface HandPlan {
  portrait: boolean;
  /** Particle spacing in cloud units. */
  gridStep: number;
  /** Forearm length in cloud units, long enough to leave through the screen edge. */
  armLength: number;
}

/**
 * Works out how the hands must be built for a given screen.
 *
 * The hand itself has a fixed on-screen size (a fraction of the short side), so
 * the forearm is whatever is left between the wrist and the edge of the screen,
 * along the long axis the hands approach on. Particle spacing follows the same
 * pixels-per-unit, so density looks the same on a phone and a 4K monitor.
 *
 * Both outputs are quantised so a mobile address bar resizing the viewport does
 * not rebuild the clouds on every scroll.
 */
export function planHands(width: number, height: number, tier: "high" | "low"): HandPlan {
  const portrait = width < height;
  const frac = portrait ? HAND_SCALE_PORTRAIT : HAND_SCALE_LANDSCAPE;
  const gapPx = portrait ? GAP_PX_PORTRAIT : GAP_PX_DESKTOP;
  const pxPerUnit = (frac * Math.min(width, height)) / HAND_LENGTH;

  const edgePx = (portrait ? height : width) / 2;
  // Tip rests half a gap from centre; the hand takes HAND_LENGTH; the arm covers the
  // rest. 1.03 allows for the wrist angle, +0.3 for the scale-up, bloom and curl
  // noise, so the arm never visibly ends inside the screen.
  const raw = ((edgePx - gapPx / 2) / pxPerUnit - HAND_LENGTH) * 1.03 + 0.3;
  const armLength = Math.ceil(Math.max(0.5, raw) * 5) / 5;

  const rawStep = SPACING_PX[tier] / pxPerUnit;
  const gridStep = 1 / (Math.round(1 / Math.min(1 / 70, Math.max(1 / 220, rawStep)) / 10) * 10);

  return { portrait, gridStep, armLength };
}
