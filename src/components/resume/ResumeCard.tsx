"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { availability, resume, site } from "@/lib/content/site";

/** Fine paper fibre, drawn once as a tiny SVG so it costs no network request. */
const PAPER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Faint dot grid, like the engineering paper the card is pretending to be. */
const DOT_GRID = "radial-gradient(rgba(60,50,30,0.16) 0.2cqw, transparent 0.26cqw)";

/**
 * Specks drifting off the page. Positions are percentages of a box slightly
 * larger than the card, so most start just outside its edge.
 */
const DUST = [
  { x: 6, y: 80, dx: -22, dy: -60, d: 0, t: 7.5, s: 4, red: true },
  { x: 93, y: 72, dx: 26, dy: -70, d: 1.2, t: 8.5, s: 3, red: false },
  { x: 12, y: 32, dx: -30, dy: -40, d: 2.6, t: 9, s: 3, red: false },
  { x: 90, y: 26, dx: 22, dy: -52, d: 0.8, t: 7, s: 4, red: true },
  { x: 50, y: 97, dx: -8, dy: -84, d: 3.4, t: 9.5, s: 3, red: true },
  { x: 28, y: 94, dx: -18, dy: -72, d: 4.8, t: 8, s: 3, red: false },
  { x: 72, y: 95, dx: 18, dy: -68, d: 2, t: 8.8, s: 4, red: false },
  { x: 3, y: 52, dx: -34, dy: -26, d: 5.5, t: 7.8, s: 3, red: true },
  { x: 97, y: 50, dx: 34, dy: -30, d: 3.9, t: 9.2, s: 3, red: false },
  { x: 38, y: 3, dx: 10, dy: -40, d: 1.8, t: 8.2, s: 3, red: true },
] as const;

export interface ResumeCardProps {
  className?: string;
  /**
   * 0 → 1 "printing" progress. In the pinned section this is driven by scroll, so
   * the page is written out as you scroll. Without it the card prints itself
   * once, the first time it comes into view.
   */
  reveal?: MotionValue<number>;
}

/**
 * A paper preview of the resume, built from the same short text as the PDF.
 *
 * Lifecycle: blank page → a red scan line writes the content in → a stamp lands.
 * Then it idles: the paper drifts, a scanner band sweeps it now and then, a halo
 * breathes behind it and dust lifts off. A cursor tilts it in 3D on desktop.
 *
 * Purely decorative (aria-hidden): the buttons beside it carry the action.
 */
export function ResumeCard({ className = "", reveal }: ResumeCardProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  // Self-driven print progress, used when no scroll-driven one is supplied.
  const own = useMotionValue(reduced ? 1 : 0);
  const progress = reveal ?? own;
  const inView = useInView(rootRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (reveal || reduced || !inView) return;
    const controls = animate(own, 1, { duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.2 });
    return () => controls.stop();
  }, [reveal, reduced, inView, own]);

  // "Done" flips once, when the page has finished printing.
  const [done, setDone] = useState(() => progress.get() >= 0.999);
  useMotionValueEvent(progress, "change", (v) => {
    const d = v >= 0.999;
    setDone((prev) => (prev === d ? prev : d));
  });

  const clip = useTransform(progress, (v) => `inset(0 0 ${Math.max(0, (1 - v) * 100)}% 0)`);
  const lineTop = useTransform(progress, (v) => `${v * 100}%`);
  const lineOpacity = useTransform(progress, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);

  // Cursor tilt, sprung so it settles instead of snapping.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 160, damping: 20, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 160, damping: 20, mass: 0.4 });
  const rotateY = useTransform(sx, [0, 1], [-11, 11]);
  const rotateX = useTransform(sy, [0, 1], [9, -9]);
  const glare = useTransform(
    [sx, sy],
    ([x, y]: number[]) =>
      `radial-gradient(520px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.6), transparent 55%)`,
  );

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType === "touch" || !rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  const { preview } = resume;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`[perspective:1100px] ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="resume-float relative">
        {/* Halo */}
        <div
          className="resume-breathe pointer-events-none absolute -inset-[16%] -z-10 rounded-[45%] blur-2xl"
          style={{ background: "radial-gradient(closest-side, rgba(209,26,42,0.38), transparent 78%)" }}
        />

        {/* Dust */}
        <div className="pointer-events-none absolute -inset-[10%] -z-10">
          {DUST.map((p, i) => (
            <span
              key={i}
              className="resume-dust absolute rounded-full"
              style={
                {
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.s,
                  height: p.s,
                  background: p.red ? "#ff4d5b" : "#f3f0ea",
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  "--d": `${p.d}s`,
                  "--t": `${p.t}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <motion.div
          className="relative aspect-[8.5/11] w-full [container-type:inline-size]"
          style={{
            rotateX: reduced ? 0 : rotateX,
            rotateY: reduced ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Soft shadow under the paper. A separate layer, not a filter on the
              paper, because filtering text under a 3D transform makes it soft. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[5%] bottom-[-3%] top-[10%] -z-10 rounded-[3%] bg-black/70 blur-[28px]"
          />
          {/* The paper, with its top-right corner folded over */}
          <div
            className="absolute inset-0 overflow-hidden bg-[#F3F0EA] text-[#1b1b1b]"
            style={{ clipPath: "polygon(0 0, calc(100% - 8cqw) 0, 100% 8cqw, 100% 100%, 0 100%)" }}
          >
            <div className="absolute inset-0" style={{ backgroundImage: DOT_GRID, backgroundSize: "3.4cqw 3.4cqw" }} />
            <div
              className="absolute inset-0 opacity-[0.1] mix-blend-multiply"
              style={{ backgroundImage: PAPER_GRAIN }}
            />

            {/* Document tab */}
            <div className="absolute inset-x-0 top-0 flex h-[6.4cqw] items-center justify-between bg-accent px-[7.5cqw] font-[family-name:var(--font-mono)] text-[2.3cqw] font-semibold uppercase tracking-[0.22em] text-white/90">
              <span>Resume</span>
              <span className="mr-[6cqw]">PDF · 1 page</span>
            </div>

            {/* Folded corner flap */}
            <div
              className="absolute right-0 top-0 h-[8cqw] w-[8cqw]"
              style={{ background: "linear-gradient(45deg, #cfc7b6 50%, transparent 50%)" }}
            />

            {/* Printed content, uncovered top to bottom by the scan line */}
            <motion.div
              className="absolute inset-0 flex flex-col justify-between px-[7.5cqw] pb-[6.5cqw] pt-[10.5cqw]"
              style={{ clipPath: clip }}
            >
              <header>
                <p className="font-[family-name:var(--font-serif)] text-[12cqw] leading-[0.92] tracking-tight">
                  {site.name}
                </p>
                <p className="mt-[2cqw] font-[family-name:var(--font-body)] text-[4.1cqw] font-medium text-[#3d3a34]">
                  {preview.role}
                </p>
                <p className="mt-[0.8cqw] font-[family-name:var(--font-mono)] text-[2.7cqw] text-[#7a7468]">
                  {preview.location}
                </p>
              </header>

              {preview.blocks.map((b) => (
                <section key={b.label}>
                  <p className="mb-[1.3cqw] border-b border-[#d7d0c1] pb-[0.8cqw] font-[family-name:var(--font-mono)] text-[2.5cqw] font-semibold uppercase leading-none tracking-[0.18em] text-accent">
                    {b.label}
                  </p>
                  <p className="text-[3.6cqw] font-semibold leading-[1.3] text-[#1b1b1b]">{b.lines[0]}</p>
                  <p className="text-[3.1cqw] leading-[1.35] text-[#6b665c]">{b.lines[1]}</p>
                </section>
              ))}
            </motion.div>

            {/* Print head: a red line with a faint trail, riding the reveal edge */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 z-10"
              style={{ top: lineTop, opacity: lineOpacity }}
            >
              <div
                className="absolute inset-x-0 bottom-0 h-[16cqw]"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(209,26,42,0.2))" }}
              />
              <div className="h-[0.55cqw] bg-accent shadow-[0_0_2.4cqw_0.6cqw_rgba(209,26,42,0.7)]" />
            </motion.div>

            {/* Idle scanner band, only once the page is printed */}
            {done && !reduced && (
              <div className="resume-scan pointer-events-none absolute inset-x-0 top-0 z-10 h-[22%]">
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent, rgba(209,26,42,0.14))" }}
                />
                <div className="absolute inset-x-0 bottom-0 h-[0.4cqw] bg-accent/80 shadow-[0_0_2cqw_0.4cqw_rgba(209,26,42,0.55)]" />
              </div>
            )}

            {/* Moving highlight */}
            {!reduced && (
              <motion.div
                className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light"
                style={{ backgroundImage: glare }}
              />
            )}
          </div>

          {/* Availability stamp, slammed onto the corner once the page is done */}
          {availability.active && (
            <motion.div
              className="absolute -right-[5%] bottom-[33%] z-30 flex items-center gap-[1.8cqw] rounded-[1.2cqw] bg-accent px-[3cqw] py-[1.8cqw] font-[family-name:var(--font-mono)] text-[3cqw] font-bold uppercase leading-none tracking-[0.18em] text-white shadow-[0_1.4cqw_3.4cqw_rgba(0,0,0,0.45)]"
              initial={false}
              animate={
                done || reduced
                  ? { opacity: 1, scale: 1, rotate: -8 }
                  : { opacity: 0, scale: 2.1, rotate: -22 }
              }
              transition={{ type: "spring", stiffness: 380, damping: 17, mass: 0.7 }}
            >
              <span className="resume-pulse h-[2cqw] w-[2cqw] rounded-full bg-white" />
              {availability.label}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
