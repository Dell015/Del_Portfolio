"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { background, momentPhotos, moments, type DiscoveredPhoto, type Moment } from "@/lib/content/timeline";
import { useSnapScroll } from "@/components/SmoothScroll";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { EASE } from "@/components/motion/tokens";
import { DriftParticles } from "./DriftParticles";

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
export function Credentials({ photosBySlug = {} }: { photosBySlug?: Record<string, DiscoveredPhoto[]> }) {
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
      <DriftParticles className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
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
              <MomentRow key={`${m.title}-${i}`} moment={m} flip={i % 2 === 1} found={photosBySlug[m.slug]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MomentRow({ moment: m, flip, found }: { moment: Moment; flip: boolean; found?: DiscoveredPhoto[] }) {
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
        className={`grid grid-cols-1 items-center gap-8 md:gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] ${
          flip ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <MomentCard m={m} flip={flip} lit={lit} reduced={!!reduced} />
        <MomentVisual m={m} found={found} flip={flip} lit={lit} progress={scrollYProgress} reduced={!!reduced} />
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
  found,
  flip,
  lit,
  progress,
  reduced,
}: {
  m: Moment;
  found?: DiscoveredPhoto[];
  flip: boolean;
  lit: boolean;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const photos = momentPhotos(m, found);
  const main = photos[0];
  const s = flip ? -1 : 1;

  // Each layer travels a different distance over the same scroll: that difference is the parallax.
  const frameY = useSpring(useTransform(progress, [0, 1], [70, -70]), SPRING);
  const frameRotate = useTransform(progress, [0, 0.5, 1], [4 * s, -1.5 * s, -4 * s]);
    const yearX = useTransform(progress, [0, 1], [90 * s, -90 * s]);

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
        {photos.length > 1 ? (
          <>
            <div className="md:hidden">
              <PhotoStack photos={photos} year={m.year} flip={flip} lit={lit} reduced={reduced} />
            </div>
            <div className="hidden md:block">
              <PhotoSpread photos={photos} year={m.year} flip={flip} lit={lit} reduced={reduced} progress={progress} />
            </div>
          </>
        ) : (
          <motion.div
            className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
            style={{ aspectRatio: main?.width && main?.height ? `${main.width} / ${main.height}` : "4 / 5" }}
            initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
            animate={lit ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
            transition={{ duration: 1.1, ease: EASE.out }}
          >
            {main ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={main.src}
                alt={main.alt}
                width={main.width}
                height={main.height}
                loading="lazy"
                className="block h-full w-full"
              />
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
        )}
      </motion.div>
    </div>
  );
}

/**
 * Desktop: the moment's photos float around the main one, each layer travelling a different
 * distance as you scroll. Click the main photo to bring the next one up (no arrows needed).
 */
function PhotoSpread({
  photos,
  year,
  flip,
  lit,
  reduced,
  progress,
}: {
  photos: ReturnType<typeof momentPhotos>;
  year?: string;
  flip: boolean;
  lit: boolean;
  reduced: boolean;
  progress: MotionValue<number>;
}) {
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const s = flip ? -1 : 1;
  const n = photos.length;
  const next = () => setOrder((o) => [...o.slice(1), o[0]!]);

  // Per-layer travel: this difference between layers is the parallax.
  const y1 = useSpring(useTransform(progress, [0, 1], [150, -170]), SPRING);
  const y2 = useSpring(useTransform(progress, [0, 1], [-70, 90]), SPRING);
  const r1 = useTransform(progress, [0, 1], [7 * s, -3 * s]);
  const r2 = useTransform(progress, [0, 1], [-8 * s, 4 * s]);

  const slot = (k: number) => photos[order[k]!];
  const a = slot(0)!;
  const b = n > 1 ? slot(1) : undefined;
  const c = n > 2 ? slot(2) : undefined;

  const frame =
    "overflow-hidden rounded-xl border border-border bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]";
  const img = (p: NonNullable<typeof a>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" draggable={false} className="pointer-events-none block h-full w-full" />
  );

  return (
    <div className="relative select-none">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30 }}
        animate={lit ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.9, ease: EASE.out }}
        className="relative"
      >
        {b && (
          <motion.div
            aria-hidden="true"
            className="absolute z-0 w-[54%]"
            style={{ [flip ? "left" : "right"]: "-34%", bottom: "-16%", y: reduced ? 0 : y1, rotate: reduced ? 0 : r1 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={b.src}
                className={frame}
                style={{ aspectRatio: b.width && b.height ? `${b.width} / ${b.height}` : "4 / 5" }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 0.95, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, ease: EASE.out }}
              >
                {img(b)}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
        {c && (
          <motion.div
            aria-hidden="true"
            className="absolute z-0 w-[44%]"
            style={{ [flip ? "right" : "left"]: "-30%", top: "-14%", y: reduced ? 0 : y2, rotate: reduced ? 0 : r2 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={c.src}
                className={frame}
                style={{ aspectRatio: c.width && c.height ? `${c.width} / ${c.height}` : "4 / 5" }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 0.9, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45, ease: EASE.out }}
              >
                {img(c)}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        <button
          type="button"
          onClick={next}
          aria-label={`Photo ${order[0]! + 1} of ${n}. Show the next photo`}
          className="relative z-[2] block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={a.src}
              className={`relative ${frame}`}
              style={{ aspectRatio: a.width && a.height ? `${a.width} / ${a.height}` : "4 / 5" }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.45, ease: EASE.out }}
            >
              {img(a)}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              {year && (
                <p className="pointer-events-none absolute bottom-3 right-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em]">
                  <span className="rounded-sm bg-accent px-1.5 py-0.5 text-white">{year.split(" ")[0]}</span>
                </p>
              )}
              <p className="pointer-events-none absolute bottom-3 left-3 font-[family-name:var(--font-mono)] text-[10px] tracking-[0.18em] text-white/75">
                {String(order[0]! + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </p>
            </motion.div>
          </AnimatePresence>
        </button>
      </motion.div>
    </div>
  );
}

/**
 * Every photo of a moment, kept at its own proportions, in one stack. Swipe, drag or tap the
 * top photo (or use the arrows) to send it to the back and bring up the next one.
 */
function PhotoStack({
  photos,
  year,
  flip,
  lit,
  reduced,
}: {
  photos: ReturnType<typeof momentPhotos>;
  year?: string;
  flip: boolean;
  lit: boolean;
  reduced: boolean;
}) {
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const s = flip ? -1 : 1;
  const n = photos.length;
  const next = () => setOrder((o) => [...o.slice(1), o[0]!]);
  const prev = () => setOrder((o) => [o[o.length - 1]!, ...o.slice(0, -1)]);
  const topNumber = order[0]! + 1;

  return (
    <div className="select-none">
      <motion.div
        className="grid"
        initial={reduced ? false : { opacity: 0, y: 30 }}
        animate={lit ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.9, ease: EASE.out }}
      >
        {/* Back-to-front so the top photo paints last */}
        {[...order].reverse().map((photoIdx) => {
          const depth = order.indexOf(photoIdx);
          const p = photos[photoIdx]!;
          const top = depth === 0;
          const visible = depth < 3;
          return (
            <motion.div
              key={p.src}
              className="relative z-0 [grid-area:1/1] self-center justify-self-center overflow-hidden rounded-xl border border-border bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
              style={{
                width: "100%",
                aspectRatio: p.width && p.height ? `${p.width} / ${p.height}` : "4 / 5",
                zIndex: n - depth,
                touchAction: "pan-y",
                cursor: top ? "grab" : "default",
              }}
              animate={{
                rotate: depth === 0 ? 0 : (depth % 2 ? 1 : -1) * (2.5 + depth * 1.5) * s,
                x: depth * 10 * s,
                y: depth * -4,
                scale: 1 - depth * 0.035,
                opacity: visible ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              drag={top ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 500) next();
              }}
              onTap={() => {
                if (top) next();
              }}
              aria-hidden={!top}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" draggable={false} className="pointer-events-none block h-full w-full" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              {year && top && (
                <p className="pointer-events-none absolute bottom-3 right-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em]">
                  <span className="rounded-sm bg-accent px-1.5 py-0.5 text-white">{year.split(" ")[0]}</span>
                </p>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Counter + controls */}
      <div className="mt-5 flex items-center justify-between font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <span aria-live="polite">
          <span className="text-text">{String(topNumber).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
        </span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            →
          </button>
        </span>
      </div>
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
