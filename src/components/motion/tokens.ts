/**
 * Motion tokens — one set of curves and durations for the whole site, so
 * every transition feels like it belongs to the same hand.
 *
 * - `out`    entrances: quick start, long settle (expo-style ease-out)
 * - `inOut`  state changes that move and return (toggles, tab switches)
 * No bounce / back easing anywhere: overshoot is the single most recognisable
 * "template animation" tell.
 */
export const EASE = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const DURATION = {
  fast: 0.25,
  base: 0.6,
  slow: 0.9,
} as const;

/** Standard viewport trigger for scroll reveals: fire once, slightly inside the edge. */
export const VIEWPORT_ONCE = { once: true, margin: "-12% 0px -8% 0px" } as const;
