"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";
import { site } from "@/lib/content/site";
import { HeroStatic } from "./HeroStatic";
import { HeroParticleCanvas } from "./HeroParticleCanvas";
import {
  generateProceduralCloud,
  normalizeCloudCount,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";

const PARTICLE_COUNT = 12000;

/**
 * Hero section wrapper.
 * - Clean mode / reduced-motion: renders HeroStatic
 * - Immersive mode: renders HeroParticleCanvas with procedural clouds
 *   (will use real image sampling once face photo is available)
 */
export function Hero() {
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const isImmersive = mode === "immersive" && !reducedMotion;

  const [clouds, setClouds] = useState<{
    cloudA: PointCloud;
    cloudB: PointCloud;
  } | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Generate procedural clouds (placeholder until real face photo is available)
  useEffect(() => {
    if (!isImmersive) return;

    // cloudA = "face" placeholder (grid pattern to simulate portrait structure)
    const cloudA = normalizeCloudCount(
      generateProceduralCloud(PARTICLE_COUNT, "grid"),
      PARTICLE_COUNT
    );
    // cloudB = abstract scatter (question-screen noise)
    const cloudB = normalizeCloudCount(
      generateProceduralCloud(PARTICLE_COUNT, "scatter"),
      PARTICLE_COUNT
    );

    setClouds({ cloudA, cloudB });
  }, [isImmersive]);

  const handleRevealComplete = useCallback(() => {
    setRevealed(true);
  }, []);

  // Clean mode or reduced motion: just show static hero
  if (!isImmersive) {
    return <HeroStatic />;
  }

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      {/* Particle canvas background */}
      {clouds && (
        <HeroParticleCanvas
          cloudA={clouds.cloudA}
          cloudB={clouds.cloudB}
          onRevealComplete={handleRevealComplete}
        />
      )}

      {/* Overlay content */}
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="question"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <p className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-[0.2em] text-text-muted">
                {site.name}
              </p>

              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                {site.heroQuestion}
              </h1>

              <button
                className="mt-4 rounded-full border border-accent/60 bg-accent/10 px-8 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-accent backdrop-blur-sm transition-all duration-300 hover:bg-accent/20 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Reveal the answer"
              >
                {site.heroCta}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
                {site.name}
              </p>
              <p className="max-w-xl text-lg text-text-muted">
                {site.identityStatement}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <span className="text-xs uppercase tracking-widest text-text-muted">
          Scroll
        </span>
        <div className="h-8 w-[1px] animate-pulse bg-accent/60" />
      </motion.div>
    </section>
  );
}
