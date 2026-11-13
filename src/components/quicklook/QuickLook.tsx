"use client";

import "./quicklook.css";
import Image from "next/image";
import Link from "next/link";
import { ViewSwitch } from "@/components/mode/ViewSwitch";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useModeStore } from "@/lib/store/mode";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { site, stats, contact, footer, resume, availability } from "@/lib/content/site";
import { projects, type Project, projectLink } from "@/lib/content/projects";
import { skills, skillCategories } from "@/lib/content/skills";
import { background, moments, momentPhotos, type DiscoveredPhoto } from "@/lib/content/timeline";
import { ContactForm } from "@/components/footer/ContactForm";
import { CopyEmailButton } from "@/components/ui/CopyEmailButton";
import { Appear, Build, Cursor, Draw, Drop, Gap, PEOPLE, Prop, Rulers, Select, Toggle, Typed, rand, type Who } from "./kit";

const pad = (n: number) => String(n).padStart(2, "0");
/** Everyone in the file, for handing out small jobs (chips, rows, links) round-robin. */
const CREW: Who[] = ["design", "code", "motion", "qa", "a11y", "copy", "randel"];
const crew = (seed: string) => CREW[Math.floor(rand(seed) * CREW.length)]!;
const PLATFORM: Record<Project["platform"], string> = { mobile: "Mobile", web: "Web", "web+mobile": "Web + mobile", desktop: "Desktop" };

// Copy shared with the full experience's About scene.
const ABOUT_LEAD = "I build web and mobile apps, front end to back end.";
const ABOUT_P1 = "Mostly Next.js, React and Supabase on the web, and React Native or Flutter on mobile.";
const ABOUT_P2 =
  "I'm drawn to problems people quietly put up with, then to solving them in a way that isn't the obvious one. Usually the interesting angle is also the simpler one.";

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";
const mono = "font-[family-name:var(--font-mono)]";
const display = "font-[family-name:var(--font-display)]";

/** "# 02 About ————" typed by a11y, then the rule drawn across. Must sit inside a <Build>. */
function FrameLabel({ n, name, at = 0 }: { n: string; name: string; at?: number }) {
  return (
    <p className={`mb-7 flex items-center gap-2 ${mono} text-[11px] text-white/35`}>
      <Appear at={at} className="text-accent">#</Appear>
      <Typed text={n} from={at} to={at + 0.02} />
      <span className="text-white/65">
        <Typed text={name} from={at + 0.02} to={at + 0.07} who="a11y" />
      </span>
      <Toggle
        at={at + 0.07}
        className="h-px flex-1 origin-left bg-white/10 transition-transform duration-700 ease-out data-[on=false]:scale-x-0"
      />
    </p>
  );
}

/** Section heading: "copy" types it, "Randel" turns the last words red. */
function SectionHead({ n, name, lead, accent, intro }: { n: string; name: string; lead: string; accent: string; intro?: string }) {
  return (
    <Build>
      <FrameLabel n={n} name={name} />
      <h2 className={`${display} text-[clamp(2.2rem,5.2vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-text`}>
        <Typed text={lead} from={0.04} to={0.22} a="lead" caret={PEOPLE.copy.color} />
        <Toggle at={0.48} a="acc" className="text-accent transition-colors duration-300 data-[on=false]:text-text">
          <Typed text={accent} from={0.22} to={0.3} caret={PEOPLE.copy.color} />
        </Toggle>
      </h2>
      {intro && (
        <p data-a="intro" className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/60">
          <Typed text={intro} from={0.32} to={0.56} who="motion" />
        </p>
      )}
      <Cursor
        who="copy"
        keys={[
          { at: 0.04, to: "lead", x: 0, y: 0.7 },
          { at: 0.22, to: "lead", x: 1, y: 0.7 },
          { at: 0.3, to: "acc", x: 1, y: 0.7 },
          { at: 0.34, to: "intro", x: 0.3, y: 0.5, click: true },
        ]}
      />
      <Select target="acc" from={0.36} to={0.62} who="randel" name="Text" pad={4} />
      <Prop target="acc" from={0.44} to={0.66} who="randel">
        <span className="text-white/45">Fill</span> #F5F5F5 → <span className="text-[#ff5a66]">#D11A2A</span>
      </Prop>
      <Cursor
        who="randel"
        keys={[
          { at: 0.38, to: "acc", x: 0.15, y: 0.25 },
          { at: 0.47, to: "acc", x: 0.6, y: 0.6, click: true },
          { at: 0.62, to: "acc", x: 0.75, y: 0.8 },
        ]}
      />
    </Build>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Presence() {
  const people = Object.keys(PEOPLE) as Who[];
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex -space-x-1.5">
        {people.map((w, i) => (
          <Toggle
            key={w}
            at={0.03 + i * 0.012}
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0d0e11] ${mono} text-[9px] font-bold uppercase transition-[opacity,transform] duration-300 ease-out data-[on=false]:scale-50 data-[on=false]:opacity-0`}
            style={{ background: PEOPLE[w].color, color: PEOPLE[w].ink }}
          >
            {w === "code" ? "</>" : w === "a11y" ? "A" : PEOPLE[w].label[0]}
          </Toggle>
        ))}
      </span>
      <span className={`${mono} text-[11px] text-white/50`}>
        <Typed text={`${people.length} editing · all of them are me`} from={0.12} to={0.2} who="qa" />
      </span>
    </span>
  );
}

function Hero({ play }: { play: boolean }) {
  const [replay, setReplay] = useState(0);
  const still = !!useReducedMotion();
  // "Developer." / "Designer." / "Team lead." / "Which one are you about to meet?"
  const lines = site.heroQuestion.split(/(?<=\.)\s+/);
  const ends = [0.24, 0.33, 0.42, 0.55];
  const starts = [0.16, 0.25, 0.34, 0.43];

  return (
    <section id="hero" data-snap-section="" className="relative">
      <Build
        mode="time"
        play={play}
        replay={replay}
        duration={7.5}
        className={`${wrap} grid min-h-[100svh] content-center gap-8 pb-16 pt-24 sm:gap-12 sm:pt-28 lg:grid-cols-[1.12fr_1fr] lg:items-center lg:gap-14 lg:pt-24`}
      >
        <div>
          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span data-a="file" className={`border border-white/12 bg-white/[0.03] px-2 py-1 ${mono} text-[11px] text-white/60`}>
              <Typed text="randel-serafica.fig" from={0.06} to={0.11} />
            </span>
            <Presence />
          </div>
          <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-white/45`}>
            <Typed text={`${site.name} · Cauayan, Isabela`} from={0.08} to={0.15} who="a11y" />
          </p>
          <Toggle
            as="h1"
            at={0.62}
            a="h1"
            className={`mt-5 ${display} text-[clamp(2.6rem,6.4vw,4.9rem)] font-bold leading-[1] tracking-[-0.035em] text-text data-[on=false]:font-[family-name:var(--font-serif)] data-[on=false]:font-normal data-[on=false]:tracking-normal`}
          >
            {lines.map((l, i) => {
              const typed = <Typed text={l} from={starts[i] ?? 0.4} to={ends[i] ?? 0.55} a={`l${i}`} caret={PEOPLE.copy.color} />;
              if (i === 1)
                return (
                  <Toggle key={l} at={0.72} a="dev" className="block w-fit text-accent transition-colors duration-300 data-[on=false]:text-text">
                    {typed}
                  </Toggle>
                );
              if (i === lines.length - 1)
                return (
                  <span key={l} className="mt-3 block text-[0.42em] font-medium leading-tight tracking-[-0.01em] text-white/55">
                    {typed}
                  </span>
                );
              return (
                <span key={l} className="block">
                  {typed}
                </span>
              );
            })}
          </Toggle>
          <p data-a="lede" className="mt-7 max-w-[34rem] text-[16px] leading-relaxed text-white/65">
            <Typed text={site.identityStatement} from={0.44} to={0.64} who="motion" />
          </p>
          <div data-a="cta" className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              data-a="cta1"
              className={`inline-flex min-h-[44px] items-center gap-2 bg-accent px-5 ${mono} text-[12px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#b01522] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
            >
              <Typed text="See my projects" from={0.79} to={0.84} /> <span aria-hidden="true">↓</span>
            </a>
            <a
              href="#footer"
              data-a="cta2"
              className={`inline-flex min-h-[44px] items-center border border-white/20 px-5 ${mono} text-[12px] uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
            >
              <Typed text="Get in touch" from={0.82} to={0.87} />
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className={`inline-flex items-center gap-2 ${mono} text-[11px] text-white/55`}>
              <Typed text={availability.label} from={0.86} to={0.92} who="qa" />
            </span>
            {!still && (
              <button
                type="button"
                data-a="replay"
                onClick={() => setReplay((r) => r + 1)}
                className={`${mono} text-[11px] text-white/35 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
              >
                <Typed text="↻ replay the build" from={0.91} to={0.96} who="a11y" />
              </button>
            )}
          </div>
        </div>

        <Drop at={0.37} show={0.5} file="randel.webp · 2000 × 1265" a="photo" className="relative order-first mx-auto w-full max-w-md lg:order-none lg:max-w-none">
          <Image
            src="/images/randel.webp"
            alt="Randel Serafica"
            width={2000}
            height={1265}
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
            className="h-auto w-full"
            style={{
              maskImage: "radial-gradient(120% 95% at 50% 40%, black 60%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(120% 95% at 50% 40%, black 60%, transparent 100%)",
            }}
          />
        </Drop>

        <Draw target="file" at={0.0} len={0.06} who="design" />
        <Draw target="cta1" at={0.73} len={0.06} who="motion" size />
        <Draw target="cta2" at={0.76} len={0.06} who="a11y" />
        <Draw target="replay" at={0.88} len={0.03} who="qa" cursor={false} />

        {/* design: frames the heading, then swaps its font */}
        <Select target="h1" from={0.05} to={0.66} who="design" name="Heading / H1" />
        <Cursor
          who="design"
          keys={[
            { at: 0.05, to: "h1", x: 0, y: 0 },
            { at: 0.15, to: "h1", x: 1, y: 1 },
            { at: 0.52, to: "h1", x: 0.96, y: 0.08 },
            { at: 0.61, to: "h1", x: 0.96, y: 0.08, click: true },
            { at: 0.7, to: "lede", x: 0.2, y: 0 },
          ]}
        />
        <Prop target="h1" from={0.55} to={0.72} who="design" side="above">
          <span className="text-white/45">Font</span> Instrument Serif → <span className="text-[#F2A541]">Space Grotesk · Bold</span>
        </Prop>
        <Gap a="h1" b="lede" from={0.66} to={0.8} />

        {/* copy: types every line */}
        <Cursor
          who="copy"
          keys={lines.flatMap((_, i) => [
            { at: starts[i] ?? 0.4, to: `l${i}`, x: 0, y: 0.75 },
            { at: ends[i] ?? 0.55, to: `l${i}`, x: 1, y: 0.75 },
          ])}
        />

        {/* Randel: turns "Developer." red */}
        <Select target="dev" from={0.65} to={0.84} who="randel" name="Text" pad={4} />
        <Prop target="dev" from={0.7} to={0.86} who="randel">
          <span className="text-white/45">Fill</span> #F5F5F5 → <span className="text-[#ff5a66]">#D11A2A</span>
        </Prop>
        <Cursor
          who="randel"
          keys={[
            { at: 0.65, to: "dev", x: 0.1, y: 0.2 },
            { at: 0.71, to: "dev", x: 0.55, y: 0.6, click: true },
            { at: 0.84, to: "dev", x: 0.7, y: 0.8 },
          ]}
        />

        {/* code: drags the portrait in, then wires the buttons */}
        <Select target="photo" from={0.5} to={0.68} who="code" name="Image · randel.webp" />
        <Cursor
          who="code"
          carry={{ from: 0.2, to: 0.37, label: "randel.webp" }}
          keys={[
            { at: 0.22, to: "photo", x: 0.92, y: 0.12 },
            { at: 0.37, to: "photo", x: 0.5, y: 0.5, click: true },
            { at: 0.56, to: "photo", x: 0.82, y: 0.86 },
            { at: 0.76, to: "cta", x: 0.12, y: 0.5 },
            { at: 0.8, to: "cta", x: 0.12, y: 0.5, click: true },
          ]}
        />
      </Build>
    </section>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

/** When each stat card gets drawn: in order, each a little off the beat. */
const statAt = (i: number, label: string) => 0.4 + i * 0.05 + rand(label) * 0.04;

function About() {
  return (
    <section id="about" data-snap-section="" className="relative">
      <Build className={`${wrap} py-24 lg:py-32`}>
        <FrameLabel n="02" name="About" />
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div>
            <h2 className={`${display} text-[clamp(1.8rem,3.6vw,2.7rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text`}>
              <Typed text={ABOUT_LEAD} from={0.06} to={0.4} a="lead" caret={PEOPLE.copy.color} />
            </h2>
            <p data-a="p1" className="mt-8 max-w-xl text-[16px] leading-relaxed text-white/70">
              <Typed text={ABOUT_P1} from={0.42} to={0.54} who="motion" />
            </p>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/50">
              <Typed text={ABOUT_P2} from={0.47} to={0.68} who="a11y" />
            </p>
          </div>
          <div data-a="stats" className="grid grid-cols-2 gap-3 self-start">
            {stats.map((s, i) => (
              <div key={s.label} data-a={`s${i}`} className="border border-white/10 bg-[#121418] p-5">
                {i === 0 ? (
                  <Toggle at={0.74} className={`block ${display} text-5xl font-bold tracking-tight text-accent transition-colors duration-300 data-[on=false]:text-text`}>
                    <Typed text={s.value} from={0.52} to={0.55} />
                  </Toggle>
                ) : (
                  <span className={`block ${display} text-5xl font-bold tracking-tight text-text`}>
                    <Typed text={s.value} from={statAt(i, s.label) + 0.06} to={statAt(i, s.label) + 0.09} />
                  </span>
                )}
                <span className={`mt-2 block ${mono} text-[10px] uppercase tracking-[0.14em] text-white/45`}>
                  <Typed text={s.label} from={statAt(i, s.label) + 0.08} to={statAt(i, s.label) + 0.14} who={i % 2 ? "qa" : "code"} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <Cursor
          who="copy"
          keys={[
            { at: 0.06, to: "lead", x: 0, y: 0.15 },
            { at: 0.4, to: "lead", x: 0.9, y: 0.9 },
            { at: 0.44, to: "p1", x: 0.2, y: 0.5, click: true },
          ]}
        />
        <Gap a="lead" b="p1" from={0.47} to={0.64} />
        {stats.map((s, i) => (
          <Draw key={s.label} target={`s${i}`} at={statAt(i, s.label)} len={0.06} who={i % 2 ? "qa" : "code"} size={i === 0} />
        ))}
        <Select target="stats" from={0.56} to={0.86} who="design" name="Auto layout · 2 × 2" />
        <Prop target="stats" from={0.6} to={0.88} who="design" side="below">
          <span className="text-white/45">Gap</span> 12 · <span className="text-white/45">Padding</span> 20 · <span className="text-white/45">Fill</span> #121418
        </Prop>
        <Cursor
          who="design"
          keys={[
            { at: 0.56, to: "stats", x: 0, y: 0 },
            { at: 0.64, to: "stats", x: 1, y: 1 },
            { at: 0.86, to: "stats", x: 0.9, y: 0.95 },
          ]}
        />
        <Cursor
          who="randel"
          keys={[
            { at: 0.68, to: "s0", x: 0.2, y: 0.3 },
            { at: 0.74, to: "s0", x: 0.25, y: 0.35, click: true },
            { at: 0.84, to: "s0", x: 0.5, y: 0.6 },
          ]}
        />
      </Build>
    </section>
  );
}

// ─── Projects ────────────────────────────────────────────────────────────────

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const [framer, typer] = (i % 2 === 0 ? ["design", "copy"] : ["randel", "code"]) as [Who, Who];
  const [c0, c1] = p.identityGradient;
  const single = c0.toLowerCase() === c1.toLowerCase();
  const fill = single ? `linear-gradient(135deg, ${c0}, #1b1b1b 85%)` : `linear-gradient(135deg, ${c0}, ${c1})`;
  // Only Karela and Tag.Ai have case studies; others link to their site, or nowhere.
  const link = projectLink(p);
  const Card = link ? "a" : "div";
  return (
    <Build offset={["start 0.72", "start 0.06"]}>
      <Card
        {...(link ? { href: link.href, ...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {}) } : {})}
        data-a="card"
        className="group block border border-white/10 bg-[#111316] transition-colors duration-300 hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Drop at={0.22} show={0.36} file={`${p.slug}-cover.png`} a="cover">
          <div className={`relative h-40 overflow-hidden sm:h-44 ${p.building ? "opacity-60 grayscale" : ""}`} style={{ background: fill }}>
            <span className={`absolute -bottom-8 right-3 ${display} text-[10rem] font-bold leading-none text-black/20`}>
              {p.name[0]?.toUpperCase()}
            </span>
            <span className={`absolute left-4 top-4 ${mono} text-[10px] uppercase tracking-[0.16em] text-black/65`}>
              {pad(i + 1)} · {PLATFORM[p.platform]}
            </span>
            {p.accentColor && <span className="absolute bottom-4 left-4 h-2 w-2 rounded-full" style={{ background: p.accentColor }} />}
          </div>
        </Drop>
        <div className="p-5 sm:p-6">
          <p className={`${mono} text-[10px] uppercase tracking-[0.14em] text-white/45`}>
            <Typed text={p.building ? "Still being built" : p.status} from={0.34} to={0.4} who="a11y" />
          </p>
          <h3 className={`mt-2 ${display} text-3xl font-bold tracking-tight text-text`}>
            <Typed text={p.name} from={0.4} to={0.5} a="name" caret={PEOPLE[typer].color} />
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-white/65">
            <Typed text={p.plain} from={0.5} to={0.66} who="motion" />
          </p>
          <p className={`mt-3 ${mono} text-[11px] text-white/40`}>
            <Typed text={`${p.role} · ${p.teamSize}`} from={0.58} to={0.66} who="qa" />
          </p>
          <ul data-a="chips" className="mt-4 flex flex-wrap gap-1.5">
            {p.techStack.slice(0, 4).map((t, k) => (
              <li key={t} data-a={`chip${k}`} className={`border border-white/12 px-2 py-1 ${mono} text-[10px] text-white/60`}>
                {t}
              </li>
            ))}
          </ul>
          {link && (
            <p data-a="link" className={`mt-6 inline-flex items-center gap-2 ${mono} text-[11px] uppercase tracking-[0.16em] text-white`}>
              <Toggle at={0.79} className="border-b border-accent pb-0.5 transition-[border-color] duration-300 data-[on=false]:border-transparent">
                <Typed text={link.label} from={0.72} to={0.79} />
              </Toggle>
              <Appear at={0.79}>
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  {link.external ? "↗" : "→"}
                </span>
              </Appear>
            </p>
          )}
        </div>
      </Card>

      <Draw target="card" at={0.04} len={0.1} who={framer} cursor={false} size />
      <Select target="card" from={0.14} to={0.3} who={framer} name={`Frame · ${p.name}`} pad={3} />
      {p.techStack.slice(0, 4).map((t, k) => (
        <Draw key={t} target={`chip${k}`} at={0.6 + k * 0.035 + rand(`${p.slug}${t}`) * 0.05} len={0.04} who={crew(`${p.slug}${t}`)} cursor={rand(`${t}c`) > 0.4} />
      ))}
      <Prop target="cover" from={0.4} to={0.58} who={framer} side="below">
        <span className="text-white/45">Fill</span> linear 135° · {c0} → {single ? "#1B1B1B" : c1}
      </Prop>
      <Cursor
        who={framer}
        keys={[
          { at: 0.04, to: "card", x: 0, y: 0 },
          { at: 0.14, to: "card", x: 1, y: 1 },
          { at: 0.38, to: "cover", x: 0.7, y: 0.35 },
          { at: 0.42, to: "cover", x: 0.7, y: 0.35, click: true },
          { at: 0.56, to: "cover", x: 0.85, y: 0.6 },
        ]}
      />
      <Cursor
        who={typer}
        carry={{ from: 0.1, to: 0.22, label: `${p.slug}-cover.png` }}
        keys={[
          { at: 0.12, to: "cover", x: 0.3, y: 0.2 },
          { at: 0.22, to: "cover", x: 0.4, y: 0.5, click: true },
          { at: 0.4, to: "name", x: 0, y: 0.7 },
          { at: 0.5, to: "name", x: 1, y: 0.7 },
          { at: 0.68, to: "chips", x: 0.7, y: 0.5 },
          ...(link
            ? [
                { at: 0.8, to: "link", x: 0.4, y: 0.5 },
                { at: 0.83, to: "link", x: 0.4, y: 0.5, click: true },
              ]
            : []),
        ]}
      />
    </Build>
  );
}

function Projects() {
  return (
    <section id="projects" data-snap-section="" className="relative">
      <div className={`${wrap} py-24 lg:py-28`}>
        <SectionHead
          n="03"
          name="Projects"
          lead="Things I’ve "
          accent="built."
          intro="Apps I've designed and built, from mobile and web to a Windows desktop app. Karela is closest to launch; the rest are in active development."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Skills ──────────────────────────────────────────────────────────────────

function SkillGroup({ i, label, items }: { i: number; label: string; items: string[] }) {
  const who = (["code", "design", "copy", "randel", "code"] as Who[])[i] ?? "code";
  const step = 0.42 / Math.max(1, items.length);
  return (
    <Build offset={["start 0.75", "start 0.22"]}>
      <div data-a="group" className="h-full border border-white/10 bg-[#111316] p-5">
        <div className={`flex items-center justify-between ${mono} text-[10px] uppercase tracking-[0.16em] text-white/40`}>
          <span>
            <Typed text={label} from={0.1} to={0.16} who="a11y" />
          </span>
          <span>
            <Typed text={pad(items.length)} from={0.15} to={0.17} />
          </span>
        </div>
        <ul data-a="chips" className="mt-4 flex flex-wrap gap-1.5">
          {items.map((s, k) => (
            <li key={s} data-a={k === 0 ? "first" : `c${k}`} className="border border-white/12 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-white/80">
              {s}
            </li>
          ))}
        </ul>
      </div>
      <Draw target="group" at={0.0} len={0.09} who={who === "design" ? "motion" : "design"} size />
      {items.map((s, k) => (
        <Draw
          key={s}
          target={k === 0 ? "first" : `c${k}`}
          at={0.18 + k * step + rand(s) * step * 1.4}
          len={0.035}
          who={k === 0 ? who : crew(s)}
          cursor={k > 0 && rand(`${s}c`) > 0.45}
        />
      ))}
      <Cursor
        who={who}
        carry={{ from: 0.04, to: 0.2, label: items[0] ?? "" }}
        keys={[
          { at: 0.08, to: "chips", x: 0.4, y: 0 },
          { at: 0.2, to: "first", x: 0.5, y: 0.5, click: true },
          { at: 0.68, to: "chips", x: 0.85, y: 0.9 },
        ]}
      />
      {i === 1 && (
        <>
          <Select target="group" from={0.62} to={0.9} who="design" name="Auto layout · wrap" pad={3} />
          <Prop target="group" from={0.66} to={0.92} who="design" side="below">
            <span className="text-white/45">Gap</span> 6 · <span className="text-white/45">Padding</span> 20 · <span className="text-white/45">Hug</span>
          </Prop>
        </>
      )}
    </Build>
  );
}

function Skills() {
  return (
    <section id="skills" data-snap-section="" className="relative">
      <div className={`${wrap} py-24 lg:py-28`}>
        <SectionHead n="04" name="Skills" lead="Tech I " accent="work with." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((c, i) => (
            <SkillGroup key={c.key} i={i} label={c.label} items={skills.filter((s) => s.category === c.key).map((s) => s.name)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Track record ────────────────────────────────────────────────────────────

function Track({ photosBySlug }: { photosBySlug: Record<string, DiscoveredPhoto[]> }) {
  const rows = [...moments].reverse();
  return (
    <section id="background" data-snap-section="" className="relative">
      <div className={`${wrap} py-24 lg:py-28`}>
        <SectionHead n="05" name="Track record" lead="The track record " accent="so far." intro={background.intro} />
        <Build offset={["start 0.72", "start 0"]} className="mt-12">
          <ol data-a="list" className="border-y border-white/10">
            {rows.map((m, i) => {
              const at = 0.08 + i * 0.1 + rand(m.slug) * 0.05;
              const photo = momentPhotos(m, photosBySlug[m.slug] ?? [])[0];
              return (
                <li
                  key={m.slug}
                  data-a={`row${i}`}
                  className="grid grid-cols-[4.75rem_1fr] items-center gap-x-4 gap-y-3 border-b border-white/10 py-4 last:border-b-0 sm:grid-cols-[6.5rem_8rem_1fr_auto] sm:py-5"
                >
                  <span className={`${mono} text-[11px] text-white/45`}>
                    <Typed text={String(m.year ?? m.kind)} from={at + 0.04} to={at + 0.06} />
                  </span>
                  <span className={`hidden ${mono} text-[10px] uppercase tracking-[0.16em] text-accent sm:inline`}>
                    <Typed text={m.kind} from={at + 0.05} to={at + 0.08} />
                  </span>
                  <div className="min-w-0">
                    <p className={`${display} text-lg font-semibold leading-snug text-text`}>
                      {i === 0 ? (
                        <Typed text={m.title} from={at} to={at + 0.12} a="t0" caret={PEOPLE.copy.color} />
                      ) : (
                        <Typed text={m.title} from={at + 0.05} to={at + 0.12} who={crew(m.slug)} />
                      )}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-white/50">
                      <Typed text={m.subtitle} from={at + 0.08} to={at + 0.15} />
                    </p>
                  </div>
                  {photo ? (
                    <Drop at={at + 0.02} show={at + 0.09} file={decodeURIComponent(photo.src.split("/").pop() ?? "photo.jpg")} a={`ph${i}`} className="col-start-2 w-fit sm:col-start-auto">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        width={photo.width ?? 4}
                        height={photo.height ?? 3}
                        sizes="140px"
                        className="h-14 w-auto max-w-[9rem] object-contain sm:h-16"
                      />
                    </Drop>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                </li>
              );
            })}
          </ol>
          <Draw target="list" at={0.0} len={0.07} who="design" size />
          {rows.map((m, i) => (
            <Draw key={m.slug} target={`row${i}`} at={0.05 + i * 0.1 + rand(m.slug) * 0.05} len={0.05} who={crew(`${m.slug}r`)} cursor={i % 2 === 1} />
          ))}
          <Cursor
            who="copy"
            keys={[
              { at: 0.08, to: "t0", x: 0, y: 0.7 },
              { at: 0.2, to: "t0", x: 1, y: 0.7 },
            ]}
          />
          <Select target="row0" from={0.22} to={0.46} who="design" name="Row · auto layout · hug" pad={2} />
          <Cursor
            who="design"
            keys={[
              { at: 0.22, to: "row0", x: 0, y: 0 },
              { at: 0.3, to: "row0", x: 1, y: 1 },
              { at: 0.46, to: "row1", x: 0.6, y: 0.4 },
            ]}
          />
          <Cursor
            who="code"
            carry={{ from: 0.14, to: 0.2, label: "photo.jpg" }}
            keys={[
              { at: 0.16, to: "ph1", x: 0.2, y: 0.2 },
              { at: 0.2, to: "ph1", x: 0.5, y: 0.5, click: true },
              { at: 0.4, to: "ph3", x: 0.5, y: 0.5 },
              { at: 0.42, to: "ph3", x: 0.5, y: 0.5, click: true },
              { at: 0.62, to: "ph5", x: 0.5, y: 0.5 },
            ]}
          />
        </Build>
      </div>
    </section>
  );
}

// ─── Resume ──────────────────────────────────────────────────────────────────

function Resume() {
  const href: string = resume.href;
  const hasFile = href !== "#";
  return (
    <section id="resume" data-snap-section="" className="relative">
      <Build className={`${wrap} grid gap-12 py-24 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-20 lg:py-28`}>
        <div>
          <FrameLabel n="06" name="Resume" />
          <h2 className={`${display} text-[clamp(2.2rem,5.2vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-text`}>
            <Typed text="The one-page version." from={0.08} to={0.3} a="h2" caret={PEOPLE.copy.color} />
          </h2>
          <div data-a="dl" className="mt-8 flex flex-wrap items-center gap-4">
            <a
              data-a="dlbtn"
              href={hasFile ? href : `mailto:${contact.email}?subject=Resume%20request`}
              {...(hasFile ? { download: resume.fileName } : {})}
              className={`inline-flex min-h-[44px] items-center gap-2 bg-accent px-5 ${mono} text-[12px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#b01522] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
            >
              <Typed text={hasFile ? resume.ctaLabel : resume.requestLabel} from={0.5} to={0.56} /> <span aria-hidden="true">↓</span>
            </a>
            <span className={`${mono} text-[11px] text-white/45`}>
              <Typed text={resume.meta} from={0.56} to={0.66} who="qa" />
            </span>
          </div>
        </div>
        <Drop at={0.12} show={0.28} file={resume.fileName} a="paper" className="w-full max-w-[22rem] justify-self-center lg:w-[22rem]">
          <div className="bg-[#F4F1EA] p-6 text-[#141414] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            <p className={`${display} text-lg font-bold leading-tight`}>
              <Typed text={site.name} from={0.28} to={0.31} who="copy" />
            </p>
            <p className="mt-0.5 text-[11px] text-black/55">
              <Typed text={`${resume.preview.role} · ${resume.preview.location}`} from={0.31} to={0.35} />
            </p>
            <div className="mt-4 space-y-3">
              {resume.preview.blocks.map((b, bi) => {
                // Each block typed in turn, the label first, then its lines.
                const start = 0.35 + bi * 0.08;
                return (
                  <div key={b.label}>
                    <p className={`${mono} text-[9px] uppercase tracking-[0.16em] text-[#B3121F]`}>
                      <Typed text={b.label} from={start} to={start + 0.015} />
                    </p>
                    {b.lines.map((l, li) => (
                      <p key={l} className="text-[11px] leading-snug text-black/75">
                        <Typed text={l} from={start + 0.015 + li * 0.03} to={start + 0.045 + li * 0.03} who={li === 0 ? "copy" : undefined} caret="#141414" />
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </Drop>

        <Cursor
          who="code"
          carry={{ from: 0.02, to: 0.12, label: resume.fileName }}
          keys={[
            { at: 0.04, to: "paper", x: 0.3, y: 0.2 },
            { at: 0.12, to: "paper", x: 0.5, y: 0.45, click: true },
            { at: 0.3, to: "paper", x: 0.8, y: 0.9 },
          ]}
        />
        <Cursor
          who="copy"
          keys={[
            { at: 0.08, to: "h2", x: 0, y: 0.7 },
            { at: 0.3, to: "h2", x: 1, y: 0.7 },
          ]}
        />
        <Select target="paper" from={0.32} to={0.62} who="design" name="Frame · A4" />
        <Prop target="paper" from={0.36} to={0.64} who="design" side="below">
          <span className="text-white/45">Export</span> PDF · 1 page
        </Prop>
        <Cursor
          who="design"
          keys={[
            { at: 0.32, to: "paper", x: 0, y: 0 },
            { at: 0.42, to: "paper", x: 1, y: 1 },
            { at: 0.62, to: "paper", x: 0.9, y: 0.96 },
          ]}
        />
        <Draw target="dlbtn" at={0.44} len={0.06} who="motion" size />
        <Cursor
          who="randel"
          keys={[
            { at: 0.5, to: "dl", x: 0.15, y: 0.5 },
            { at: 0.56, to: "dl", x: 0.15, y: 0.5, click: true },
            { at: 0.68, to: "dl", x: 0.3, y: 0.8 },
          ]}
        />
      </Build>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

const linkAt = (i: number, label: string) => 0.46 + i * 0.04 + rand(label) * 0.04;

function Contact({ contactEnabled }: { contactEnabled: boolean }) {
  // "Let's build something " + "worth" + " shipping."
  const [pre, post] = footer.personalityLine.split("worth");
  const links = [
    { label: "GitHub", value: "@Dell015", href: contact.github },
    { label: "LinkedIn", value: "randel-serafica", href: contact.linkedin },
    { label: "Facebook", value: "randel.serafica.2024", href: contact.facebook },
    { label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
  ];
  return (
    <footer id="footer" data-snap-section="" className="relative border-t border-white/10">
      <Build className={`${wrap} pb-0 pt-24 lg:pt-28`}>
        <FrameLabel n="07" name="Contact" />
        <h2 className={`${display} max-w-3xl text-[clamp(2.4rem,6vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-text`}>
          <Typed text={pre ?? ""} from={0.04} to={0.22} a="pre" caret={PEOPLE.copy.color} />
          <Toggle
            at={0.4}
            a="worth"
            className="text-accent transition-colors duration-300 data-[on=true]:font-[family-name:var(--font-serif)] data-[on=true]:font-normal data-[on=true]:italic data-[on=false]:text-text"
          >
            <Typed text="worth" from={0.22} to={0.26} caret={PEOPLE.copy.color} />
          </Toggle>
          <Typed text={post ?? ""} from={0.26} to={0.32} caret={PEOPLE.copy.color} />
        </h2>

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div data-a="mail" className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${contact.email}`}
                className={`${display} text-[1.3rem] font-semibold [overflow-wrap:anywhere] text-text underline decoration-accent decoration-2 underline-offset-[6px] transition-colors hover:text-white sm:text-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
              >
                <Typed text={contact.email} from={0.42} to={0.5} />
              </a>
              <span data-a="copy" className="inline-flex">
                <CopyEmailButton />
              </span>
            </div>
            <ul data-a="links" className="mt-8 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
              {links.map((l, i) => (
                <li key={l.label} data-a={`ln${i}`} className="bg-[#0f1013]">
                  <a
                    href={l.href}
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex min-h-[64px] flex-col justify-center px-4 py-3 transition-colors hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className={`${mono} text-[10px] uppercase tracking-[0.16em] text-white/40`}>
                      <Typed text={l.label} from={linkAt(i, l.label) + 0.04} to={linkAt(i, l.label) + 0.06} />
                    </span>
                    <span className="mt-1 text-[14px] text-white/85">
                      <Typed text={l.value} from={linkAt(i, l.label) + 0.05} to={linkAt(i, l.label) + 0.1} who={crew(l.label)} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div data-a="form">
            <ContactForm enabled={contactEnabled} />
          </div>
        </div>

        <Cursor
          who="copy"
          keys={[
            { at: 0.04, to: "pre", x: 0, y: 0.7 },
            { at: 0.22, to: "pre", x: 1, y: 0.7 },
            { at: 0.32, to: "worth", x: 1.6, y: 0.7 },
          ]}
        />
        <Select target="worth" from={0.33} to={0.56} who="randel" name="Text" pad={4} />
        <Prop target="worth" from={0.38} to={0.58} who="randel" side="below">
          <span className="text-white/45">Font</span> Instrument Serif Italic · <span className="text-white/45">Fill</span>{" "}
          <span className="text-[#ff5a66]">#D11A2A</span>
        </Prop>
        <Cursor
          who="randel"
          keys={[
            { at: 0.34, to: "worth", x: 0.2, y: 0.3 },
            { at: 0.4, to: "worth", x: 0.5, y: 0.6, click: true },
            { at: 0.56, to: "worth", x: 0.7, y: 0.9 },
          ]}
        />
        <Cursor
          who="code"
          keys={[
            { at: 0.44, to: "mail", x: 0.3, y: 0.5 },
            { at: 0.48, to: "mail", x: 0.3, y: 0.5, click: true },
            { at: 0.6, to: "form", x: 0.4, y: 0.2 },
          ]}
        />
        <Draw target="copy" at={0.5} len={0.04} who="qa" />
        <Draw target="links" at={0.42} len={0.05} who="design" cursor={false} />
        {links.map((l, i) => (
          <Draw key={l.label} target={`ln${i}`} at={linkAt(i, l.label)} len={0.04} who={crew(`${l.label}d`)} cursor={i % 2 === 0} />
        ))}
        <Draw target="form" at={0.5} len={0.1} who="design" size />
      </Build>

      {/* The view switch and the last line get their own build: they sit far below the heading. */}
      <Build className={`${wrap} pb-16`} offset={["start 0.85", "start 0.3"]}>
        <div className="mt-24 border-t border-white/10 pt-14">
          <ViewSwitch />
        </div>
        <Draw target="vs-eyebrow" at={0.02} len={0.05} who="a11y" cursor={false} />
        <Draw target="vs-title" at={0.08} len={0.1} who="copy" />
        <Draw target="vs-immersive" at={0.2} len={0.14} who="motion" size />
        <Draw target="vs-clean" at={0.3} len={0.14} who="design" size />
        <Cursor
          who="randel"
          keys={[
            { at: 0.5, to: "vs-immersive", x: 0.8, y: 0.2 },
            { at: 0.6, to: "vs-immersive", x: 0.85, y: 0.15, click: true },
            { at: 0.74, to: "end", x: 0.1, y: 0.5 },
          ]}
        />

        <div
          data-a="end"
          className={`mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 ${mono} text-[11px] text-white/40`}
        >
          <span>
            <Typed text={`© ${new Date().getFullYear()} ${site.name}`} from={0.62} to={0.72} who="qa" />
          </span>
          <Link
            href="/privacy"
            className="underline decoration-white/20 underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Typed text="Privacy" from={0.7} to={0.76} who="a11y" />
          </Link>
        </div>
        <Draw target="end" at={0.56} len={0.06} who="code" cursor={false} />
      </Build>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function QuickLook({
  contactEnabled,
  photosBySlug,
}: {
  contactEnabled: boolean;
  photosBySlug: Record<string, DiscoveredPhoto[]>;
}) {
  const { unlockScroll } = useSnapScroll();
  // The page container starts locked for the immersive intro; nothing here needs that.
  useEffect(() => {
    unlockScroll();
  }, [unlockScroll]);

  // Hold the hero build until the first-visit screen (if any) has been answered.
  const hydrated = useModeStore((s) => s.hydrated);
  const chosen = useModeStore((s) => s.chosen);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const { webglAvailable } = useDeviceCapability();
  const gateOpen = hydrated && !chosen && webglAvailable && !reducedMotion;
  const play = hydrated && !gateOpen;

  return (
    <div className="ql-canvas relative min-h-screen text-text">
      <Rulers />
      <main id="main" tabIndex={-1} className="outline-none lg:pl-[18px]">
        <Hero play={play} />
        <About />
        <Projects />
        <Skills />
        <Track photosBySlug={photosBySlug} />
        <Resume />
      </main>
      <div className="lg:pl-[18px]">
        <Contact contactEnabled={contactEnabled} />
      </div>
    </div>
  );
}
