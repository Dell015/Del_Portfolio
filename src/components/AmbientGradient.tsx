"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useEffectsEnabled } from "@/lib/hooks/useEffectsEnabled";
import DarkVeil from "@/components/effects/DarkVeil";

/**
 * Ambient background behind the About section.
 *
 * Previously this ran a full-screen WebGL shader for the entire visit, even in
 * clean mode and at opacity 0, and faded by hard-coded scroll-page ranges that
 * stopped matching the layout. Now the shader mounts only while the About section
 * is actually on screen, fades with that section's own scroll progress, and is
 * skipped entirely on weak GPUs and for reduced-motion users.
 */
export function AmbientGradient() {
  const effects = useEffectsEnabled();
  const { containerRef } = useSnapScroll();
  const aboutRef = useRef<HTMLElement | null>(null);
  const [live, setLive] = useState(false);

  useLayoutEffect(() => {
    aboutRef.current = document.getElementById("about");
  }, []);

  const { scrollYProgress } = useScroll({
    target: aboutRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.35, 0.35, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const on = v > 0.001 && v < 0.999;
    setLive((prev) => (prev === on ? prev : on));
  });

  if (!effects || !live) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
    >
      <DarkVeil
        hueShift={240}
        noiseIntensity={0.02}
        scanlineIntensity={0}
        speed={2}
        resolutionScale={0.5}
        scanlineFrequency={0}
        warpAmount={0.3}
      />
    </motion.div>
  );
}
