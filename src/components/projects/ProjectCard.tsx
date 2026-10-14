"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import type { Project } from "@/lib/content/projects";

interface ProjectCardProps {
  project: Project;
  /** 1-based position, shown as 01, 02 ... */
  index: number;
  /** Wide card: cover and text sit side by side on larger screens. */
  wide?: boolean;
  /** Wide card with the cover on the right. */
  flip?: boolean;
}

/** "Thesis build · closest to launch" -> ["Thesis build", "Closest to launch"] */
function splitStatus(status: string): [string, string | null] {
  const [kind, ...rest] = status.split(" · ");
  const note = rest.join(" · ");
  return [kind ?? status, note ? note.charAt(0).toUpperCase() + note.slice(1) : null];
}

/**
 * A project, readable without hovering: plain-language summary first (for anyone),
 * role and stack second (for engineers), honest build status always visible.
 *
 * The cover is drawn, not photographed: no product exists to screenshot yet, so it is an
 * abstract wireframe in the project's own colours instead of a fake UI.
 */
export function ProjectCard({ project, index, wide = false, flip = false }: ProjectCardProps) {
  const [a, b] = project.identityGradient;
  const [kind, note] = splitStatus(project.status);
  const stack = project.techStack.slice(0, wide ? 5 : 3);
  const extra = project.techStack.length - stack.length;

  // Cursor light, same idea as SpotlightCard, tinted with the project colour.
  function onMove(e: PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }

  return (
    <Link
      href={`/projects/${project.slug}`}
      onPointerMove={onMove}
      style={{ "--spot": `${a}cc` } as React.CSSProperties}
      className={`spotlight-card group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-[transform,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
        wide ? (flip ? "lg:flex-row-reverse" : "md:flex-row") : ""
      }`}
    >
      <Cover project={project} index={index} wide={wide} flip={flip} a={a} b={b} />

      <div className={`relative flex flex-1 flex-col p-6 ${wide ? (flip ? "lg:p-8" : "md:p-8") : ""}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-text-muted">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a }} />
            {kind}
          </span>
          {note && (
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em]" style={{ color: a }}>
              {note}
            </span>
          )}
        </div>

        <h3
          className={`mt-4 font-[family-name:var(--font-display)] font-bold tracking-tight text-text ${
            wide ? "text-4xl md:text-5xl" : "text-3xl"
          }`}
        >
          {project.name}
        </h3>

        <p className={`mt-3 leading-relaxed text-text ${wide ? "max-w-xl text-lg" : "line-clamp-3 text-[15px]"}`}>
          {project.plain}
        </p>

        {wide && (
          <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-relaxed text-text-muted">{project.description}</p>
        )}

        <p className="mt-4 font-[family-name:var(--font-mono)] text-xs text-text-muted">
          {project.role}
          <span aria-hidden="true" className="mx-2 text-white/20">
            /
          </span>
          {project.teamSize}
        </p>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={`${project.name} technologies`}>
          {stack.map((tech) => (
            <li
              key={tech}
              className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-text-muted"
            >
              {tech}
            </li>
          ))}
          {extra > 0 && (
            <li className="px-1 py-1 font-[family-name:var(--font-mono)] text-[11px] text-text-muted/70">+{extra}</li>
          )}
        </ul>

        <p className="mt-auto flex items-center justify-between pt-7 font-[family-name:var(--font-display)] text-sm font-semibold text-text">
          <span>Read the case study</span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover:border-transparent group-hover:bg-accent group-hover:text-white"
          >
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </span>
        </p>
      </div>
    </Link>
  );
}

/* ───────────────────────────── cover art ───────────────────────────── */

function Cover({
  project,
  index,
  wide,
  flip,
  a,
  b,
}: {
  project: Project;
  index: number;
  wide: boolean;
  flip: boolean;
  a: string;
  b: string;
}) {
  const mobile = project.platform === "mobile" || project.platform === "web+mobile";
  const web = project.platform === "web" || project.platform === "web+mobile";
  const letter = project.name.charAt(0).toUpperCase();

  return (
    <div
      aria-hidden="true"
      className={`relative isolate shrink-0 overflow-hidden border-b border-border ${
        wide
          ? flip
            ? "h-52 lg:h-auto lg:w-[42%] lg:border-b-0 lg:border-l"
            : "h-52 md:h-auto md:w-[42%] md:border-b-0 md:border-r"
          : "h-44"
      }`}
      style={{
        background: `radial-gradient(120% 95% at 15% 0%, ${a}38, transparent 60%), radial-gradient(90% 90% at 100% 100%, ${b}30, transparent 62%), #141414`,
      }}
    >
      {/* dot grid, fading toward the bottom */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(rgba(245,245,245,0.13) 1px, transparent 1.4px)",
          backgroundSize: "16px 16px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      {/* oversized outlined initial */}
      <span
        className={`absolute -right-3 -top-4 select-none font-[family-name:var(--font-display)] font-bold leading-none text-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-2 ${
          wide ? "text-[11rem]" : "text-[8.5rem]"
        }`}
        style={{ WebkitTextStroke: `1px ${a}55` }}
      >
        {letter}
      </span>

      <span className="absolute left-5 top-4 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.2em] text-white/70">
        {String(index).padStart(2, "0")}
      </span>

      {/* wireframe devices, bleeding off the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-3 pr-4 md:pr-8">
        {web && <BrowserWire tint={a} wide={wide} lifted={mobile} />}
        {mobile && <PhoneWire tint={b === a ? a : b} wide={wide} />}
      </div>
    </div>
  );
}

function BrowserWire({ tint, wide, lifted }: { tint: string; wide: boolean; lifted: boolean }) {
  return (
    <svg
      viewBox="0 0 220 140"
      className={`translate-y-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0 ${
        wide ? "w-[68%]" : "w-[62%]"
      } ${lifted ? "-rotate-3" : ""}`}
      fill="none"
    >
      <rect x="1" y="1" width="218" height="150" rx="12" fill="#0d0d0d" fillOpacity=".7" stroke={tint} strokeOpacity=".55" strokeWidth="1.5" />
      <path d="M1 26h218" stroke={tint} strokeOpacity=".3" />
      <circle cx="15" cy="14" r="3" fill={tint} fillOpacity=".6" />
      <circle cx="27" cy="14" r="3" fill={tint} fillOpacity=".35" />
      <circle cx="39" cy="14" r="3" fill={tint} fillOpacity=".2" />
      <rect x="16" y="42" width="96" height="9" rx="4.5" fill={tint} fillOpacity=".5" />
      <rect x="16" y="60" width="140" height="6" rx="3" fill="#fff" fillOpacity=".12" />
      <rect x="16" y="73" width="110" height="6" rx="3" fill="#fff" fillOpacity=".08" />
      <rect x="16" y="96" width="58" height="26" rx="7" fill={tint} fillOpacity=".22" stroke={tint} strokeOpacity=".5" />
      <rect x="150" y="40" width="54" height="82" rx="8" fill="#fff" fillOpacity=".04" stroke="#fff" strokeOpacity=".1" />
    </svg>
  );
}

function PhoneWire({ tint, wide }: { tint: string; wide: boolean }) {
  return (
    <svg
      viewBox="0 0 84 160"
      className={`translate-y-8 rotate-3 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:rotate-0 ${
        wide ? "w-[36%]" : "w-[26%]"
      }`}
      fill="none"
    >
      <rect x="1.5" y="1.5" width="81" height="170" rx="15" fill="#0d0d0d" fillOpacity=".78" stroke={tint} strokeOpacity=".6" strokeWidth="1.5" />
      <rect x="29" y="9" width="26" height="5" rx="2.5" fill={tint} fillOpacity=".4" />
      <rect x="12" y="28" width="44" height="7" rx="3.5" fill={tint} fillOpacity=".5" />
      <rect x="12" y="42" width="60" height="5" rx="2.5" fill="#fff" fillOpacity=".12" />
      <circle cx="42" cy="88" r="21" stroke={tint} strokeOpacity=".55" strokeWidth="3" strokeDasharray="90 42" strokeLinecap="round" />
      <rect x="12" y="122" width="60" height="16" rx="8" fill={tint} fillOpacity=".25" stroke={tint} strokeOpacity=".5" />
    </svg>
  );
}
