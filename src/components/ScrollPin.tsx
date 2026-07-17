"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useModeStore } from "@/lib/store/mode";

gsap.registerPlugin(ScrollTrigger);

interface ScrollPinProps {
  children: (progress: number) => ReactNode;
  /** Total virtual scroll distance while pinned (px). Higher = more resistance. */
  pinDistance?: number;
  /** Scrub lag (seconds). 0 = instant, 1+ = trailing delay. */
  scrub?: number;
  /** Snap points as fractions 0–1. Pass null to disable snap. */
  snap?: number[] | null;
  /** Snap animation duration (seconds) */
  snapDuration?: number;
  /** Additional class on the pin wrapper */
  className?: string;
  /** Section id for anchor links */
  id?: string;
}

/**
 * ScrollPin — Wraps a section with GSAP ScrollTrigger pin+snap+scrub.
 *
 * Creates "scroll resistance" by pinning the section and extending the scroll
 * track so the user scrolls a long virtual distance while the section stays
 * in place. Children receive the progress (0–1) via render prop.
 *
 * Respects prefers-reduced-motion: fully disables pinning/snap, renders
 * children with progress=1 (fully revealed).
 */
export function ScrollPin({
  children,
  pinDistance = 2000,
  scrub = 1,
  snap = [0, 0.33, 0.66, 1],
  snapDuration = 0.4,
  className = "",
  id,
}: ScrollPinProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const { containerRef, scrollLocked } = useSnapScroll();
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  // Stabilize snap array reference
  const snapKey = JSON.stringify(snap);
  const stableSnap = useMemo(() => snap, [snapKey]);

  const updateProgress = useCallback((val: number) => {
    // Only trigger re-render if change is meaningful (>0.5%)
    if (Math.abs(val - progressRef.current) > 0.005) {
      progressRef.current = val;
      setProgress(val);
    }
  }, []);

  useEffect(() => {
    // Don't set up pinning if reduced motion is on or scroll is still locked
    if (reducedMotion || scrollLocked) return;

    const el = pinRef.current;
    const scroller = containerRef?.current;
    if (!el || !scroller) return;

    let ctx: gsap.Context | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Small delay to let DOM settle after scroll unlock
    timer = setTimeout(() => {
      timer = null;
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: el,
          scroller,
          pin: true,
          start: "top top",
          end: `+=${pinDistance}`,
          scrub,
          snap: stableSnap
            ? {
                snapTo: stableSnap,
                duration: { min: snapDuration * 0.5, max: snapDuration },
                ease: "power2.inOut",
              }
            : undefined,
          onUpdate: (self) => {
            updateProgress(self.progress);
          },
        });
      }, el);
    }, 150);

    return () => {
      if (timer) clearTimeout(timer);
      if (ctx) ctx.revert();
      // Kill any ScrollTriggers associated with this element to prevent
      // GSAP pin-spacer from conflicting with React's DOM cleanup
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === el || st.pin === el)
        .forEach((st) => st.kill());
    };
  }, [reducedMotion, scrollLocked, containerRef, pinDistance, scrub, stableSnap, snapDuration, updateProgress]);

  // If reduced motion, render fully revealed
  if (reducedMotion) {
    return (
      <div id={id} data-snap-section="" className={className}>
        {children(1)}
      </div>
    );
  }

  return (
    <div ref={pinRef} id={id} data-snap-section="" className={`min-h-screen ${className}`}>
      {children(progress)}
    </div>
  );
}
