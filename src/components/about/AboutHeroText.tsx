"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { bio } from "@/lib/content/site";
import { useSnapScroll } from "@/components/SmoothScroll";

/**
 * About Hero Text — Text-behind-image knockout with:
 * - Dramatic staggered character reveal on mount
 * - Scroll-linked parallax: each element moves up at different speeds
 * - Photo fades out as particles scatter
 */

const HEADLINE_TOP = "FULLSTACK";
const HEADLINE_BOTTOM = "DEVELOPER";
const PHOTO_SRC = "/images/randel.png";

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

export function AboutHeroText({ visible, onPhotoVisible }: AboutHeroTextProps) {
  const { scrollProgress } = useSnapScroll();

  // Motion values driven by scroll progress
  const scrollMV = useMotionValue(0);

  useEffect(() => {
    scrollMV.set(scrollProgress);
  }, [scrollProgress, scrollMV]);

  // Parallax transforms — different speeds for each element
  // Sequential exit parallax — cinematic stagger with wide gaps between departures
  // Each element holds in place, then gets "dragged" away by the scroll.
  //
  // "Turning ideas..." (top-right bio) — holds, then gets dragged first
  const yBioTop = useTransform(scrollMV, [0.08, 0.25], [0, -90]);
  const opacityBioTop = useTransform(scrollMV, [0.08, 0.20], [1, 0]);

  // "Your next app..." (bottom-left bio) — holds longer, then dragged
  const yBioBottom = useTransform(scrollMV, [0.20, 0.38], [0, -80]);
  const opacityBioBottom = useTransform(scrollMV, [0.20, 0.33], [1, 0]);

  // FULLSTACK — resists longer, then dragged
  const yFullstack = useTransform(scrollMV, [0.35, 0.55], [0, -70]);
  const opacityFullstack = useTransform(scrollMV, [0.35, 0.50], [1, 0]);

  // DEVELOPER — holds the longest, last to let go
  const yDeveloper = useTransform(scrollMV, [0.50, 0.72], [0, -60]);
  const opacityDeveloper = useTransform(scrollMV, [0.50, 0.67], [1, 0]);

  // Photo fades out almost instantly on scroll start
  const photoOpacity = useTransform(scrollMV, [0, 0.02, 0.08], [1, 1, 0]);
  // Stroke layer fades with photo
  const strokeOpacity = useTransform(scrollMV, [0, 0.02, 0.08], [1, 1, 0]);

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

        {/* LAYER 1: Solid filled text — parallax at different speeds */}
        <div className="w-full max-w-[1400px] px-2 lg:px-4">
          {/* FULLSTACK — exits third */}
          <motion.div className="select-none -ml-2 lg:-ml-6" style={{ y: yFullstack, opacity: opacityFullstack }}>
            <RevealWord
              text={HEADLINE_TOP}
              baseDelay={FIRST_WORD_DELAY}
              className="block font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent text-left"
              style={{ fontSize: "clamp(5rem, 13vw, 12rem)" }}
            />
          </motion.div>

          {/* DEVELOPER — exits last */}
          <motion.div className="select-none -mr-2 lg:-mr-6" style={{ y: yDeveloper, opacity: opacityDeveloper }}>
            <RevealWord
              text={HEADLINE_BOTTOM}
              baseDelay={SECOND_WORD_DELAY}
              className="block font-[family-name:var(--font-display)] font-black leading-[0.9] tracking-tighter text-accent text-right"
              style={{ fontSize: "clamp(5rem, 13vw, 12rem)" }}
            />
          </motion.div>
        </div>

        {/* LAYER 2: Photo — fades out as particles scatter */}
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

        {/* LAYER 3: Stroke-only text — fades with photo */}
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
            <motion.div className="-ml-2 lg:-ml-6" style={{ y: yFullstack }}>
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
            <motion.div className="-mr-2 lg:-mr-6" style={{ y: yDeveloper }}>
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

        {/* BIO TEXT — sequential exit */}
        <motion.div
          className="absolute top-[22%] right-6 lg:right-10 max-w-[280px] text-right z-[3]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: BIO_DELAY, ease: [0.4, 0, 0.2, 1] as const }}
          style={{ y: yBioTop, opacity: opacityBioTop }}
        >
          <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-text-muted">
            Turning ideas into real products with clean interfaces and fast execution.
          </p>
        </motion.div>

        <motion.div
          className="absolute bottom-[22%] left-6 lg:left-10 max-w-[280px] z-[3]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: BIO_DELAY + 0.15, ease: [0.4, 0, 0.2, 1] as const }}
          style={{ y: yBioBottom, opacity: opacityBioBottom }}
        >
          <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-text-muted">
            Your next app — designed, built, and shipped. From zero to launch, no shortcuts.
          </p>
        </motion.div>
      </div>

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
