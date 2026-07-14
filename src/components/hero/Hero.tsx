"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";
import { site } from "@/lib/content/site";
import { useSnapScroll } from "@/components/SmoothScroll";
import { HeroStatic } from "./HeroStatic";
import { HeroParticleCanvas } from "./HeroParticleCanvas";
import {
  sampleImageToPoints,
  generateProceduralCloud,
  normalizeCloudCount,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";

const PARTICLE_COUNT = 80000;
const PORTRAIT_SRC = "/images/randel.png";

export function Hero() {
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const isImmersive = mode === "immersive" && !reducedMotion;
  const { unlockScroll } = useSnapScroll();

  const [clouds, setClouds] = useState<{
    cloudA: PointCloud;
    cloudB: PointCloud;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [revealTriggered, setRevealTriggered] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // In clean mode or on error, unlock scroll immediately
  useEffect(() => {
    if (!isImmersive || error) {
      unlockScroll();
    }
  }, [isImmersive, error, unlockScroll]);

  // Load portrait image
  useEffect(() => {
    if (!isImmersive) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    async function loadClouds() {
      try {
        const rawCloudA = await sampleImageToPoints(PORTRAIT_SRC, {
          targetCount: PARTICLE_COUNT,
          alphaThreshold: 20,
        });
        if (cancelled) return;

        const cloudA = normalizeCloudCount(rawCloudA, PARTICLE_COUNT);
        const cloudB = normalizeCloudCount(
          generateProceduralCloud(PARTICLE_COUNT, "scatter"),
          PARTICLE_COUNT
        );

        setClouds({ cloudA, cloudB });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load portrait:", err);
        setError(true);
        setLoading(false);
      }
    }

    loadClouds();
    return () => { cancelled = true; };
  }, [isImmersive]);

  const handleRevealClick = useCallback(() => {
    setRevealTriggered(true);
  }, []);

  const handleRevealComplete = useCallback(() => {
    setRevealed(true);
    setTimeout(() => unlockScroll(), 600);
  }, [unlockScroll]);

  // Clean mode fallback
  if (!isImmersive || error) {
    return <HeroStatic />;
  }

  if (loading || !clouds) {
    return <HeroStatic />;
  }

  return (
    <section
      id="hero"
      data-snap-section=""
      className="relative flex h-screen snap-start flex-col justify-center px-8 sm:px-12 md:px-20"
    >
      {/* Particle canvas */}
      <HeroParticleCanvas
        cloudA={clouds.cloudA}
        cloudB={clouds.cloudB}
        revealTriggered={revealTriggered}
        onRevealComplete={handleRevealComplete}
      />

      {/* Text overlay — asymmetric, off-center, large */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="question"
              className="flex flex-col items-start gap-4 max-w-4xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Small eyebrow */}
              <motion.p
                className="font-[family-name:var(--font-mono)] text-[10px] sm:text-xs uppercase tracking-[0.3em] text-text-muted"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Portfolio / 2024
              </motion.p>

              {/* Main headline — mixed typography */}
              <motion.div
                className="flex flex-col gap-0 leading-[0.9]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Line 1: Bold sans */}
                <span className="font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,7rem)] font-bold tracking-tighter text-text">
                  Founder.
                </span>
                {/* Line 2: Italic serif — offset right */}
                <span className="font-[family-name:var(--font-serif)] text-[clamp(3rem,8vw,7rem)] italic tracking-tight text-text pl-4 sm:pl-12 md:pl-20">
                  Developer.
                </span>
                {/* Line 3: Bold sans — offset further */}
                <span className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,5.5rem)] font-bold tracking-tighter text-text-muted pl-1 sm:pl-6">
                  Team lead.
                </span>
              </motion.div>

              {/* Sub-question */}
              <motion.p
                className="mt-4 max-w-md font-[family-name:var(--font-serif)] text-lg italic text-text-muted/80 sm:text-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Which one are you about to meet?
              </motion.p>

              {/* CTA button */}
              <motion.button
                onClick={handleRevealClick}
                disabled={revealTriggered}
                className="mt-6 group flex items-center gap-3 rounded-full border border-accent/50 bg-accent/5 px-8 py-3.5 font-[family-name:var(--font-display)] text-sm font-semibold text-accent backdrop-blur-sm transition-all duration-300 hover:bg-accent/15 hover:border-accent hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {site.heroCta}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              className="flex flex-col items-start gap-3 max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Name — big, serif italic */}
              <h1 className="font-[family-name:var(--font-serif)] text-[clamp(2.5rem,6vw,5rem)] italic tracking-tight text-text">
                {site.name}
              </h1>

              {/* Identity statement */}
              <p className="max-w-lg font-[family-name:var(--font-body)] text-lg leading-relaxed text-text-muted sm:text-xl">
                {site.identityStatement}
              </p>

              {/* Subtle scroll cue */}
              <motion.div
                className="mt-8 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="h-8 w-[1px] animate-pulse bg-accent/60" />
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.3em] text-text-muted">
                  Scroll to explore
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
