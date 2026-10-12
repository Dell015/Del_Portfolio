"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { projects } from "@/lib/content/projects";
import { stats } from "@/lib/content/site";
import { EASE } from "@/components/motion/tokens";
import { useModeStore } from "@/lib/store/mode";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { registerScrollPin, useSnapScroll } from "@/components/SmoothScroll";
import { swirlState } from "@/lib/swirl";
import { LOCK_TRIGGER, TOTAL_BUDGET, isSequenceListening } from "@/lib/hooks/useVirtualScroll";
import { NARROW_LAYOUT, WIDE_LAYOUT } from "@/components/blackhole/layouts";
import type { BlackHoleTargets } from "@/components/blackhole/BlackHoleScene";

// Three.js is only needed for the pinned black-hole version; load it on demand.
const BlackHoleCanvas = dynamic(
  () => import("@/components/blackhole/BlackHoleScene").then((m) => m.BlackHoleCanvas),
  { ssr: false },
);

/**
 * About, as one terminal window (`developer.sh`).
 *
 * Immersive: the section is pinned for several screens and the scroll position
 * drives everything. The portrait's particles fall into a black hole, the window
 * opens beside it and prints, and the prompt at the bottom ("want to see the
 * source?") collapses the hole and hands over to the project sphere. Enter, a tap or
 * simply scrolling on all do the same thing.
 *
 * Otherwise (Clean mode, reduced motion, no WebGL): the same window, unpinned, and
 * the prompt scrolls to the projects.
 */

/** Extra screens of scrolling the pinned section holds the page for. */
const PIN_PAGES = 2.4;
/** The hole alone only gets the first slice of the pin; the rest of the scroll types the window out. */
const remapPin = (raw: number) => (raw <= 0.12 ? (raw / 0.12) * 0.52 : 0.52 + ((raw - 0.12) / 0.88) * 0.48);

const PROMPT = { question: "want to see the source?", cmd: "./source --why" } as const;

/** Milestones for the history view, in the order they are told (no dates claimed). */
const HISTORY = [
  {
    tag: "root",
    text: "Cauayan, Isabela. Where every one of these products starts: someone nearby with a real problem.",
    short: "Cauayan, Isabela. Every product starts with someone nearby.",
  },
  {
    tag: "learn",
    text: "Started by generating code I could not explain. Stopped, and rebuilt the habit: understand every layer first.",
    short: "Stopped shipping code I couldn't explain. Rebuilt the habit.",
  },
  {
    tag: "lead",
    text: "Led teams of up to 5 through national and regional startup competitions.",
    short: "Led teams of up to 5 in national and regional competitions.",
  },
  {
    tag: "place",
    text: "HIRED.PH: Philippine Startup Challenge 11 regional finalist, and IgnITE Start-Up Competition 1st runner up.",
    short: "HIRED.PH: PSC 11 regional finalist, IgnITE 1st runner up.",
  },
  { tag: "work", text: "Enterprise ERP internship (under NDA).", short: "Enterprise ERP internship (under NDA)." },
  {
    tag: "now",
    text: "BS Computer Science, University of Saint Louis Tuguegarao, 2027. Thesis build, plus open to work.",
    short: "BS CS, USLT, 2027. Thesis build. Open to work.",
  },
] as const;

type Cell = { t: string; cls?: string };
type Row = { cells: Cell[]; cls?: string };
interface Block {
  key: string;
  /** Pinned mode: the block starts typing at progress `at` and is done at `end`. */
  at: number;
  end: number;
  cmd: string;
  layout: "para" | "list" | "grid";
  rows: (compact: boolean) => Row[];
  hideOnShort?: boolean;
  hideOnNarrow?: boolean;
  /** Skipped in the pinned scene (the Projects section right after shows it anyway). */
  staticOnly?: boolean;
}

const cellLen = (rows: Row[]) => rows.reduce((n, r) => n + r.cells.reduce((m, c) => m + c.t.length, 0), 0);

/** The terminal's output, one block per command. */
const BLOCKS: Block[] = [
  {
    key: "whoami",
    at: 0.55,
    end: 0.6,
    cmd: "whoami",
    layout: "para",
    rows: () => [{ cells: [{ t: "randel serafica / cs student / cauayan, isabela" }] }],
  },
  {
    key: "about",
    at: 0.6,
    end: 0.67,
    cmd: "cat about.md",
    layout: "para",
    rows: () => [
      {
        cells: [
          {
            t: "I design the product, architect the system, write the code and lead the team around it. I used to ship code I couldn't explain. Now I understand every layer I build on.",
          },
        ],
      },
    ],
  },
  {
    key: "how",
    at: 0.67,
    end: 0.73,
    cmd: "cat how-i-work.md",
    layout: "para",
    rows: () => [
      {
        cells: [
          {
            t: "I'm drawn to problems people quietly put up with, then to solving them in a way that isn't the obvious one. Usually the interesting angle is also the simpler one.",
          },
        ],
      },
    ],
  },
  {
    key: "projects",
    at: 0.73,
    end: 0.78,
    staticOnly: true,
    cmd: "git log --oneline projects/",
    layout: "list",
    hideOnNarrow: true,
    hideOnShort: true,
    rows: () =>
      projects.map((p, i) => ({
        cells: [
          { t: String(7 - i).padStart(3, "0"), cls: "w-[3ch] shrink-0 text-text-muted/45" },
          { t: p.name.toLowerCase(), cls: "w-[8ch] shrink-0 text-text sm:w-[9ch]" },
          { t: p.status.toLowerCase(), cls: "truncate" },
        ],
        cls: "flex gap-3",
      })),
  },
  {
    key: "history",
    at: 0.73,
    end: 0.8,
    cmd: "git log --graph --oneline history/",
    layout: "list",
    hideOnShort: true,
    hideOnNarrow: true,
    rows: (compact) =>
      HISTORY.map((h, i) => ({
        cells: [
          { t: i === HISTORY.length - 1 ? "*" : "|", cls: "w-[2ch] shrink-0 text-[var(--tab-accent)]" },
          { t: h.tag, cls: "w-[6ch] shrink-0 text-text" },
          { t: compact ? h.short : h.text, cls: compact ? "truncate" : undefined },
        ],
        cls: "flex gap-3",
      })),
  },
  {
    key: "numbers",
    at: 0.8,
    end: 0.845,
    cmd: "./numbers",
    layout: "grid",
    rows: () =>
      stats.map((s) => ({
        cells: [
          { t: s.value, cls: "whitespace-nowrap text-lg font-semibold text-[var(--tab-accent)]" },
          { t: s.label.charAt(0).toLowerCase() + s.label.slice(1), cls: "text-[11px] leading-tight" },
        ],
        cls: "flex items-baseline gap-2",
      })),
  },
];

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
    <span className={cls}>
      <span aria-hidden="true">
        {text.slice(0, k)}
        {cursor && <Cursor />}
        <span className="invisible">{text.slice(k)}</span>
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/** One command and its output; `count` is how many characters have been typed so far. */
function BlockView({ block, count, compact }: { block: Block; count: number; compact: boolean }) {
  const rows = block.rows(compact);
  const total = block.cmd.length + cellLen(rows);
  const started = count > 0;
  const done = count >= total;
  const cmdActive = started && count < block.cmd.length;

  // Characters each cell starts at, so every cell knows how much of itself is typed.
  const lens = rows.flatMap((r) => r.cells.map((c) => c.t.length));
  const cum = lens.reduce<number[]>((acc, l) => [...acc, (acc[acc.length - 1] ?? block.cmd.length) + l], []);
  const startOf = (flat: number) => (flat === 0 ? block.cmd.length : cum[flat - 1]!);
  const rowBase = rows.map((_, ri) => rows.slice(0, ri).reduce((n, r) => n + r.cells.length, 0));

  const body = rows.map((r, ri) => (
    <Row key={ri} cls={r.cls}>
      {r.cells.map((c, ci) => {
        const n = count - startOf(rowBase[ri]! + ci);
        const active = started && !done && n >= 0 && n < c.t.length;
        return <Typed key={ci} text={c.t} n={n} cls={c.cls} cursor={active} />;
      })}
    </Row>
  ));

  return (
    <div>
      <div>
        <span className="text-[var(--tab-accent)]" style={{ opacity: started ? 1 : 0 }}>
          $
        </span>{" "}
        <Typed text={block.cmd} n={count} cls="text-text" cursor={cmdActive} />
      </div>
      {block.layout === "para" && <div className="max-w-[64ch]">{body}</div>}
      {block.layout === "list" && <ul>{body}</ul>}
      {block.layout === "grid" && <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">{body}</dl>}
    </div>
  );
}

function Row({ cls, children }: { cls?: string; children: React.ReactNode }) {
  return <div className={cls}>{children}</div>;
}

function PinnedPrompt({ p, typing, onRun }: { p: MotionValue<number>; typing: string | null; onRun: () => void }) {
  const at = (v: number) => Math.round(clamp01((v - 0.85) / 0.035) * PROMPT.question.length);
  const [count, setCount] = useState(() => at(p.get()));
  useMotionValueEvent(p, "change", (v) => {
    const c = at(v);
    setCount((prev) => (prev === c ? prev : c));
  });
  return <PromptBar typing={typing} onRun={onRun} count={count} />;
}

function countAt(block: Block, v: number, compact: boolean) {
  const total = block.cmd.length + cellLen(block.rows(compact));
  const q = Math.max(0, Math.min(1, (v - block.at) / (block.end - block.at)));
  return Math.round(q * total);
}

/** Typing driven by scroll: scrub forward and the text types, scrub back and it un-types. */
function PinnedBlock({ block, p, compact }: { block: Block; p: MotionValue<number>; compact: boolean }) {
  const [count, setCount] = useState(() => countAt(block, p.get(), compact));
  useMotionValueEvent(p, "change", (v) => {
    const c = countAt(block, v, compact);
    setCount((prev) => (prev === c ? prev : c));
  });
  return <BlockView block={block} count={count} compact={compact} />;
}

function TitleBar() {
  return (
    <div className="flex items-end gap-1 border-b border-border bg-[#101010] px-3 pt-2.5">
      <div className="mb-2.5 mr-3 hidden items-center gap-1.5 sm:flex" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
      </div>
      <span className="relative rounded-t-md bg-[#0a0a0a] px-3.5 py-2 text-[12px] text-text">
        developer.sh
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] rounded-t-md bg-[var(--tab-accent)]" />
      </span>
          </div>
  );
}

function PromptBar({ typing, onRun, count = Infinity }: { typing: string | null; onRun: () => void; count?: number }) {
  const hint = count >= PROMPT.question.length;
  return (
    <button
      type="button"
      onClick={onRun}
      className="group mt-5 flex w-full items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-left transition-colors hover:border-[var(--tab-accent)] focus-visible:border-[var(--tab-accent)] focus-visible:outline-none"
      aria-label={`${PROMPT.question} Run ${PROMPT.cmd}`}
    >
      <span className="text-[var(--tab-accent)]">$</span>
      {typing ? (
        <span className="text-text">
          {typing}
          <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[2px] bg-text" />
        </span>
      ) : (
        <>
          <Typed text={PROMPT.question} n={count} cls="text-text" cursor={count < PROMPT.question.length} />
          {hint && <span className="inline-block h-[1em] w-[0.5ch] translate-y-[2px] animate-pulse bg-text-muted" />}
        </>
      )}
      <span
        className="ml-auto shrink-0 rounded border border-border px-2 py-0.5 text-[11px] text-text-muted transition-[color,opacity] duration-300 group-hover:text-text"
        style={{ opacity: hint ? 1 : 0 }}
      >
        <span className="hidden pointer-fine:inline">press enter ↵</span>
        <span className="pointer-fine:hidden">tap to run ↵</span>
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

/* ───────────────────────── static (Clean / reduced motion) ───────────────────────── */

function Out({ i, children, reduced }: { i: number; children: React.ReactNode; reduced: boolean }) {
  if (reduced) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12 + i * 0.16, ease: EASE.out }}
    >
      {children}
    </motion.div>
  );
}

function StaticAbout() {
  const reduced = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.5 });
  const [typing, setTyping] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-8">
        <p className="mb-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-text-muted">
          About / developer.sh
        </p>
        <div
          className="overflow-hidden rounded-xl border border-border bg-[#0a0a0a] font-[family-name:var(--font-mono)] text-[12px] leading-[1.7] text-text-muted shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)] sm:text-[13px]"
          style={{ ["--tab-accent" as string]: "#d11a2a" }}
        >
          <TitleBar />
          <div className="px-4 py-5 sm:px-6">
            <div className="space-y-3">
              {BLOCKS.map((b, i) => (
                <Out key={b.key} i={i} reduced={reduced}>
                  <BlockView block={b} count={Infinity} compact={false} />
                </Out>
              ))}
            </div>
            <PromptBar typing={typing} onRun={run} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── pinned black-hole version ───────────────────────── */

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

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

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
  const raf = useRef(0);
  const cancelFly = useRef<(() => void) | null>(null);

  useEffect(() => {
    const check = () => {
      setNarrow(window.innerWidth < 900);
      setShort(window.innerHeight < 760);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // This section is several screens tall but counts as one page for the rest of the site.
  useEffect(() => {
    registerScrollPin(sectionRef.current);
    return () => registerScrollPin(null);
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
      const exit = ss(0.975, 0.995, v);
      const center = v > 0 ? ss(0.9, 0.95, v) : 0;
      // The hero's dust spirals into the hole as the section rises; at the end the hole centres,
      // compresses, and the dust bursts back out (that burst is the hand-off to the sphere).
      swirlState.amount = v > 0 ? 1 - ss(0.97, 1, v) : ss(0.18, 1, entry);
      swirlState.center = center;
      bgA.set(v > 0 ? 1 - exit : ss(0.88, 1, entry));
      layerA.set(v > 0 ? 1 - exit : ss(0.55, 0.95, entry));
      const t = targets.current;
      t.form = Math.max(clamp01(v / 0.08), 0.62 * ss(0.55, 0.95, entry));
      t.pull = clamp01((v - 0.06) / 0.46);
      t.center = center;
      t.collapse = ss(0.94, 0.975, v);
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
    const target = (LOCK_TRIGGER + 0.01) * vh + extraPx;
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
      // Arrived at the lock point: play the sphere sequence by feeding it scroll.
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      const push = TOTAL_BUDGET + 40;
      const playMs = 2600;
      let t0 = 0;
      let sent = 0;
      const armedAt = performance.now();
      const feed = (n: number) => {
        if (stopped) return;
        if (!isSequenceListening() && n - armedAt < 3000) {
          raf.current = requestAnimationFrame(feed);
          return;
        }
        if (!t0) t0 = n;
        const q = clamp01((n - t0) / playMs);
        const want = push * (q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2);
        const delta = want - sent;
        if (delta > 0.5) {
          sent = want;
          window.dispatchEvent(new WheelEvent("wheel", { deltaY: delta, bubbles: true, cancelable: true }));
        }
        if (q < 1) raf.current = requestAnimationFrame(feed);
        else {
          flying.current = false;
          setTyping(null);
          cancelFly.current = null;
        }
      };
      raf.current = requestAnimationFrame(feed);
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
          className={`absolute z-10 flex flex-col overflow-hidden rounded-xl border border-border bg-[#0a0a0a]/85 font-[family-name:var(--font-mono)] text-[12px] leading-[1.65] text-text-muted shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] backdrop-blur-md sm:text-[12.5px] ${
            narrow ? "inset-x-3 bottom-3 top-[40%]" : "bottom-[7vh] left-[4vw] top-[7vh] w-[min(55vw,860px)]"
          } ${interactive ? "" : "pointer-events-none"}`}
          style={{ opacity: winOpacity, x: winX, y: winY, ["--tab-accent" as string]: "#d11a2a" }}
        >
          <TitleBar />
          <div className="flex min-h-0 flex-1 flex-col justify-between px-4 py-4 sm:px-6">
            <div className="space-y-2">
              {BLOCKS.filter((b) => !b.staticOnly).filter((b) => !(short && b.hideOnShort) && !(narrow && (b.hideOnShort || b.hideOnNarrow))).map((b) => (
                <PinnedBlock key={b.key} p={p} block={b} compact />
              ))}
            </div>
            <Beat p={p} at={0.84}>
              <PinnedPrompt p={p} typing={typing} onRun={run} />
            </Beat>
          </div>
        </motion.div>

        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-5 left-5 z-10 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-text-muted transition-opacity duration-500 sm:left-8"
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
