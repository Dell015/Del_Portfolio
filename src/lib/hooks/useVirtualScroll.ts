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
  const fadeEnd = explodeEnd + PHASE_BUDGETS.SMALL_FADE;

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

  // Track locked state for effect re-runs (ref for instant access, state for effect deps)
  const [lockedState, setLockedState] = useState(false);

  // ── Enter/exit lock zone based on scroll progress ──
  useEffect(() => {
    if (!enabled) return;
    if (isLocked.current) return;

    // If user scrolled back above the trigger after completing, reset so they can re-enter
    if (sequenceComplete.current && scrollProgress < LOCK_TRIGGER - 0.1) {
      sequenceComplete.current = false;
      hasEnteredZone.current = false;
      // Reset virtual accumulator so phases start from 0 on re-entry
      virtualPx.current = 0;
      gatherRef.current = 0;
      condenseRef.current = 0;
      ringCompressRef.current = 0;
      explodeRef.current = 0;
      smallFadeRef.current = 0;
    }

    if (sequenceComplete.current) return;

    if (scrollProgress >= LOCK_TRIGGER && !hasEnteredZone.current) {
      // Entering the zone — lock scroll
      hasEnteredZone.current = true;
      isLocked.current = true;
      setLockedState(true);
      lockScroll();
    }
  }, [enabled, scrollProgress, lockScroll]);

  // ── Intercept wheel/touch events ONLY when locked ──
  useEffect(() => {
    if (!lockedState) return;

    let touchStartY = 0;

    function applyDelta(delta: number) {
      const prev = virtualPx.current;
      const next = Math.max(0, Math.min(TOTAL_BUDGET, prev + delta));

      if (next === prev && !(next === 0 && delta < 0)) return;

      virtualPx.current = next;

      // Derive phases
      const phases = derivePhases(next);
      gatherRef.current = phases.gather;
      condenseRef.current = phases.condense;
      ringCompressRef.current = phases.ringCompress;
      explodeRef.current = phases.explode;
      smallFadeRef.current = phases.smallFade;

      // ── Unlock conditions ──

      // Completed: SMALL_FADE reached 1.0 → release lock, resume normal scroll
      if (phases.smallFade >= 1) {
        isLocked.current = false;
        sequenceComplete.current = true;
        setLockedState(false);
        unlockScroll();
        return;
      }

      // Scrolled back to 0 → release lock, let user scroll back up to About
      if (next === 0 && delta < 0) {
        isLocked.current = false;
        hasEnteredZone.current = false;
        setLockedState(false);
        unlockScroll();
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();
      applyDelta(e.deltaY);
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
      applyDelta(delta);
    }

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
    };
  }, [lockedState, unlockScroll]);

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
