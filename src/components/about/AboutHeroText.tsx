"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { bio } from "@/lib/content/site";

/**
 * About Hero Text — Text-behind-image knockout with dramatic staggered reveal.
 *
 * Animation sequence:
 * 1. FULLSTACK reveals character-by-character (masked slide-up from below)
 * 2. Pause for dramatic effect (~0.4s)
 * 3. DEVELOPER reveals character-by-character (same technique)
 * 4. Photo fades in
 * 5. Bio text drifts in
 *
 * Technique: overflow-hidden container per character + translateY from 100%
 * Reference: Awwwards masked line reveal pattern
 */

const HEADLINE_TOP = "FULLSTACK";
const HEADLINE_BOTTOM = "DEVELOPER";
const PHOTO_SRC = "/images/randel.png";

// Timing constants
const CHAR_STAGGER = 0.045; // delay between each character
const FIRST_WORD_DELAY = 0.1; // initial delay before FULLSTACK starts
const SECOND_WORD_DELAY = FIRST_WORD_DELAY + HEADLINE_TOP.length * CHAR_STAGGER + 0.4; // pause after FULLSTACK
const PHOTO_DELAY = SECOND_WORD_DELAY + HEADLINE_BOTTOM.length * CHAR_STAGGER + 0.2;
const BIO_DELAY = PHOTO_DELAY + 0.6;

interface AboutHeroTextProps {
  visible: boolean;
  onPhotoVisible?: () => void;
}

/**
 * Single character with masked reveal animation.
 * Each char is wrapped in an overflow-hidden span,
 * and the inner span slides up from below.
 */
function RevealChar({
  char,
  delay,
}: {
  char: string;
  delay: number;
}) {
  return (
    <span className="inline-block overflow-hidden">
      <motion.span
        className="inline-block"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{
          duration: 0.55,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    </span>
  );
}

/**
 * Animated headline word — reveals per character with stagger.
 */
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

export function AboutHeroText({ visible, onPhotoVisible }: AboutHeroTextProps) {
  if (!visible) return null;

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.05 }}
    >
      {/* === DESKTOP LAYOUT === */}
      <div className="relative hidden md:flex items-center justify-center w-full h-full">

        {/* LAYER 1: Solid filled text (z-0, behind particles) */}
        <div className="w-full max-w-[1400px] px-2 lg:px-4">
          {/* FULLSTACK — pushed far left */}
          <div className="select-none -ml-2 lg:-ml-6">
            <RevealWord
              text={HEADLINE_TOP}
              baseDelay={FIRST_WORD_DELAY}
              className="block font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent text-left"
              style={{ fontSize: "clamp(5rem, 13vw, 12rem)" }}
            />
          </div>

          {/* DEVELOPER — pushed far right */}
          <div className="select-none -mr-2 lg:-mr-6">
            <RevealWord
              text={HEADLINE_BOTTOM}
              baseDelay={SECOND_WORD_DELAY}
              className="block font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent text-right"
              style={{ fontSize: "clamp(5rem, 13vw, 12rem)" }}
            />
          </div>
        </div>

        {/* LAYER 2: Photo — fades in over particles, natural ratio */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: PHOTO_DELAY, ease: [0.4, 0, 0.2, 1] as const }}
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

        {/* LAYER 3: Stroke-only text — above particles (z-[2])
            Masked by portrait PNG — outline only where portrait overlaps */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: PHOTO_DELAY + 0.3, ease: [0.22, 1, 0.36, 1] as const }}
          style={{
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
            <div className="-ml-2 lg:-ml-6">
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
            </div>
            <div className="-mr-2 lg:-mr-6">
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
            </div>
          </div>
        </motion.div>

        {/* BIO TEXT — in the empty spaces, closer to center */}
        {/* Top-right */}
        <motion.div
          className="absolute top-[22%] right-6 lg:right-10 max-w-[280px] text-right z-[3]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: BIO_DELAY, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-text-muted">
            Turning ideas into real products with clean interfaces and fast execution.
          </p>
        </motion.div>

        {/* Bottom-left */}
        <motion.div
          className="absolute bottom-[22%] left-6 lg:left-10 max-w-[280px] z-[3]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: BIO_DELAY + 0.15, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-text-muted">
            Your next app — designed, built, and shipped. From zero to launch, no shortcuts.
          </p>
        </motion.div>
      </div>

      {/* === MOBILE LAYOUT === */}
      <div className="flex flex-col items-center justify-center gap-2 px-4 h-full md:hidden">
        {/* FULLSTACK — left */}
        <div className="self-start">
          <RevealWord
            text={HEADLINE_TOP}
            baseDelay={FIRST_WORD_DELAY}
            className="font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent"
            style={{ fontSize: "clamp(3rem, 15vw, 5rem)" }}
          />
        </div>

        {/* DEVELOPER — right */}
        <div className="self-end">
          <RevealWord
            text={HEADLINE_BOTTOM}
            baseDelay={SECOND_WORD_DELAY}
            className="font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent"
            style={{ fontSize: "clamp(3rem, 15vw, 5rem)" }}
          />
        </div>

        {/* Bio */}
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
