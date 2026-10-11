"use client";

import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { bio } from "@/lib/content/site";
import { useSnapScroll } from "@/components/SmoothScroll";

/**
 * About Hero Text, Text-behind-image knockout with:
 * - Dramatic staggered character reveal on mount
 * - Scroll-linked parallax: each element moves up at different speeds
 * - Photo fades out as particles scatter
 */

const HEADLINE_TOP = "FULLSTACK";
const HEADLINE_BOTTOM = "DEVELOPER";
const PHOTO_SRC = "/images/randel.webp";

// Timing constants for intro animation
const CHAR_STAGGER = 0.045;
const FIRST_WORD_DELAY = 0.1;
const SECOND_WORD_DELAY = FIRST_WORD_DELAY + HEADLINE_TOP.length * CHAR_STAGGER + 0.4;
const PHOTO_DELAY = SECOND_WORD_DELAY + HEADLINE_BOTTOM.length * CHAR_STAGGER + 0.2;
const BIO_DELAY = PHOTO_DELAY + 0.6;

interface AboutHeroTextProps {
  visible: boolean;
  onPhotoVisible?: () => void;
}

function RevealChar({ char, delay }: { char: string; delay: number }) {
  return (
    <span className="inline-block overflow-hidden">
      <motion.span
        className="inline-block"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    </span>
  );
}

function RevealWord({
  text,
  baseDelay,
  className,
  style,
}: {
  text: string;
  baseDelay: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={className} style={style}>
      {text.split("").map((char, i) => (
        <RevealChar key={`${char}-${i}`} char={char} delay={baseDelay + i * CHAR_STAGGER} />
      ))}
    </span>
  );
}

/**
 * Flash sweep, a bright highlight that races across a single word,
 * triggered right before it disappears. Each word gets its own flash.
 * Direction: 'ltr' (left to right) or 'rtl' (right to left)
 */
function FlashSweep({ scrollMV, start, end, direction = "ltr" }: { scrollMV: MotionValue<number>; start: number; end: number; direction?: "ltr" | "rtl" }) {
  const sweepX = useTransform(
    scrollMV,
    [start, end],
    direction === "ltr" ? ["-100%", "200%"] : ["200%", "-100%"]
  );
  const sweepOpacity = useTransform(
    scrollMV,
    [start, start + (end - start) * 0.1, end - (end - start) * 0.1, end],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ opacity: sweepOpacity }}
    >
      <motion.div
        className="absolute inset-y-0 w-[25%]"
        style={{
          x: sweepX,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.5) 70%, transparent)",
          filter: "blur(4px)",
        }}
      />
    </motion.div>
  );
}

export function AboutHeroText({ visible, onPhotoVisible }: AboutHeroTextProps) {
  const { scrollProgress } = useSnapScroll();

  // Motion values driven by scroll progress
  const scrollMV = useMotionValue(0);

  useEffect(() => {
    scrollMV.set(scrollProgress);
  }, [scrollProgress, scrollMV]);

  // Parallax transforms, different speeds for each element
  // The concept: text is FIXED on screen but drifts up slowly with scroll
  // (like a gentle parallax against the page). Each element exits in sequence.
  //
  // scrollProgress 0 = hero top, 1 = about section top
  
  // Photo + particles fade out first (immediate on scroll)
  const photoOpacity = useTransform(scrollMV, [0.0, 0.05, 0.12], [1, 1, 0]);
  const strokeOpacity = useTransform(scrollMV, [0.0, 0.05, 0.12], [1, 1, 0]);

  // Shared slow upward drift, everything moves up a bit per scroll
  const yShared = useTransform(scrollMV, [0, 1], [0, -80]);

  // Individual exit animations layered ON TOP of the shared drift
  // "Turning ideas...", exits first
  const yBioTopExit = useTransform(scrollMV, [0.15, 0.25], [0, -30]);
  const opacityBioTop = useTransform(scrollMV, [0.15, 0.25], [1, 0]);

  // "Your next app...", exits second
  const yBioBottomExit = useTransform(scrollMV, [0.30, 0.40], [0, -30]);
  const opacityBioBottom = useTransform(scrollMV, [0.30, 0.40], [1, 0]);

  // FULLSTACK, exits third
  const yFullstackExit = useTransform(scrollMV, [0.50, 0.62], [0, -40]);
  const opacityFullstack = useTransform(scrollMV, [0.50, 0.62], [1, 0]);

  // DEVELOPER, exits with FULLSTACK
  const yDeveloperExit = useTransform(scrollMV, [0.50, 0.62], [0, -30]);
  const opacityDeveloper = useTransform(scrollMV, [0.50, 0.62], [1, 0]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[3] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.05 }}
    >
      {/* === DESKTOP LAYOUT === */}
      <motion.div className="relative hidden md:flex items-center justify-center w-full h-full" style={{ y: yShared }}>

        {/* LAYER 1: Solid filled text, parallax at different speeds */}
        <div className="w-full max-w-[1400px] px-2 lg:px-4 relative">
          {/* FULLSTACK, exits third */}
          <motion.div className="select-none -ml-2 lg:-ml-6 relative overflow-hidden" style={{ y: yFullstackExit, opacity: opacityFullstack }}>
            <RevealWord
              text={HEADLINE_TOP}
              baseDelay={FIRST_WORD_DELAY}
              className="block font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent text-left"
              style={{ fontSize: "clamp(5rem, 13vw, 12rem)" }}
            />
            {/* Flash on FULLSTACK right before it's gone */}
            <FlashSweep scrollMV={scrollMV} start={0.54} end={0.62} />
          </motion.div>

          {/* DEVELOPER, exits with FULLSTACK */}
          <motion.div className="select-none -mr-2 lg:-mr-6 relative overflow-hidden" style={{ y: yDeveloperExit, opacity: opacityDeveloper }}>
            <RevealWord
              text={HEADLINE_BOTTOM}
              baseDelay={SECOND_WORD_DELAY}
              className="block font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent text-right"
              style={{ fontSize: "clamp(5rem, 13vw, 12rem)" }}
            />
            {/* Flash on DEVELOPER, sweeps from right (where the text starts) */}
            <FlashSweep scrollMV={scrollMV} start={0.56} end={0.63} direction="rtl" />
          </motion.div>
        </div>

        {/* LAYER 2: Photo, fades out as particles scatter */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: PHOTO_DELAY, ease: [0.4, 0, 0.2, 1] as const }}
          style={{ opacity: photoOpacity }}
          onAnimationComplete={() => onPhotoVisible?.()}
        >
          <div className="relative h-[72%] w-auto">
            <Image
              src={PHOTO_SRC}
              alt="Randel Serafica"
              width={600}
              height={800}
              className="h-full w-auto object-contain"
              priority
              sizes="(min-width: 768px) 40vw, 70vw"
            />
          </div>
        </motion.div>

        {/* LAYER 3: Stroke-only text, fades with photo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: PHOTO_DELAY + 0.3, ease: [0.22, 1, 0.36, 1] as const }}
          style={{
            opacity: strokeOpacity,
            maskImage: `url(${PHOTO_SRC})`,
            maskSize: "auto 72%",
            maskPosition: "center",
            maskRepeat: "no-repeat",
            WebkitMaskImage: `url(${PHOTO_SRC})`,
            WebkitMaskSize: "auto 72%",
            WebkitMaskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
          }}
        >
          <div className="w-full max-w-[1400px] px-2 lg:px-4">
            <motion.div className="-ml-2 lg:-ml-6" style={{ y: yFullstackExit }}>
              <span
                className="block font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-left select-none"
                style={{
                  fontSize: "clamp(5rem, 13vw, 12rem)",
                  color: "transparent",
                  WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.85)",
                }}
              >
                {HEADLINE_TOP.split("").map((char, i) => (
                  <span key={i} className="inline-block overflow-hidden">
                    <span className="inline-block">{char}</span>
                  </span>
                ))}
              </span>
            </motion.div>
            <motion.div className="-mr-2 lg:-mr-6" style={{ y: yDeveloperExit }}>
              <span
                className="block font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-right select-none"
                style={{
                  fontSize: "clamp(5rem, 13vw, 12rem)",
                  color: "transparent",
                  WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.85)",
                }}
              >
                {HEADLINE_BOTTOM.split("").map((char, i) => (
                  <span key={i} className="inline-block overflow-hidden">
                    <span className="inline-block">{char}</span>
                  </span>
                ))}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* BIO TEXT, sequential exit */}
        <motion.div
          className="absolute top-[22%] right-6 lg:right-10 max-w-[280px] text-right z-[3]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: BIO_DELAY, ease: [0.4, 0, 0.2, 1] as const }}
          style={{ y: yBioTopExit, opacity: opacityBioTop }}
        >
          <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-text-muted">
            A CS student from Cauayan, Isabela who designs, architects and builds products end to end.
          </p>
        </motion.div>

        <motion.div
          className="absolute bottom-[22%] left-6 lg:left-10 max-w-[280px] z-[3]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: BIO_DELAY + 0.15, ease: [0.4, 0, 0.2, 1] as const }}
          style={{ y: yBioBottomExit, opacity: opacityBioBottom }}
        >
          <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-text-muted">
            Seven products designed, two competition placements, and a habit of understanding every line I write.
          </p>
        </motion.div>
      </motion.div>

      {/* === MOBILE LAYOUT === */}
      <div className="flex flex-col items-center justify-center gap-2 px-4 h-full md:hidden">
        <div className="self-start">
          <RevealWord
            text={HEADLINE_TOP}
            baseDelay={FIRST_WORD_DELAY}
            className="font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent"
            style={{ fontSize: "clamp(3rem, 15vw, 5rem)" }}
          />
        </div>

        <div className="self-end">
          <RevealWord
            text={HEADLINE_BOTTOM}
            baseDelay={SECOND_WORD_DELAY}
            className="font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent"
            style={{ fontSize: "clamp(3rem, 15vw, 5rem)" }}
          />
        </div>

        <motion.p
          className="max-w-sm text-center font-[family-name:var(--font-body)] text-base leading-relaxed text-text-muted mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: BIO_DELAY, ease: [0.4, 0, 0.2, 1] as const }}
        >
          {bio.short}
        </motion.p>
      </div>
    </motion.div>
  );
}
