"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/lib/store/mode";
import { useSnapScroll } from "@/components/SmoothScroll";
import { HeroStatic } from "./HeroStatic";
import { HeroParticleCanvas } from "./HeroParticleCanvas";
import { AboutHeroText } from "@/components/about/AboutHeroText";
import {
  sampleImageToPoints,
  generateProceduralCloud,
  normalizeCloudCount,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";

const PARTICLE_COUNT = 80000;
const PORTRAIT_SRC = "/images/randel.png";

/** Words that cycle in the hero headline — each with a unique font */
const CYCLING_WORDS = [
  { text: "Founder", font: "var(--font-syne)", style: "normal" },
  { text: "Developer", font: "var(--font-mono)", style: "normal" },
  { text: "Team Lead", font: "var(--font-instrument)", style: "italic" },
  { text: "Builder", font: "var(--font-display)", style: "normal" },
];

/** Characters used during scramble animation */
const SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,./<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Single character that scrambles through random chars before resolving.
 */
function ScrambleChar({
  char,
  delay,
  isExiting,
}: {
  char: string;
  delay: number;
  isExiting: boolean;
}) {
  const [display, setDisplay] = useState(char === " " ? "\u00A0" : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (isExiting) {
      // Scramble out: resolved → random → fade
      setResolved(false);
      let frame = 0;
      const maxFrames = 6;
      const interval = setInterval(() => {
        frame++;
        setDisplay(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
        if (frame >= maxFrames) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    } else {
      // Scramble in: random chars → resolve to actual char
      let frame = 0;
      const scrambleFrames = 4 + Math.floor(Math.random() * 4); // 4-8 frames of scramble
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          frame++;
          if (frame >= scrambleFrames) {
            setDisplay(char === " " ? "\u00A0" : char);
            setResolved(true);
            clearInterval(interval);
          } else {
            setDisplay(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
          }
        }, 50);
        return () => clearInterval(interval);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [char, delay, isExiting]);

  return (
    <motion.span
      className="inline-block text-accent"
      animate={{
        opacity: isExiting ? [1, 1, 0] : resolved ? 1 : 0.6,
        y: isExiting ? [0, 0, -10] : 0,
        scale: resolved ? 1 : 0.95,
      }}
      transition={{ duration: isExiting ? 0.3 : 0.15, ease: "easeOut" }}
    >
      {display}
    </motion.span>
  );
}

/**
 * Cycling text — scramble/decode entrance, scramble-out exit.
 */
function CyclingText() {
  const [index, setIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start exit
      setIsExiting(true);
      // After exit animation, switch word
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % CYCLING_WORDS.length);
        setIsExiting(false);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const longestWord = CYCLING_WORDS.reduce((a, b) => a.text.length > b.text.length ? a : b);
  const current = CYCLING_WORDS[index];

  return (
    <span className="relative inline-flex align-bottom h-[1.1em]" style={{ clipPath: 'inset(-10px -100vw)' }}>
      <span className="invisible whitespace-nowrap" style={{ fontFamily: longestWord.font }}>
        {longestWord.text}
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        style={{ fontFamily: current.font, fontStyle: current.style }}
      >
        {current.text.split("").map((char, i) => (
          <ScrambleChar
            key={`${index}-${i}`}
            char={char}
            delay={i * 60}
            isExiting={isExiting}
          />
        ))}
      </span>
    </span>
  );
}

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

  useEffect(() => {
    if (!isImmersive || error) {
      unlockScroll();
    }
  }, [isImmersive, error, unlockScroll]);

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
    // Fade out text early — before particles finish forming
    setTimeout(() => {
      setRevealed(true);
    }, 1200);
  }, []);

  const handleRevealComplete = useCallback(() => {
    setRevealed(true);
    setTimeout(() => unlockScroll(), 600);
  }, [unlockScroll]);

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
      className="relative flex h-screen flex-col items-center justify-center"
    >
      {/* Particle canvas — persists through all sections (fixed position) */}
      <HeroParticleCanvas
        cloudA={clouds.cloudA}
        cloudB={clouds.cloudB}
        revealTriggered={revealTriggered}
        onRevealComplete={handleRevealComplete}
      />

      {/* Text overlay — z-10 for pre-reveal (button clickable), z-0 when revealed (behind particles) */}
      <div className={`pointer-events-none ${revealed ? "absolute inset-0 z-0" : "relative z-10 flex flex-col items-center text-center px-6"}`}>
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="question"
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* "I'm a" — drops in from above with slight blur */}
              <motion.p
                className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-medium tracking-wide text-text-muted/70"
                initial={{ opacity: 0, y: -30, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                I&apos;m a
              </motion.p>

              {/* Big cycling word — scales up from small with a bounce */}
              <motion.h1
                className="text-[clamp(3.5rem,10vw,8rem)] font-bold leading-none tracking-tighter"
                initial={{ opacity: 0, scale: 0.7, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.0, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <CyclingText />
              </motion.h1>

              {/* Subtext — fades in with a letter-spacing tightening effect */}
              <motion.p
                className="mt-4 max-w-sm font-[family-name:var(--font-serif)] text-lg italic text-text-muted sm:text-xl"
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "0em" }}
                transition={{ duration: 0.9, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Which one are you about to meet?
              </motion.p>

              {/* CTA — slides up with a gentle glow pulse */}
              <motion.button
                onClick={handleRevealClick}
                disabled={revealTriggered}
                className="pointer-events-auto mt-6 group flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 px-7 py-3 font-[family-name:var(--font-display)] text-sm font-medium text-accent backdrop-blur-sm transition-all duration-300 hover:bg-accent/15 hover:border-accent/80 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Find out
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                >
                  →
                </motion.span>
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
                onPhotoVisible={() => setTimeout(() => unlockScroll(), 400)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
