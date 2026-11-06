"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { projects, type Project } from "@/lib/content/projects";
import { partsFor } from "@/lib/content/planets";
import { PLANETS } from "@/lib/system/layout";
import type { SystemScreen, SystemSelection } from "./SolarSystem";

const PLATFORM_LABEL: Record<Project["platform"], string> = {
  mobile: "Mobile",
  web: "Web",
  "web+mobile": "Web + mobile",
};

const pad = (n: number) => String(n).padStart(2, "0");

interface SystemOverlayProps {
  visible: boolean;
  selection: SystemSelection;
  onPlanet: (i: number) => void;
  onPart: (i: number) => void;
  screenRef: React.MutableRefObject<SystemScreen>;
  /** Leave the system for the section above (About) or below (Skills). */
  onLeave: (to: "about" | "skills") => void;
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      {dir === "left" ? <path d="M10 3 5 8l5 5" /> : <path d="m6 3 5 5-5 5" />}
    </svg>
  );
}

/**
 * Words and controls for the project solar system. The wrapper is pointer
 * transparent; only buttons and links opt back in. While the system is showing the
 * page is locked, so the About and Skills buttons are the ways out.
 */
export function SystemOverlay({ visible, selection, onPlanet, onPart, screenRef, onLeave }: SystemOverlayProps) {
  const project = projects[selection.planet] ?? projects[0]!;
  const parts = partsFor(project.slug);
  const part = parts[selection.part] ?? parts[0];
  const layout = PLANETS[selection.planet] ?? PLANETS[0]!;
  const c0 = layout.colorA;
  const c1 = layout.partColor;
  const total = projects.length;

  // ── Labels pinned to the part orbs (positions come from the canvas each frame) ──
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tagRef = useRef<HTMLDivElement>(null);
  const selRef = useRef(selection);
  useEffect(() => {
    selRef.current = selection;
  }, [selection]);

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const tick = () => {
      const s = screenRef.current;
      const sel = selRef.current;
      markerRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = s.parts[i];
        const show = s.ready && !!p && p.front;
        el.style.opacity = show ? (i === sel.part ? "0" : "1") : "0";
        el.style.pointerEvents = show && i !== sel.part ? "auto" : "none";
        if (p) el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
      });
      const tag = tagRef.current;
      const p = s.parts[sel.part];
      if (tag) {
        const show = s.ready && !!p;
        tag.style.opacity = show ? "1" : "0";
        if (p) {
          tag.style.transform = `translate(${p.x}px, ${p.y}px)`;
          // Put the name on whichever side has room. Phones show the name in the
          // sheet below, so the ring alone marks the part there.
          const vw = window.innerWidth;
          const need = 70 + (tag.textContent?.length ?? 20) * 7.6;
          tag.dataset.flip = String(vw - p.x < need && p.x > vw - p.x);
          tag.dataset.compact = String(vw < 640);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, screenRef]);

  const nextPartName = parts[(selection.part + 1) % parts.length]?.name ?? "";
  const nextPlanetIdx = (selection.planet + 1) % total;
  const nextPlanet_ = projects[nextPlanetIdx]!;
  const nextPlanetCol = PLANETS[nextPlanetIdx]?.colorA ?? "#fff";
  const prevPlanetName = projects[(selection.planet - 1 + total) % total]!.name;
  // Until the visitor has moved once, the "next part" button breathes, so it's obvious
  // that this is something you step through.
  const [first] = useState(selection);
  const touched = selection.planet !== first.planet || selection.part !== first.part;

  const prevPlanet = () => onPlanet((selection.planet - 1 + total) % total);
  const nextPlanet = () => onPlanet((selection.planet + 1) % total);
  const prevPart = () => onPart((selection.part - 1 + parts.length) % parts.length);
  const nextPart = () => onPart((selection.part + 1) % parts.length);

  const btn =
    "pointer-events-auto inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#0A0C0F]/85 text-white/80 transition-colors duration-200 hover:border-white/45 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  const exitBtn =
    "pointer-events-auto group absolute inline-flex items-center gap-2 border-b border-white/25 pb-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-white/65 transition-colors duration-200 hover:border-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

  const nextPartBtn = (
    <button
      type="button"
      onClick={nextPart}
      aria-label={`Next part: ${nextPartName}`}
      className="pointer-events-auto group relative flex min-h-[48px] min-w-0 flex-1 items-center justify-between gap-3 border px-4 py-2 text-left transition-colors duration-200 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ borderColor: c0, background: `${c0}14` }}
    >
      {!touched && (
        <span aria-hidden="true" className="absolute -inset-[4px] animate-pulse border" style={{ borderColor: `${c0}99` }} />
      )}
      <span className="min-w-0">
        <span className="block font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-white/55">Next part</span>
        <span className="mt-0.5 block truncate text-[14px] font-semibold text-white">{nextPartName}</span>
      </span>
      <span aria-hidden="true" className="text-lg transition-transform duration-300 group-hover:translate-x-1" style={{ color: c0 }}>
        →
      </span>
    </button>
  );

  const partTicks = (
    <div className="flex items-center gap-1.5" role="group" aria-label="Parts">
      {parts.map((pt, i) => (
        <button
          key={pt.name}
          type="button"
          onClick={() => onPart(i)}
         
          aria-label={`${pad(i + 1)} ${pt.name}`}
          aria-current={i === selection.part ? "true" : undefined}
          className="pointer-events-auto group flex h-6 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span
            className="block h-[3px] transition-all duration-300"
            style={{
              width: i === selection.part ? 22 : 8,
              background: i === selection.part ? c0 : "rgba(255,255,255,0.28)",
            }}
          />
        </button>
      ))}
    </div>
  );

  const partBody = part && (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${project.slug}-${selection.part}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between gap-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em]">
          <span className="text-white/45">
            Part {pad(selection.part + 1)} / {pad(parts.length)}
          </span>
          {part.stage && <span style={{ color: c1 }}>[ {part.stage} ]</span>}
        </div>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight tracking-tight text-white">
          {part.name}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/65">{part.summary}</p>
        <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] leading-relaxed text-white/45">
          {part.tech.join(" / ")}
        </p>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      data-system-ui=""
      className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Spoken summary of the current planet and part */}
      <p className="sr-only" aria-live="polite">
        {project.name}, part {selection.part + 1} of {parts.length}: {part?.name}. {part?.summary}
      </p>

      {/* ── Markers on the planet ─────────────────────────────────────────── */}
      {parts.map((pt, i) => (
        <button
          key={`${project.slug}-${pt.name}`}
          ref={(el) => {
            markerRefs.current[i] = el;
          }}
          type="button"
          tabIndex={-1}
          onClick={() => onPart(i)}
         
          aria-label={pt.name}
          className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center font-[family-name:var(--font-mono)] text-[9px] text-white/70 opacity-0 transition-opacity duration-300"
        >
          <span className="translate-x-[14px] -translate-y-[12px]">{pad(i + 1)}</span>
        </button>
      ))}
      <div ref={tagRef} aria-hidden="true" className="group absolute left-0 top-0 opacity-0 transition-opacity duration-300">
        <span className="absolute -left-[13px] -top-[13px] block h-[26px] w-[26px] rounded-full border" style={{ borderColor: c0 }} />
        <span
          className="absolute left-[13px] top-0 block h-px w-10 group-data-[compact=true]:hidden group-data-[flip=true]:left-auto group-data-[flip=true]:right-[13px]"
          style={{ background: `linear-gradient(to right, ${c0}, transparent)` }}
        />
        <span className="absolute left-[58px] -top-[9px] whitespace-nowrap font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-white group-data-[compact=true]:hidden group-data-[flip=true]:left-auto group-data-[flip=true]:right-[58px]">
          {pad(selection.part + 1)} · {part?.name}
        </span>
      </div>


      {/* ── Ways out: scrolling is locked while the system shows ─────────── */}
      <button type="button" onClick={() => onLeave("about")} className={`${exitBtn} left-4 top-[4.75rem] lg:left-auto lg:right-10 lg:top-[6.5rem]`}>
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
        About
      </button>
      <button type="button" onClick={() => onLeave("skills")} className={`${exitBtn} right-4 top-[4.75rem] lg:bottom-[5.75rem] lg:right-10 lg:top-auto`}>
        Skills
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
      </button>

      {/* ── Desktop: text column ─────────────────────────────────────────── */}
      <div className="absolute left-10 top-1/2 hidden w-[23rem] -translate-y-1/2 lg:block xl:left-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em]" style={{ color: c0 }}>
              Planet {pad(selection.planet + 1)} / {pad(total)} · {PLATFORM_LABEL[project.platform]}
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-white">
              {project.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{project.pitch}</p>
            <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-white/40">
              {project.status} · {parts.length} parts
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 border-t border-dashed border-white/15 pt-5">{partBody}</div>

        <div className="mt-5 flex items-stretch gap-2">
          <button type="button" onClick={prevPart} aria-label="Previous part" className={`${btn} h-auto w-12`}>
            <Arrow dir="left" />
          </button>
          {nextPartBtn}
        </div>
        <div className="mt-3">{partTicks}</div>

        <Link
          href={`/projects/${project.slug}`}
         
          className="pointer-events-auto group mt-6 inline-flex items-center gap-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span className="border-b pb-1" style={{ borderColor: c0 }}>
            Open case study
          </span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: c0 }}>
            →
          </span>
        </Link>
      </div>

      {/* ── Desktop: orbit rail (planet switcher) ────────────────────────── */}
      <div className="absolute inset-x-0 bottom-7 hidden justify-center lg:flex">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={prevPlanet}
            aria-label={`Previous planet: ${prevPlanetName}`}
            className={`${btn} h-10 w-auto gap-2 px-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em]`}
          >
            <Arrow dir="left" />
            Prev
          </button>
          <div className="relative flex items-center gap-1" role="group" aria-label="Planets">
            <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-px bg-white/12" />
            <span aria-hidden="true" className="relative mr-3 flex items-center gap-2 bg-[#0A0C0F] px-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-accent">
              <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_#D11A2A]" />
              Sun
            </span>
            {projects.map((p, i) => {
              const active = i === selection.planet;
              const col = PLANETS[i]?.colorA ?? "#fff";
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => onPlanet(i)}
                 
                  aria-current={active ? "true" : undefined}
                  className="pointer-events-auto relative flex items-center gap-2 bg-[#0A0C0F] px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}
                >
                  <span
                    className="block rounded-full transition-all duration-300"
                    style={{
                      width: active ? 10 : 7,
                      height: active ? 10 : 7,
                      background: col,
                      boxShadow: active ? `0 0 14px ${col}` : "none",
                      opacity: active ? 1 : 0.6,
                    }}
                  />
                  {p.name}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={nextPlanet}
            aria-label={`Next planet: ${nextPlanet_.name}`}
            className="pointer-events-auto group inline-flex h-10 items-center gap-2.5 border bg-[#0A0C0F]/90 px-4 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            style={{ borderColor: nextPlanetCol }}
          >
            <span className="text-white/55">Next planet</span>
            <span className="h-2 w-2 rounded-full" style={{ background: nextPlanetCol }} />
            {nextPlanet_.name}
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              <Arrow dir="right" />
            </span>
          </button>
        </div>
      </div>

      {/* ── Phones and tablets: sheet under the planet ───────────────────── */}
      <div className="absolute inset-x-3 bottom-3 lg:hidden">
        <div className="border border-white/12 bg-[#0A0C0F]/88 p-4 backdrop-blur-xl" style={{ borderTopColor: c0 }}>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={prevPlanet} aria-label="Previous planet" className={btn}>
              <Arrow dir="left" />
            </button>
            <div className="min-w-0 text-center">
              <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em]" style={{ color: c0 }}>
                Planet {pad(selection.planet + 1)} / {pad(total)} · {PLATFORM_LABEL[project.platform]}
              </p>
              <p className="mt-1 truncate font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-white">
                {project.name}
              </p>
            </div>
            <button
              type="button"
              onClick={nextPlanet}
              aria-label={`Next planet: ${nextPlanet_.name}`}
              className={`${btn} w-auto gap-1.5 px-2.5 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.12em]`}
              style={{ borderColor: nextPlanetCol }}
            >
              {nextPlanet_.name}
              <Arrow dir="right" />
            </button>
          </div>
          <div className="mt-3 border-t border-dashed border-white/15 pt-3 [&_p:nth-of-type(2)]:line-clamp-3">{partBody}</div>
          <div className="mt-3 flex items-stretch gap-2">
            <button type="button" onClick={prevPart} aria-label="Previous part" className={`${btn} h-auto w-11`}>
              <Arrow dir="left" />
            </button>
            {nextPartBtn}
          </div>
          <div className="mt-2.5 flex justify-end">
            <Link
              href={`/projects/${project.slug}`}
              className="pointer-events-auto font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white underline decoration-1 underline-offset-4"
              style={{ textDecorationColor: c0 }}
            >
              Case study →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
