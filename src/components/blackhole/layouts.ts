/** Camera framing and positions for the black hole scene (world units). */
export interface BlackHoleLayout {
  holeX: number;
  holeY: number;
  portraitX: number;
  portraitY: number;
  portraitH: number;
  /** World width that must fit on screen (the camera pulls back on narrow screens). */
  needW: number;
}

/** Side by side: portrait left, hole right (the About window covers the left later). */
export const WIDE_LAYOUT: BlackHoleLayout = { holeX: 3.5, holeY: -0.05, portraitX: -4.0, portraitY: 0, portraitH: 5.4, needW: 15.5 };
/** Stacked for phones: hole up top, portrait below it. */
export const NARROW_LAYOUT: BlackHoleLayout = { holeX: 0, holeY: 2.7, portraitX: 0, portraitY: -1.3, portraitH: 3.8, needW: 9.5 };
/** The lab page's original framing. */
export const LAB_LAYOUT: BlackHoleLayout = { holeX: 2.35, holeY: -0.05, portraitX: -2.9, portraitY: 0, portraitH: 4.8, needW: 13.2 };
