"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useSnapScroll } from "@/components/SmoothScroll";

// ─── Phase Budgets (px of virtual scroll per phase) ─────────────────────────

export const PHASE_BUDGETS = {
  GATHER: 300,
  CONDENSE: 400,
  EXPLODE: 250,
  SMALL_FADE: 200,
} as const;

// RING_COMPRESS starts 150px into CONDENSE and spans the remaining 250px
export const RING_COMPRESS_OFFSET = 150;

export const TOTAL_BUDGET =
  PHASE_BUDGETS.GATHER +
  PHASE_BUDGETS.CONDENSE +
  PHASE_BUDGETS.EXPLODE +
  PHASE_BUDGETS.SMALL_FADE; // 1150px

// Scroll progress threshold to enter the locked zone
export const LOCK_TRIGGER = 1.8;

// ─── Helpers ────────────────────────────────────────────────────────────────

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

// ─── Derive phase progress values from virtual scroll position ──────────────

export interface PhaseValues {
  gather: number;       // 0→1
  condense: number;     // 0→1
  ringCompress: number; // 0→1 (starts 150px into condense)
  explode: number;      // 0→1
  smallFade: number;    // 0→1
}

function derivePhases(virtualPx: number): PhaseValues {
  const gatherEnd = PHASE_BUDGETS.GATHER;
  const condenseEnd = gatherEnd + PHASE_BUDGETS.CONDENSE;
  const explodeEnd = condenseEnd + PHASE_BUDGETS.EXPLODE;
  
  const gather = clamp01(virtualPx / PHASE_BUDGETS.GATHER);

  const condenseStart = gatherEnd;
  const condense = clamp01((virtualPx - condenseStart) / PHASE_BUDGETS.CONDENSE);

  // Ring starts 150px into condense phase, spans remaining 250px
  const ringStart = condenseStart + RING_COMPRESS_OFFSET;
  const ringSpan = PHASE_BUDGETS.CONDENSE - RING_COMPRESS_OFFSET;
  const ringCompress = clamp01((virtualPx - ringStart) / ringSpan);

  const explodeStart = condenseEnd;
  const explode = clamp01((virtualPx - explodeStart) / PHASE_BUDGETS.EXPLODE);

  const fadeStart = explodeEnd;
  const smallFade = clamp01((virtualPx - fadeStart) / PHASE_BUDGETS.SMALL_FADE);

  return { gather, condense, ringCompress, explode, smallFade };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface VirtualScrollState {
  /** Current virtual scroll position in px (0 → TOTAL_BUDGET) */
  virtualPx: React.MutableRefObject<number>;
  /** Per-phase progress refs (read in useFrame without re-renders) */
  gatherRef: React.MutableRefObject<number>;
  condenseRef: React.MutableRefObject<number>;
  ringCompressRef: React.MutableRefObject<number>;
  explodeRef: React.MutableRefObject<number>;
  smallFadeRef: React.MutableRefObject<number>;
  /** Whether the virtual scroll lock is currently active */
  isLocked: React.MutableRefObject<boolean>;
}

export function useVirtualScroll(enabled: boolean = true): VirtualScrollState {
  const { scrollProgress, lockScroll, unlockScroll } = useSnapScroll();

  const virtualPx = useRef(0);
  const gatherRef = useRef(0);
  const condenseRef = useRef(0);
  const ringCompressRef = useRef(0);
  const explodeRef = useRef(0);
  const smallFadeRef = useRef(0);
  const isLocked = useRef(false);

  // Track whether we've entered the lock zone (to prevent re-triggering)
  const hasEnteredZone = useRef(false);
  // Track if the full sequence completed (don't re-lock after finishing)
  const sequenceComplete = useRef(false);

  const rewindRaf = useRef(0);

  /** Set the virtual position and derive every phase ref from it. */
  const applyPhases = useCallback((px: number) => {
    virtualPx.current = px;
    const phases = derivePhases(px);
    gatherRef.current = phases.gather;
    condenseRef.current = phases.condense;
    ringCompressRef.current = phases.ringCompress;
    explodeRef.current = phases.explode;
    smallFadeRef.current = phases.smallFade;
    return phases;
  }, []);

  useEffect(() => () => cancelAnimationFrame(rewindRaf.current), []);

  // Track locked state for effect re-runs (ref for instant access, state for effect deps)
  const [lockedState, setLockedState] = useState(false);

  // ── Enter/exit lock zone based on scroll progress ──
  useEffect(() => {
    if (!enabled) return;
    if (isLocked.current) return;

    // The user scrolled back above the trigger after completing the sequence.
    // Play it in reverse (crossfade back to the small particles, un-explode,
    // un-condense, un-gather) instead of snapping every phase to zero.
    if (sequenceComplete.current && scrollProgress < LOCK_TRIGGER - 0.1) {
      sequenceComplete.current = false;
      hasEnteredZone.current = false;

      cancelAnimationFrame(rewindRaf.current);
      const from = virtualPx.current;
      if (from <= 0) return;
      const duration = 450 + 900 * (from / TOTAL_BUDGET);
      const t0 = performance.now();
      const run = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
        applyPhases(from * (1 - eased));
        if (t < 1) rewindRaf.current = requestAnimationFrame(run);
      };
      rewindRaf.current = requestAnimationFrame(run);
    }

    if (sequenceComplete.current) return;

    if (scrollProgress >= LOCK_TRIGGER && !hasEnteredZone.current) {
      // Entering the zone, lock scroll (and stop any rewind still in flight)
      cancelAnimationFrame(rewindRaf.current);
      hasEnteredZone.current = true;
      isLocked.current = true;
      setLockedState(true);
      lockScroll();
    }
  }, [enabled, scrollProgress, lockScroll, applyPhases]);

  // ── Intercept wheel/touch events ONLY when locked ──
  // Input moves a *target*; the visible position eases toward it every frame, so a
  // mouse wheel's 100px steps glide instead of snapping. Touchpad deltas are small
  // and frequent, so the same easing is imperceptible for them.
  useEffect(() => {
    if (!lockedState) return;

    let touchStartY = 0;
    let target = virtualPx.current;
    let raf = 0;
    let last = 0;

    function release(resetToZero: boolean) {
      cancelAnimationFrame(raf);
      isLocked.current = false;
      if (resetToZero) hasEnteredZone.current = false;
      else sequenceComplete.current = true;
      setLockedState(false);
      unlockScroll();
    }

    const apply = applyPhases;

    function frame(now: number) {
      const dt = Math.min(48, now - last || 16);
      last = now;
      const k = 1 - Math.exp(-dt / 90);
      let next = virtualPx.current + (target - virtualPx.current) * k;
      if (Math.abs(target - next) < 0.3) next = target;

      const phases = apply(next);

      // Finished the whole sequence → hand scrolling back to the page.
      if (phases.smallFade >= 1) {
        release(false);
        return;
      }
      if (next !== target) raf = requestAnimationFrame(frame);
      else raf = 0;
    }

    function push(delta: number) {
      // Already at the start and pushing back up → leave the zone immediately.
      if (target <= 0 && virtualPx.current < 1 && delta < 0) {
        release(true);
        return;
      }
      target = Math.max(0, Math.min(TOTAL_BUDGET, target + delta));
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();
      push(e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY);
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      e.stopPropagation();
      const currentY = e.touches[0].clientY;
      const delta = (touchStartY - currentY) * 2;
      touchStartY = currentY;
      push(delta);
    }

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
    };
  }, [lockedState, unlockScroll, applyPhases]);

  return {
    virtualPx,
    gatherRef,
    condenseRef,
    ringCompressRef,
    explodeRef,
    smallFadeRef,
    isLocked,
  };
}
