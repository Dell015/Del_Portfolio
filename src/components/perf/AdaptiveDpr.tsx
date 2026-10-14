"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * Adaptive render resolution for a WebGL canvas.
 *
 * Usage, in the component that renders the <Canvas>:
 *
 *   const { dpr, stepDown } = useAdaptiveDpr(1.75);
 *   <Canvas dpr={dpr}> ... <AdaptiveDpr dpr={dpr} onSlow={stepDown} /> ... </Canvas>
 *
 * `dpr` has to be driven through the Canvas prop: react-three-fiber re-applies that
 * prop on every render, so setting the ratio from inside the scene gets undone.
 */
export function useAdaptiveDpr(max: number, min = 0.65) {
  const [dpr, setDpr] = useState(() =>
    Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, max),
  );
  const stepDown = useCallback(() => setDpr((d) => (d > min ? Math.max(min, d * 0.82) : d)), [min]);
  return { dpr, stepDown };
}

/**
 * Put it inside the <Canvas>. It watches real frame times; when the scene keeps
 * missing the target for a couple of seconds it asks for a lower resolution (fewer
 * pixels to shade and to run through bloom). It only steps down, so a visitor on a
 * weak GPU settles at a resolution that holds, and a strong GPU never notices it.
 * Pauses (frameloop off, tab hidden) are ignored.
 */
export function AdaptiveDpr({
  dpr,
  onSlow,
  targetMs = 24,
  windowSec = 1.5,
}: {
  dpr: number;
  onSlow: () => void;
  /** Average frame time above this counts as "slow". 24 ms is roughly under 42 fps. */
  targetMs?: number;
  windowSec?: number;
}) {
  const setSize = useThree((s) => s.setSize);
  const getState = useThree((s) => s.get);
  const acc = useRef({ t: 0, n: 0, warm: 0, slow: 0 });

  useFrame((_, delta) => {
    // A resumed frameloop or a background tab hands back one huge delta: not a slow frame.
    if (delta > 0.25) return;
    const a = acc.current;
    // Shader compilation and first uploads make the opening seconds slow on every GPU.
    a.warm += delta;
    if (a.warm < 3) return;

    a.t += delta;
    a.n++;
    if (a.t < windowSec) return;

    const avgMs = (a.t / a.n) * 1000;
    a.t = 0;
    a.n = 0;
    a.slow = avgMs > targetMs ? a.slow + 1 : 0;

    // Two slow windows in a row, so one hiccup (a scroll burst) does not cost sharpness.
    if (a.slow >= 2) {
      a.slow = 0;
      onSlow();
    }
  });

  // The post-processing buffers only resize when the canvas size changes, so nudge it
  // once the new ratio has been applied.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = requestAnimationFrame(() => {
      const s = getState().size;
      setSize(s.width, s.height, s.top, s.left);
    });
    return () => cancelAnimationFrame(id);
  }, [dpr, getState, setSize]);

  return null;
}
