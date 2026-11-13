"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { stats } from "@/lib/content/site";
import { EASE } from "@/components/motion/tokens";
import { useModeStore } from "@/lib/store/mode";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { registerScrollPin, useSnapScroll } from "@/components/SmoothScroll";
import { swirlState, resetSwirl } from "@/lib/swirl";
import { igniteSequence, resetSequence, setSequencePinned } from "@/lib/hooks/useVirtualScroll";
import { NARROW_LAYOUT, WIDE_LAYOUT } from "@/components/blackhole/layouts";
import type { BlackHoleTargets } from "@/components/blackhole/BlackHoleScene";

// Three.js is only needed for the pinned black-hole version; load it on demand.
const BlackHoleCanvas = dynamic(
  () => import("@/components/blackhole/BlackHoleScene").then((m) => m.BlackHoleCanvas),
  { ssr: false },
);

/**
 * About, as an editorial spread: one statement you can read at a glance (lit word
 * by word), one serif line, the milestones as dots and the numbers.
 *
 * Immersive: the section is pinned for several screens and the scroll position
 * drives everything. The portrait's particles fall into a black hole, the spread
 * builds beside it, and the prompt at the bottom ("want to see the source?")
 * collapses the hole and hands over to the project solar system. Enter, a tap or
 * simply scrolling on all do the same thing.
 *
 * Otherwise (Clean mode, reduced motion, no WebGL): the same window, unpinned, and
 * the prompt scrolls to the projects.
 */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Extra screens of scrolling the pinned section holds the page for. */
const PIN_PAGES = 2.4;
/** The hole alone only gets the first slice of the pin; the rest of the scroll types the window out. */
const remapPin = (raw: number) => (raw <= 0.12 ? (raw / 0.12) * 0.52 : 0.52 + ((raw - 0.12) / 0.88) * 0.48);

const PROMPT = { question: "want to see the source?", cmd: "./source --why" } as const;

/** Milestones for the history view, in the order they are told (no dates claimed). */
const HISTORY = [
  {
    tag: "root",
    text: "From Cauayan, Isabela. Studying in Tuguegarao.",
    short: "From Cauayan, Isabela.",
  },
  {
    tag: "learn",
    text: "Learned web and mobile development beyond class: Next.js, Supabase, React Native and Flutter.",
    short: "Learned web and mobile beyond class.",
  },
  {
    tag: "lead",
    text: "Team lead in startup competitions and on my thesis, a team of 5.",
    short: "Team lead: competitions and thesis (team of 5).",
  },
  {
    tag: "place",
    text: "Philippine Startup Challenge 10 regional finalist, and IgnITE Start-Up Competition 1st runner up.",
    short: "PSC 10 regional finalist, IgnITE 1st runner up.",
  },
  { tag: "work", text: "240-hour full-stack internship on an internal ERP system.", short: "Full-stack internship, ERP system." },
  {
    tag: "now",
    text: "BS Computer Science at the University of Saint Louis Tuguegarao, graduating 2027. Open to work.",
    short: "BS CS, USLT, 2027. Open to work.",
  },
] as const;

const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a || 1e-6));

/** The headline, in pieces so one phrase can carry the accent. */
const LEAD: { t: string; red?: boolean }[] = [
  { t: "I build web and mobile apps, " },
  { t: "front end to back end", red: true },
  { t: "." },
];
const LINE = "Mostly Next.js, React and Supabase on the web, and React Native or Flutter on mobile.";
const HOW =
  "Most of my work so far is school projects, startup competition entries and websites for people near home. I usually do the design and the code myself.";

/** Words of the headline with the position each one lights up at (0..1 along the headline). */
const LEAD_WORDS = (() => {
  const words = LEAD.flatMap((s) => s.t.split(/(\s+)/).filter(Boolean).map((w) => ({ w, red: !!s.red })));
  const total = words.filter((x) => x.w.trim()).length;
  return words.map((x, i) => ({ ...x, k: words.slice(0, i).filter((y) => y.w.trim()).length / total, total }));
})();

function Cursor() {
  return (
    <span aria-hidden="true" className="relative inline-block w-0 align-baseline">
      <span className="absolute left-0 top-[-1px] h-[1.05em] w-[0.55ch] animate-pulse bg-text" />
    </span>
  );
}

/** Typed text. Untyped characters stay in the layout (invisible) so lines never reflow while typing. */
function Typed({ text, n, cls, cursor }: { text: string; n: number; cls?: string; cursor?: boolean }) {
  const k = Math.max(0, Math.min(text.length, n));
  return (
    <span className={`relative ${cls ?? ""}`}>
      <span aria-hidden="true">
        {text.slice(0, k)}
        {cursor && <Cursor />}
        <span className="invisible">{text.slice(k)}</span>
      </span>
      <span className="sr-only left-0 top-0">{text}</span>
    </span>
  );
}

/** One headline word: dim until the scroll reaches it, then fully lit. */
function Word({ p, a, b, red, children }: { p: MotionValue<number>; a: number; b: number; red: boolean; children: string }) {
  const opacity = useTransform(p, [a, b], [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={red ? "text-accent" : undefined}>
      {children}
    </motion.span>
  );
}

/** Scroll-linked fade-and-rise: hidden until progress `at`, settled by `at + 0.04`. */
function Beat({ p, at, className, children }: { p: MotionValue<number>; at: number; className?: string; children: React.ReactNode }) {
  const opacity = useTransform(p, [at, at + 0.04], [0, 1]);
  const y = useTransform(p, [at, at + 0.04], [10, 0]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

function Step({ p, at, h, last }: { p: MotionValue<number>; at: number; h: (typeof HISTORY)[number]; last: boolean }) {
  const opacity = useTransform(p, [at, at + 0.02], [0, 1]);
  const y = useTransform(p, [at, at + 0.02], [8, 0]);
  return (
    <motion.li style={{ opacity, y }} className="relative pt-6">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-[9px] w-[9px] border ${last ? "border-accent bg-accent" : "border-white/50 bg-bg"}`}
      />
      <span className={`block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] ${last ? "text-accent" : "text-text"}`}>
        {h.tag}
      </span>
      <span className="mt-1.5 block text-[12.5px] leading-snug text-text-muted">{h.short}</span>
    </motion.li>
  );
}

/** The six milestones as dots on one line, drawn left to right. */
function Timeline({ p, at }: { p: MotionValue<number>; at: number }) {
  const line = useTransform(p, [at, at + 0.06], [0, 1]);
  return (
    <div className="relative">
      <motion.span aria-hidden="true" className="absolute left-1 right-10 top-[4px] h-px origin-left bg-white/20" style={{ scaleX: line }} />
      <ol className="grid grid-cols-6 gap-4">
        {HISTORY.map((h, i) => (
          <Step key={h.tag} p={p} at={at + i * 0.01} h={h} last={i === HISTORY.length - 1} />
        ))}
      </ol>
    </div>
  );
}

/** A number that counts up as the scroll reaches it. */
function Stat({ p, at, value, label }: { p: MotionValue<number>; at: number; value: string; label: string }) {
  const target = Number(value) || 0;
  const at01 = (v: number) => Math.round(seg(v, at, at + 0.035) * target);
  const [n, setN] = useState(() => at01(p.get()));
  useMotionValueEvent(p, "change", (v) => {
    const c = at01(v);
    setN((prev) => (prev === c ? prev : c));
  });
  const opacity = useTransform(p, [at, at + 0.02], [0, 1]);
  return (
    <motion.div style={{ opacity }}>
      <dd className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,4vw,3.6rem)] font-bold leading-none tracking-[-0.04em] text-text">
        {Number.isFinite(target) && target ? n : value}
      </dd>
      <dt className="mt-2 font-[family-name:var(--font-mono)] text-[10px] uppercase leading-snug tracking-[0.16em] text-text-muted">{label}</dt>
    </motion.div>
  );
}

/**
 * About as an editorial spread: one statement you can read at a glance, then the
 * detail for whoever wants it. Everything is tied to `p` (0..1). The pinned scene
 * scrubs it with the scroll; the plain version passes a fixed 1.
 */
function Editorial({ p, narrow, short }: { p: MotionValue<number>; narrow: boolean; short: boolean }) {
  const T = { eyebrow: 0.55, leadA: 0.565, leadB: 0.655, line: 0.665, how: 0.7, steps: 0.725, stats: 0.79 };
  return (
    <div>
      <Beat p={p} at={T.eyebrow}>
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-text-muted">
          <span className="text-accent">$</span> whoami · {narrow ? "Cauayan, Isabela" : "CS student · Cauayan, Isabela"}
        </p>
      </Beat>
      <h2
        className={`mt-5 font-[family-name:var(--font-display)] font-bold tracking-[-0.03em] text-text ${
          narrow ? "text-[1.7rem] leading-[1.1]" : "text-[clamp(2.1rem,3.5vw,3.5rem)] leading-[1.04]"
        }`}
      >
        <span className="sr-only">{LEAD.map((s) => s.t).join("")}</span>
        <span aria-hidden="true">
          {LEAD_WORDS.map((x, i) =>
            x.w.trim() ? (
              <Word
                key={i}
                p={p}
                a={T.leadA + x.k * (T.leadB - T.leadA)}
                b={T.leadA + (x.k + 1 / x.total) * (T.leadB - T.leadA)}
                red={x.red}
              >
                {x.w}
              </Word>
            ) : (
              x.w
            ),
          )}
        </span>
      </h2>
      <Beat p={p} at={T.line}>
        <p
          className={`mt-6 max-w-[38rem] font-[family-name:var(--font-serif)] italic leading-[1.25] text-[#d4d4d4] ${
            narrow ? "text-[1.15rem]" : "text-[clamp(1.25rem,1.8vw,1.7rem)]"
          }`}
        >
          {LINE}
        </p>
      </Beat>
      {!narrow && !short && (
        <Beat p={p} at={T.how}>
          <p className="mt-4 max-w-[34rem] text-[15px] leading-relaxed text-text-muted">{HOW}</p>
        </Beat>
      )}
      {!narrow && (
        <div className={short ? "mt-7" : "mt-10"}>
          <Timeline p={p} at={T.steps} />
        </div>
      )}
      <dl className={`grid ${narrow ? "mt-6 grid-cols-4 gap-3" : "mt-10 grid-cols-4 gap-8"} max-w-[40rem]`}>
        {stats.map((s, i) => (
          <Stat key={s.label} p={p} at={T.stats + i * 0.008} value={s.value} label={s.label} />
        ))}
      </dl>
    </div>
  );
}

function PinnedPrompt({ p, typing, onRun }: { p: MotionValue<number>; typing: string | null; onRun: () => void }) {
  const at = (v: number) => Math.round(clamp01((v - 0.85) / 0.03) * PROMPT.question.length);
  const [count, setCount] = useState(() => at(p.get()));
  useMotionValueEvent(p, "change", (v) => {
    const c = at(v);
    setCount((prev) => (prev === c ? prev : c));
  });
  return <PromptBar typing={typing} onRun={onRun} count={count} />;
}

/** The handover to the projects: a plain link-style button, Enter or a tap runs it. */
function PromptBar({ typing, onRun, count = Infinity }: { typing: string | null; onRun: () => void; count?: number }) {
  const hint = count >= PROMPT.question.length;
  return (
    <button
      type="button"
      onClick={onRun}
      className="group mt-8 flex w-full items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      aria-label={`${PROMPT.question} Go to the projects`}
    >
      <span className="border-b border-accent pb-1 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.18em] text-text transition-colors group-hover:text-white">
        {typing ? (
          <>
            {typing}
            <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[2px] bg-text" />
          </>
        ) : (
          <Typed text={PROMPT.question} n={count} cursor={count < PROMPT.question.length} />
        )}
      </span>
      <span
        className="shrink-0 border border-white/15 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-text-muted transition-[color,opacity] duration-300 group-hover:text-text"
        style={{ opacity: hint ? 1 : 0 }}
      >
        <span className="hidden pointer-fine:inline">press enter ↵</span>
        <span className="pointer-fine:hidden">tap ↵</span>
      </span>
    </button>
  );
}

/** Enter runs the prompt while the section is on screen and nothing else has focus. */
function useEnterToRun(enabled: boolean, run: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && el !== document.body && el.closest("button, a, input, textarea, select")) return;
      e.preventDefault();
      run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, run]);
}

/* ───────────────────────── static (no WebGL, before the particles load) ───────────────────────── */

function StaticAbout() {
  const reduced = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.5 });
  const [typing, setTyping] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = useMotionValue(1);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const run = useCallback(() => {
    if (typing) return;
    const apply = () => {
      setTyping(null);
      document.getElementById("projects")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    };
    if (reduced) return apply();
    setTyping(PROMPT.cmd);
    timer.current = setTimeout(apply, 520);
  }, [typing, reduced]);

  useEnterToRun(inView, run);

  return (
    <section
      id="about"
      ref={sectionRef}
      data-snap-section=""
      aria-label="About"
      className="relative z-[2] flex min-h-screen items-center bg-bg py-24 md:py-28"
    >
      <motion.div
        className="mx-auto w-full max-w-5xl px-5 sm:px-8"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: EASE.out }}
      >
        <Editorial p={done} narrow={false} short={false} />
        <PromptBar typing={typing} onRun={run} />
      </motion.div>
    </section>
  );
}

/* ───────────────────────── pinned black-hole version ───────────────────────── */


function PinnedAbout() {
  const { containerRef } = useSnapScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const active = useInView(sectionRef, { margin: "150px 0px 150px 0px" });
  const p = useMotionValue(0);
  /** 0..1: how much of the section has risen into view before it pins. */
  const bgA = useMotionValue(0);
  const layerA = useMotionValue(0);
  const targets = useRef<BlackHoleTargets>({ pull: 0, collapse: 0, form: 0 });
  const [narrow, setNarrow] = useState(false);
  const [short, setShort] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [caption, setCaption] = useState(0);
  const [typing, setTyping] = useState<string | null>(null);
  const flying = useRef(false);
  const ignited = useRef(false);
  const lastV = useRef(0);
  const raf = useRef(0);
  const cancelFly = useRef<(() => void) | null>(null);

  useEffect(() => {
    const check = () => {
      setNarrow(window.innerWidth < 900);
      // Below this the spread drops the "how I work" paragraph so the prompt clears the nav corner.
      setShort(window.innerHeight < 960);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // This section is several screens tall but counts as one page for the rest of the site.
  useEffect(() => {
    registerScrollPin(sectionRef.current);
    setSequencePinned(true);
    return () => {
      registerScrollPin(null);
      setSequencePinned(false);
      // Leaving the full experience: don't carry the collapse over to the next visit.
      resetSwirl();
    };
  }, []);

  // Pin progress, measured from the scroll container so it never goes stale.
  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const top = section.getBoundingClientRect().top - container.getBoundingClientRect().top;
      const span = section.offsetHeight - container.clientHeight;
      const v = span > 0 ? remapPin(clamp01(-top / span)) : 0;
      p.set(v);
      const vh = container.clientHeight || 1;
      const entry = v > 0 ? 1 : clamp01(1 - top / vh);
      const ss = (a: number, b: number, x: number) => {
        const k = clamp01((x - a) / (b - a));
        return k * k * (3 - 2 * k);
      };
      const center = v > 0 ? ss(0.9, 0.95, v) : 0;
      const collapse = ss(0.94, 0.975, v);
      // The hero's dust spirals into the hole as the section rises. When the hole has compressed to a
      // point, the sphere sequence's explosion starts from that point (the old burst, now the only one).
      const fired = v >= 0.975;
      swirlState.soft = v > 0.9;
      swirlState.amount = v > 0 ? (fired ? 0 : 1) : ss(0.18, 1, entry);
      swirlState.center = center;
      swirlState.compress = collapse;
      if (fired && !ignited.current) {
        ignited.current = true;
        // Arriving from well above the collapse in one step (a jump, not a scroll) means it was never seen.
        igniteSequence(lastV.current < 0.9);
        animate(bgA, 0, { duration: 0.5, ease: "easeOut" });
        animate(layerA, 0, { duration: 0.28, ease: "easeOut" });
      } else if (!fired && v < 0.96 && ignited.current) {
        ignited.current = false;
        resetSequence();
      }
      lastV.current = v;
      if (!fired && !ignited.current) {
        bgA.set(v > 0 ? 1 : ss(0.88, 1, entry));
        layerA.set(v > 0 ? 1 : ss(0.55, 0.95, entry));
      }
      const t = targets.current;
      t.form = Math.max(clamp01(v / 0.08), 0.62 * ss(0.55, 0.95, entry));
      t.pull = clamp01((v - 0.06) / 0.46);
      t.center = center;
      t.collapse = collapse;
      setInteractive(v > 0.86 && v < 0.92);
      setCaption(v < 0.05 ? 0 : v < 0.52 ? 1 : v < 0.9 ? 2 : 3);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    container.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [containerRef, p]);

  const winOpacity = useTransform(p, [0.5, 0.58, 0.9, 0.95], [0, 1, 1, 0]);
  const winX = useTransform(p, [0.9, 0.95], ["0vw", "-70vw"]);
  const winY = useTransform(p, [0.5, 0.58], [48, 0]);
  const sectionBg = useTransform(bgA, (a) => `rgba(0,0,0,${a})`);
  const stickyOpacity = useTransform(bgA, [0, 0.5, 1], [1, 1, 1]);
  const layerVisible = useTransform(layerA, (a) => (a > 0.001 ? "visible" : "hidden"));

  /**
   * The prompt: scroll the page to where the sphere sequence takes over (the hole
   * collapses on the way), then let the sphere sequence play on its own.
   */
  const run = useCallback(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    if (!container || !section || flying.current) return;
    flying.current = true;
    setTyping(PROMPT.cmd);

    const vh = container.clientHeight;
    const extraPx = section.offsetHeight - vh;
    const target = section.offsetTop + extraPx; // the end of the pin: the hole collapses on the way and sets off the burst
    const from = container.scrollTop;
    const dist = target - from;
    if (dist <= 0) {
      flying.current = false;
      setTyping(null);
      return;
    }
    const dur = Math.min(3600, Math.max(1700, (dist / vh) * 520));
    const start = performance.now() + 380; // a beat for the typed command
    let stopped = false;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf.current);
      flying.current = false;
      setTyping(null);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      cancelFly.current = null;
    };
    cancelFly.current = stop;
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });

    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const fly = (now: number) => {
      if (stopped) return;
      const t = clamp01((now - start) / dur);
      container.scrollTop = from + dist * ease(t);
      if (t < 1) {
        raf.current = requestAnimationFrame(fly);
        return;
      }
      // Arrived. The collapse ignited the sphere sequence on the way here.
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      flying.current = false;
      setTyping(null);
      cancelFly.current = null;
    };
    raf.current = requestAnimationFrame(fly);
  }, [containerRef]);

  useEffect(() => () => { cancelAnimationFrame(raf.current); cancelFly.current?.(); }, []);

  useEnterToRun(interactive, run);

  const CAPTIONS = ["[ 03 / about ]  scroll to begin", "falling in", "", "next: the work ↓"] as const;

  return (
    <motion.section
      id="about"
      ref={sectionRef}
      data-snap-section=""
      aria-label="About"
      className="relative z-[2]"
      style={{ height: `${(1 + PIN_PAGES) * 100}vh`, backgroundColor: sectionBg }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ opacity: layerA, visibility: layerVisible }}
      >
        <BlackHoleCanvas
          className="!absolute inset-0"
          layout={narrow ? NARROW_LAYOUT : WIDE_LAYOUT}
          targets={targets}
          active={active}
          lowPower={narrow}
        />
      </motion.div>
      <motion.div className="sticky top-0 h-screen overflow-hidden" style={{ opacity: stickyOpacity }}>

        <motion.div
          className={`absolute z-10 flex flex-col ${
            narrow ? "inset-x-5 bottom-6 top-[48%]" : "bottom-[max(9vh,10rem)] left-[6vw] top-[13vh] w-[min(50vw,800px)]"
          } ${interactive ? "" : "pointer-events-none"}`}
          style={{ opacity: winOpacity, x: winX, y: winY }}
        >
          <Editorial p={p} narrow={narrow} short={short} />
          <Beat p={p} at={0.84} className="mt-auto">
            <PinnedPrompt p={p} typing={typing} onRun={run} />
          </Beat>
        </motion.div>

        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-text-muted transition-opacity duration-500"
          style={{ opacity: CAPTIONS[caption] ? 1 : 0 }}
        >
          {CAPTIONS[caption]}
        </p>
      </motion.div>
    </motion.section>
  );
}

/* ───────────────────────── choose a version ───────────────────────── */

export function About() {
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const particlesActive = useModeStore((s) => s.particlesActive);
  const { webglAvailable } = useDeviceCapability();
  const reduced = !!useReducedMotion();

  const pinned = mode === "immersive" && !reducedMotion && !reduced && webglAvailable && particlesActive;
  return pinned ? <PinnedAbout /> : <StaticAbout />;
}
