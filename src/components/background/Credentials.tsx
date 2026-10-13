"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { background, moments, type Moment } from "@/lib/content/timeline";
import { useSnapScroll } from "@/components/SmoothScroll";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { EASE } from "@/components/motion/tokens";

const SPRING = { stiffness: 120, damping: 30, mass: 0.4 } as const;

/**
 * "Background": a timeline that grows over the years.
 *
 * Every entry in `moments` (lib/content/timeline.ts) becomes a row: the card on
 * one side, a photo on the other, alternating. As you scroll, each photo is
 * revealed, drifts at its own speed, and tilts; a second, smaller photo drifts
 * at a different speed for depth. Entries without photos get a typographic card,
 * so a new entry looks finished the moment it is added.
 */
export function Credentials() {
  const { containerRef } = useSnapScroll();
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    container: containerRef,
    offset: ["start 70%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, SPRING);
  const lineScale = reduced ? scrollYProgress : fill;
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="background"
      data-snap-section=""
      aria-labelledby="background-heading"
      className="relative overflow-clip px-6 py-28 md:px-16 md:py-40 lg:px-24"
    >
      <Parallax
        distance={90}
        aria-hidden
        className="pointer-events-none absolute -right-[4vw] top-24 hidden select-none md:block"
      >
        <span
          className="block font-[family-name:var(--font-display)] text-[22vw] font-bold leading-none tracking-tighter text-transparent"
          style={{ WebkitTextStroke: "1px rgba(245,245,245,0.06)" }}
        >
          Path
        </span>
      </Parallax>

      <div className="relative mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,1.5fr)] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader eyebrow={background.eyebrow} id="background-heading" className="!mb-6 md:!mb-8">
            The track record <em>so far.</em>
          </SectionHeader>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-base leading-relaxed text-text-muted">{background.intro}</p>
          </Reveal>
        </div>

        <div ref={trackRef} className="relative pl-8 md:pl-10">
          <div aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
          <motion.div
            aria-hidden="true"
            className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-accent via-accent to-accent/40"
            style={{ scaleY: lineScale }}
          />
          {!reduced && (
            <motion.div
              aria-hidden="true"
              className="absolute left-[3px] h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_3px_rgba(209,26,42,0.55)]"
              style={{ top: glowY }}
            />
          )}

          <div className="space-y-20 md:space-y-28">
            {moments.map((m, i) => (
              <MomentRow key={`${m.title}-${i}`} moment={m} flip={i % 2 === 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MomentRow({ moment: m, flip }: { moment: Moment; flip: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { containerRef } = useSnapScroll();
  const inView = useInView(ref, { margin: "0px 0px -30% 0px", once: true });
  const lit = inView || !!reduced;

  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={ref} className="relative">
      <motion.span
        aria-hidden="true"
        className="absolute -left-8 top-[5px] block h-[15px] w-[15px] rounded-full border md:-left-10"
        animate={{
          backgroundColor: lit ? "#D11A2A" : "#0F0F0F",
          borderColor: lit ? "#D11A2A" : "rgba(245,245,245,0.2)",
          scale: lit ? 1 : 0.8,
        }}
        transition={{ duration: 0.5, ease: EASE.out }}
      />

      <div
        className={`grid items-center gap-8 md:gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] ${
          flip ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <MomentCard m={m} flip={flip} lit={lit} reduced={!!reduced} />
        <MomentVisual m={m} flip={flip} lit={lit} progress={scrollYProgress} reduced={!!reduced} />
      </div>
    </div>
  );
}

function MomentCard({ m, flip, lit, reduced }: { m: Moment; flip: boolean; lit: boolean; reduced: boolean }) {
  const dx = flip ? 36 : -36;
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: dx }}
      animate={lit ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.8, ease: EASE.out }}
    >
      <p className="mb-4 flex items-center gap-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-accent">
        <span>{m.kind}</span>
        {m.year && <span className="h-px w-8 bg-accent/50" />}
        {m.year && <span className="text-text-muted">{m.year}</span>}
      </p>
      <SpotlightCard className="rounded-2xl border border-border bg-surface/60 p-5 md:p-6">
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-text md:text-xl">
          {m.title}
        </p>
        <p className="mt-1 text-sm text-text-muted">{m.subtitle}</p>
        {m.note ? <p className="mt-3 text-sm leading-relaxed text-text-muted">{m.note}</p> : null}
      </SpotlightCard>
    </motion.div>
  );
}

function MomentVisual({
  m,
  flip,
  lit,
  progress,
  reduced,
}: {
  m: Moment;
  flip: boolean;
  lit: boolean;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const main = m.photos?.[0];
  const second = m.photos?.[1];
  const s = flip ? -1 : 1;

  // Each layer travels a different distance over the same scroll: that difference is the parallax.
  const frameY = useSpring(useTransform(progress, [0, 1], [70, -70]), SPRING);
  const frameRotate = useTransform(progress, [0, 0.5, 1], [4 * s, -1.5 * s, -4 * s]);
  const innerY = useTransform(progress, [0, 1], ["-9%", "9%"]);
  const yearX = useTransform(progress, [0, 1], [90 * s, -90 * s]);
  const secondY = useSpring(useTransform(progress, [0, 1], [150, -150]), SPRING);
  const secondRotate = useTransform(progress, [0, 1], [-7 * s, 6 * s]);

  return (
    <div className="relative">
      {/* Oversized year drifting behind the photo */}
      {m.year && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-0 right-0 z-0 hidden select-none text-center font-[family-name:var(--font-display)] text-[8vw] font-bold leading-none tracking-tighter text-transparent md:block"
          style={{ WebkitTextStroke: "1px rgba(245,245,245,0.09)", x: reduced ? 0 : yearX }}
        >
          {m.year.split(" ")[0]}
        </motion.span>
      )}

      <motion.div
        className="relative z-[1] mx-auto w-full max-w-[300px] md:max-w-[380px]"
        style={{ y: reduced ? 0 : frameY, rotate: reduced ? 0 : frameRotate }}
      >
        <motion.div
          className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
          initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
          animate={lit ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
          transition={{ duration: 1.1, ease: EASE.out }}
        >
          {main ? (
            <motion.div className="absolute -inset-[12%]" style={{ y: reduced ? 0 : innerY }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={main.src} alt={main.alt} loading="lazy" className="h-full w-full object-cover" />
            </motion.div>
          ) : (
            <Placeholder m={m} />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
          />
          {(main?.caption || m.year) && (
            <p className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-white/80">
              <span>{main?.caption ?? ""}</span>
              {m.year && <span className="rounded-sm bg-accent px-1.5 py-0.5 text-white">{m.year.split(" ")[0]}</span>}
            </p>
          )}
        </motion.div>

        {second && (
          <motion.div
            className={`absolute -bottom-10 z-[2] hidden w-[46%] overflow-hidden rounded-lg border border-border bg-surface shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] md:block ${
              flip ? "-left-[16%]" : "-right-[16%]"
            }`}
            style={{ y: reduced ? 0 : secondY, rotate: reduced ? 0 : secondRotate }}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={lit ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE.out }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={second.src} alt={second.alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/** Shown until a real photo is added: dot grid, a red glow and the year, so a new entry already looks designed. */
function Placeholder({ m }: { m: Moment }) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(245,245,245,0.1) 1px, transparent 1.4px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(70% 55% at 30% 30%, rgba(209,26,42,0.28), transparent 70%)" }}
      />
      <p className="absolute left-5 top-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-text-muted">
        {m.kind}
      </p>
      <p className="absolute inset-x-5 top-1/2 -translate-y-1/2 font-[family-name:var(--font-serif)] text-[clamp(44px,5.5vw,84px)] leading-[0.95] text-text/90">
        {m.year ?? m.kind}
      </p>
    </div>
  );
}
