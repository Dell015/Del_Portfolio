"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { HeroStatic } from "./HeroStatic";
import dynamic from "next/dynamic";

// Three.js + postprocessing is the heaviest thing on the page and is only needed in
// Immersive mode. Loading it on demand keeps it out of the Clean-mode first load.
const HeroParticleCanvas = dynamic(
  () => import("./HeroParticleCanvas").then((m) => m.HeroParticleCanvas),
  { ssr: false },
);
import { AboutHeroText } from "@/components/about/AboutHeroText";
import {
  sampleImageToPoints,
  generateProceduralCloud,
  normalizeCloudCount,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";

/** Particles per device tier. Weak GPUs/CPUs get a lighter cloud, not a stutter. */
const PARTICLE_COUNT = { high: 80000, low: 28000 } as const;
const PORTRAIT_SRC = "/images/randel.webp";

/** Words that cycle in the hero headline. */
const CYCLING_WORDS = ["Founder", "Developer", "Team Lead", "Builder"] as const;

/**
 * Cycling word, each word rises out of a clipped line box while the previous
 * one leaves upward. Opacity is left alone on purpose: the motion of the mask
 * is the whole effect, which keeps it calm over a moving particle field.
 */
function CyclingText() {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % CYCLING_WORDS.length), 3200);
    return () => clearInterval(id);
  }, [reduced]);

  const longest = CYCLING_WORDS.reduce((a, b) => (a.length > b.length ? a : b));

  return (
    <span className="relative inline-flex h-[1.12em] overflow-hidden align-bottom text-accent">
      {/* Reserves the widest word's width so nothing around it shifts */}
      <span className="invisible whitespace-nowrap" aria-hidden="true">
        {longest}
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={CYCLING_WORDS[index]}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          {CYCLING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const { tier, webglAvailable } = useDeviceCapability();
  // Immersive needs WebGL; without it (or while the probe hasn't run) show the static hero.
  const isImmersive = mode === "immersive" && !reducedMotion && webglAvailable;
  const particleCount = tier === "low" ? PARTICLE_COUNT.low : PARTICLE_COUNT.high;
  const setParticlesActive = useModeStore((st) => st.setParticlesActive);
  const { unlockScroll, lockScroll, containerRef, introSkipped } = useSnapScroll();

  const [clouds, setClouds] = useState<{
    cloudA: PointCloud;
    cloudB: PointCloud;
  } | null>(null);
  const [error, setError] = useState(false);
  const [revealTriggered, setRevealTriggered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const introDoneRef = useRef(false);

  // Immersive intro: the page is held at the top until "Find out" is pressed.
  // Re-lock whenever Immersive is (re)entered, switching over from Clean leaves
  // the scroll container unlocked otherwise, and release for every other case
  // (Clean mode, no WebGL, or a particle failure).
  useEffect(() => {
    if (!isImmersive || error) {
      unlockScroll();
      return;
    }
    if (!introDoneRef.current && !introSkipped) {
      containerRef.current?.scrollTo({ top: 0 });
      lockScroll();
    }
  }, [isImmersive, error, introSkipped, unlockScroll, lockScroll, containerRef]);

  useEffect(() => {
    if (!isImmersive) return;

    let cancelled = false;

    async function loadClouds() {
      try {
        const rawCloudA = await sampleImageToPoints(PORTRAIT_SRC, {
          targetCount: particleCount,
          alphaThreshold: 20,
        });
        if (cancelled) return;

        const cloudA = normalizeCloudCount(rawCloudA, particleCount);
        const cloudB = normalizeCloudCount(
          generateProceduralCloud(particleCount, "scatter"),
          particleCount
        );

        setClouds({ cloudA, cloudB });
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load portrait:", err);
        setError(true);
      }
    }

    loadClouds();
    return () => { cancelled = true; };
  }, [isImmersive, particleCount]);

  // Tell the rest of the page whether the shared particle canvas is really there
  // (the Projects section swaps sphere <-> grid on this).
  const particlesMounted = isImmersive && !error && clouds !== null;
  useEffect(() => {
    setParticlesActive(particlesMounted);
    return () => setParticlesActive(false);
  }, [particlesMounted, setParticlesActive]);

  const handleRevealClick = useCallback(() => {
    setRevealTriggered(true);
    // Fade out text early, before particles finish forming
    setTimeout(() => {
      setRevealed(true);
    }, 1200);
  }, []);

  const handleRevealComplete = useCallback(() => {
    setRevealed(true);
    introDoneRef.current = true;
    setTimeout(() => unlockScroll(), 600);
  }, [unlockScroll]);

  if (!isImmersive || error) {
    return <HeroStatic />;
  }

  if (!clouds) {
    return <HeroStatic />;
  }

  return (
    <section
      id="hero"
      data-snap-section=""
      className="relative flex h-screen flex-col items-center justify-center"
    >
      {/* Particle canvas, persists through all sections (fixed position) */}
      <HeroParticleCanvas
        cloudA={clouds.cloudA}
        cloudB={clouds.cloudB}
        // Coming back to a section (e.g. from a case study) skips the intro: show the finished scene at once.
        revealTriggered={revealTriggered || introSkipped}
        instantReveal={introSkipped}
        onRevealComplete={handleRevealComplete}
        maxDpr={tier === "low" ? 1 : 1.75}
        onFatalError={() => setError(true)}
      />

      {/* Text overlay, z-10 for pre-reveal (button clickable), z-0 when revealed (behind particles) */}
      <div className={`pointer-events-none ${revealed ? "absolute inset-0 z-0" : "relative z-10 flex flex-col items-center text-center px-6"}`}>
        <AnimatePresence mode="wait">
          {!(revealed || introSkipped) ? (
            <motion.div
              key="question"
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* "I'm a", settles in from above */}
              <motion.p
                className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-medium tracking-wide text-text-muted"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                I&apos;m a
              </motion.p>

              {/* Big cycling word, scales up from small with a bounce */}
              <motion.h1
                className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,10vw,8rem)] font-bold leading-none tracking-tighter"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <CyclingText />
              </motion.h1>

              {/* Subtext, fades in with a letter-spacing tightening effect */}
              <motion.p
                className="mt-4 max-w-sm font-[family-name:var(--font-serif)] text-lg italic text-text-muted sm:text-xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                Which one are you about to meet?
              </motion.p>

              {/* CTA, slides up with a gentle glow pulse */}
              <motion.button
                onClick={handleRevealClick}
                disabled={revealTriggered}
                className="pointer-events-auto mt-8 group flex items-center gap-2 rounded-full bg-accent px-7 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-white transition-colors duration-300 hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
              >
                Find out
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </motion.button>

            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <AboutHeroText
                visible={true}
                onPhotoVisible={() => {
                  introDoneRef.current = true;
                  setTimeout(() => unlockScroll(), 400);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
