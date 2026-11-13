"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { projectLink, projects, type Project } from "@/lib/content/projects";
import { partsFor } from "@/lib/content/planets";
import { sites } from "@/lib/content/sites";
import { PLANETS, stepBody } from "@/lib/system/layout";
import type { SystemScreen, SystemSelection } from "./SolarSystem";

const PLATFORM_LABEL: Record<Project["platform"], string> = {
  mobile: "Mobile",
  web: "Web",
  "web+mobile": "Web + mobile",
  desktop: "Desktop",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** What the text column shows for one selectable thing: a planet's part, or a node on the sun. */
interface Item {
  name: string;
  stage?: string;
  summary: string;
  tech: string[];
  /** Who it's for and what kind of site, for the sun's nodes. */
  meta?: string;
  url?: string;
}

const SUN_COLOR = "#D11A2A";
const SUN_PART = "#ff8a6a";

/** Shown on the sun if no sites are listed. */
const OPEN_SLOT: Item = {
  name: "Open slot",
  stage: "Available",
  summary: "Your project could be the first node here. I build landing pages, portfolios and web apps for businesses and people.",
  tech: ["Landing pages", "Portfolios", "Web apps"],
};

const SUN_ITEMS: Item[] = sites.length
  ? sites.map((c) => ({
      name: c.title,
      stage: c.tag ? `${c.tag} · ${c.year}` : c.year,
      summary: c.summary,
      tech: c.stack ?? [],
      meta: `${c.kind} · ${c.client}`,
      url: c.url,
    }))
  : [OPEN_SLOT];

interface SystemOverlayProps {
  visible: boolean;
  selection: SystemSelection;
  onPlanet: (i: number) => void;
  onPart: (i: number) => void;
  screenRef: React.MutableRefObject<SystemScreen>;
  /** Leave the system for the section above (About) or below (Skills). */
  onLeave: (to: "about" | "skills") => void;
  /** Set when the visitor tried to scroll while the system holds the page. */
  nudge?: { dir: "up" | "down"; n: number } | null;
}

/**
 * One of the two ways out of the system. Big enough to read as a button, numbered like
 * the nav index. When a blocked scroll points its way it lights up red and says why.
 */
function ExitButton({
  to,
  onClick,
  lit,
  className,
}: {
  to: "about" | "skills";
  onClick: () => void;
  lit: boolean;
  className: string;
}) {
  const up = to === "about";
  return (
    <div className={`pointer-events-none absolute flex flex-col ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={up ? "Back up to About" : "Continue down to Skills"}
        className={`pointer-events-auto group relative inline-flex items-center gap-3 border px-3.5 py-2.5 text-left backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:px-4 lg:py-3 ${
          lit
            ? "border-accent bg-[#2a0a0e]/85 shadow-[0_0_0_1px_#D11A2A,0_10px_40px_-10px_rgba(209,26,42,0.7)]"
            : "border-white/30 bg-[#0A0C0F]/80 hover:border-white/70 hover:bg-[#14161a]/90"
        }`}
      >
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center border text-[15px] transition-colors duration-300 lg:h-9 lg:w-9 ${
            lit ? "border-accent bg-accent text-white" : "border-white/25 text-white group-hover:border-white/60"
          }`}
        >
          <span className={`transition-transform duration-300 ${up ? "group-hover:-translate-y-0.5" : "group-hover:translate-y-0.5"} ${lit ? (up ? "animate-[exitUp_0.9s_ease-in-out_infinite]" : "animate-[exitDown_0.9s_ease-in-out_infinite]") : ""}`}>
            {up ? "↑" : "↓"}
          </span>
        </span>
        <span className="block">
          <span className="block font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-white/50 lg:text-[10px]">
            {up ? "01 · Back up" : "03 · Next"}
          </span>
          <span className="mt-0.5 block font-[family-name:var(--font-display)] text-[15px] font-bold leading-none tracking-[-0.01em] text-white lg:text-[18px]">
            {up ? "About" : "Skills"}
          </span>
        </span>
      </button>
    </div>
  );
}

/** Marks a project that isn't ready to show properly yet. */
function BuildingBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 border border-dashed border-white/30 px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-white/65 ${className}`}
    >
      <span aria-hidden="true" className="block h-1.5 w-1.5 animate-pulse bg-white/60" />
      Still being built
    </span>
  );
}

/** Key for the map: what a planet, its bright dots and the sun stand for. */
function Legend() {
  const item = "flex items-center gap-2";
  return (
    <p className="flex items-center gap-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-white/45">
      <span className={item}>
        <span aria-hidden="true" className="block h-3 w-3 rounded-full border border-dashed border-white/50" />
        Planet = a project
      </span>
      <span className={item}>
        <span aria-hidden="true" className="block h-2 w-2 rounded-full bg-white/75 shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
        Bright dot = one part of it
      </span>
      <span className={item}>
        <span aria-hidden="true" className="block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_8px_#D11A2A]" />
        Sun = smaller sites
      </span>
    </p>
  );
}

/** The column's main link: a case study (client-side route), contact (hash link) or an outside site. */
function CtaLink({
  cta,
  className,
  style,
  children,
}: {
  cta: { href: string; external: boolean };
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (cta.external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }
  if (cta.href.startsWith("/#")) {
    // A plain hash link, so the site's scroll handling treats it as navigation.
    return (
      <a href={cta.href} className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className} style={style}>
      {children}
    </Link>
  );
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
export function SystemOverlay({ visible, selection, onPlanet, onPart, screenRef, onLeave, nudge }: SystemOverlayProps) {
  // Which exit a blocked scroll pointed at, shown for a moment.
  const [lit, setLit] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (!nudge) return;
    // Defer so the highlight isn't set synchronously inside the effect.
    const on = setTimeout(() => setLit(nudge.dir), 0);
    const off = setTimeout(() => setLit(null), 2600);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [nudge]);
  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => setLit(null), 0);
    return () => clearTimeout(t);
  }, [visible]);

  // The sun (planet -1) is selectable too: its "parts" are the smaller sites.
  const isSun = selection.planet < 0;
  const project = projects[selection.planet] ?? projects[0]!;
  const parts: Item[] = isSun ? SUN_ITEMS : partsFor(project.slug);
  const part = parts[selection.part] ?? parts[0];
  const layout = PLANETS[selection.planet] ?? PLANETS[0]!;
  const c0 = isSun ? SUN_COLOR : layout.colorA;
  const c1 = isSun ? SUN_PART : layout.partColor;
  const total = projects.length;
  const siteCount = sites.length;
  const bodyKey = isSun ? "sun" : project.slug;
  const partWord = isSun ? "Node" : "Part";

  // Heading for the selected body.
  const eyebrow = isSun
    ? `The sun · ${siteCount ? `${siteCount} ${siteCount === 1 ? "site" : "sites"}` : "Websites"}`
    : `Planet ${pad(selection.planet + 1)} / ${pad(total)} · ${PLATFORM_LABEL[project.platform]}`;
  const title = isSun ? "Websites" : project.name;
  const pitch = isSun
    ? siteCount
      ? "Landing pages, portfolios and business sites. Smaller builds than the planets, each one a node around the sun."
      : "Landing pages and portfolios I build orbit the sun here, one node each. The first slot is open."
    : project.pitch;
  const building = !isSun && !!project.building;
  const statusLine = isSun ? "Newest first · open for commissions" : `${project.status} · ${parts.length} parts`;
  // Where the column's main link goes: the case study, the site itself, or contact.
  const cta = isSun
    ? part?.url
      ? { href: part.url, label: "Visit the site", external: true }
      : { href: "/#footer", label: siteCount ? "Want one? Get in touch" : "Start a project", external: false }
    : projectLink(project);

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

  const prevPlanet = () => onPlanet(stepBody(selection.planet, -1));
  const nextPlanet = () => onPlanet(stepBody(selection.planet, 1));
  const prevPart = () => onPart((selection.part - 1 + parts.length) % parts.length);
  const nextPart = () => onPart((selection.part + 1) % parts.length);

  const btn =
    "pointer-events-auto inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#0A0C0F]/85 text-white/80 transition-colors duration-200 hover:border-white/45 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
        key={`${bodyKey}-${selection.part}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between gap-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em]">
          <span className="text-white/45">
            {part === OPEN_SLOT ? "Node 01 · waiting" : `${partWord} ${pad(selection.part + 1)} / ${pad(parts.length)}`}
          </span>
          {part.stage && <span style={{ color: c1 }}>[ {part.stage} ]</span>}
        </div>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight tracking-tight text-white">
          {part.name}
        </p>
        {part.meta && (
          <p className="mt-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-white/50">{part.meta}</p>
        )}
        <p className="mt-2 text-[13px] leading-relaxed text-white/65">{part.summary}</p>
        {part.tech.length > 0 && (
          <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] leading-relaxed text-white/45">
            {part.tech.join(" / ")}
          </p>
        )}
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
        {title}, {partWord.toLowerCase()} {selection.part + 1} of {parts.length}: {part?.name}. {part?.summary}
      </p>

      {/* ── Markers on the planet ─────────────────────────────────────────── */}
      {parts.map((pt, i) => (
        <button
          key={`${bodyKey}-${pt.name}`}
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
      <ExitButton
        to="about"
        lit={lit === "up"}
        onClick={() => onLeave("about")}
        className="left-4 top-[4.25rem] lg:left-auto lg:right-10 lg:top-[6.75rem] xl:right-14"
      />
      <ExitButton
        to="skills"
        lit={lit === "down"}
        onClick={() => onLeave("skills")}
        className="right-4 top-[4.25rem] lg:bottom-[6rem] lg:right-10 lg:top-auto xl:right-14"
      />
      {/* Said once a blocked scroll happens: why nothing moved, and where to click. */}
      <AnimatePresence>
        {lit && (
          <motion.p
            key={lit}
            role="status"
            initial={{ opacity: 0, y: lit === "up" ? -6 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-none absolute z-10 max-w-[15rem] border border-white/15 bg-[#0A0C0F]/90 px-3 py-2 font-[family-name:var(--font-mono)] text-[10px] uppercase leading-relaxed tracking-[0.14em] text-white/80 ${
              lit === "up"
                ? "left-4 top-[8.25rem] lg:left-auto lg:right-10 lg:top-[11.25rem] xl:right-14"
                : "right-4 top-[8.25rem] text-right lg:bottom-[10.5rem] lg:right-10 lg:top-auto xl:right-14"
            }`}
          >
            Scrolling is paused on the projects. {lit === "up" ? "Use ↑ About to go back up." : "Use Skills ↓ to keep going."}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Desktop: text column ─────────────────────────────────────────── */}
      <div className="absolute left-10 top-1/2 hidden w-[23rem] -translate-y-1/2 lg:block xl:left-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={bodyKey}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em]" style={{ color: c0 }}>
              {eyebrow}
            </p>
            <h3
              className={`mt-3 font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] tracking-[-0.03em] ${building ? "text-white/55" : "text-white"}`}
            >
              {title}
            </h3>
            {building && <BuildingBadge className="mt-3" />}
            <p className="mt-3 text-sm leading-relaxed text-white/60">{pitch}</p>
            <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-white/40">
              {statusLine}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 border-t border-dashed border-white/15 pt-5">{partBody}</div>

        {parts.length > 1 && (
          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={prevPart} aria-label={`Previous ${partWord.toLowerCase()}`} className={btn}>
              <Arrow dir="left" />
            </button>
            <button type="button" onClick={nextPart} aria-label={`Next ${partWord.toLowerCase()}`} className={btn}>
              <Arrow dir="right" />
            </button>
            <div className="ml-1">{partTicks}</div>
          </div>
        )}

        {cta && (
          <CtaLink
            cta={cta}
            className="pointer-events-auto group mt-6 inline-flex items-center gap-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span className="border-b pb-1" style={{ borderColor: c0 }}>
              {cta.label}
            </span>
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: c0 }}>
              {cta.external ? "↗" : "→"}
            </span>
          </CtaLink>
        )}
      </div>

      {/* ── Desktop: orbit rail (planet switcher) ────────────────────────── */}
      <div className="absolute inset-x-0 bottom-7 hidden flex-col items-center gap-3 lg:flex">
        <Legend />
        <div className="flex items-center gap-4">
          <button type="button" onClick={prevPlanet} aria-label="Previous planet" className={btn}>
            <Arrow dir="left" />
          </button>
          <div className="relative flex items-center gap-1" role="group" aria-label="Planets">
            <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-px bg-white/12" />
            <button
              type="button"
              onClick={() => onPlanet(-1)}
              aria-current={isSun ? "true" : undefined}
              aria-label={`The sun: websites${siteCount ? `, ${siteCount} sites` : ""}`}
              className="pointer-events-auto relative mr-3 flex items-center gap-2 bg-[#0A0C0F] px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{ color: isSun ? "#fff" : "rgba(209,26,42,0.9)" }}
            >
              <span
                className="block rounded-full bg-accent transition-all duration-300"
                style={{ width: isSun ? 11 : 9, height: isSun ? 11 : 9, boxShadow: isSun ? "0 0 16px #D11A2A" : "0 0 8px #D11A2A" }}
              />
              Sun
              {siteCount > 0 && <span className="text-white/45">{pad(siteCount)}</span>}
            </button>
            {projects.map((p, i) => {
              const active = i === selection.planet;
              const col = PLANETS[i]?.colorA ?? "#fff";
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => onPlanet(i)}
                  aria-label={p.building ? `${p.name} (still being built)` : p.name}
                  title={p.name}
                  aria-current={active ? "true" : undefined}
                  className="pointer-events-auto relative flex items-center gap-2 bg-[#0A0C0F] px-2.5 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
                  {/* With eight planets the names only all fit on wide screens; otherwise just the selected one. */}
                  <span className={active ? "" : "hidden xl:inline"}>{p.name}</span>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={nextPlanet} aria-label="Next planet" className={btn}>
            <Arrow dir="right" />
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
                {eyebrow}
              </p>
              <p
                className={`mt-1 truncate font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight ${building ? "text-white/55" : "text-white"}`}
              >
                {title}
              </p>
              {building && <BuildingBadge className="mx-auto mt-1.5" />}
              <p className="mt-1 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.12em] text-white/40">
                {isSun ? "Each dot on the ring is a site" : "Planet = project · dots = its parts"}
              </p>
            </div>
            <button type="button" onClick={nextPlanet} aria-label="Next planet" className={btn}>
              <Arrow dir="right" />
            </button>
          </div>
          <div className="mt-3 border-t border-dashed border-white/15 pt-3 [&_p:nth-of-type(2)]:line-clamp-3">{partBody}</div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {parts.length > 1 && (
                <>
                  <button type="button" onClick={prevPart} aria-label={`Previous ${partWord.toLowerCase()}`} className={btn}>
                    <Arrow dir="left" />
                  </button>
                  <button type="button" onClick={nextPart} aria-label={`Next ${partWord.toLowerCase()}`} className={btn}>
                    <Arrow dir="right" />
                  </button>
                </>
              )}
            </div>
            {cta && (
              <CtaLink
                cta={cta}
                className="pointer-events-auto font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white underline decoration-1 underline-offset-4"
                style={{ textDecorationColor: c0 }}
              >
                {isSun || cta.external ? cta.label : "Case study"} {cta.external ? "↗" : "→"}
              </CtaLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
