"use client";

/**
 * Quick Look "build kit": the page looks like a shared design file that four
 * cursors are building while you scroll.
 *
 * A <Build> is a scope with one progress value (0 → 1). Scroll scopes take it from
 * how far the block has entered the screen, the hero takes it from a timer. Every
 * piece inside (cursors, typing, selection boxes, property chips, image drops)
 * reads that one value and writes its own styles straight to the DOM, so the
 * whole thing runs without React re-renders.
 *
 * Final state is the server HTML: with no JS, or with reduced motion, the page is
 * simply finished. Pieces point at elements by `data-a="name"` inside the scope.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { animate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";

// ─── The four people in the file (all of them are Randel) ───────────────────

export const PEOPLE = {
  randel: { label: "Randel", color: "#D11A2A", ink: "#fff" },
  design: { label: "design", color: "#F2A541", ink: "#1a1205" },
  copy: { label: "copy", color: "#3DD6C3", ink: "#05201c" },
  code: { label: "code", color: "#9B8CFF", ink: "#0e0a24" },
} as const;
export type Who = keyof typeof PEOPLE;

// ─── Small math helpers ──────────────────────────────────────────────────────

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** 0 → 1 as `v` goes from `a` to `b`. */
export const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a || 1e-6));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Lands a touch past the target and settles back, like a hand that isn't perfectly precise. */
const easeOver = (t: number) => {
  const c = 0.9;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
};

/**
 * Repeatable "random" number in 0..1 from a string. The same string always gives the
 * same number, so the server and the browser agree and nothing jumps on hydration.
 */
export function rand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
function boxIn(root: HTMLElement, el: Element): Box {
  const r = el.getBoundingClientRect();
  const o = root.getBoundingClientRect();
  return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
}
function find(root: HTMLElement, name: string) {
  return root.querySelector<HTMLElement>(`[data-a="${name}"]`);
}

// ─── Scope ───────────────────────────────────────────────────────────────────

type Listener = (v: number) => void;
interface Scope {
  root: React.RefObject<HTMLDivElement | null>;
  subscribe: (fn: Listener) => () => void;
  /** Bumped whenever layout may have changed; pieces re-measure when it moves. */
  version: React.MutableRefObject<number>;
  invalidate: () => void;
  still: boolean;
}
const ScopeCtx = createContext<Scope | null>(null);

function useScope() {
  const s = useContext(ScopeCtx);
  if (!s) throw new Error("Quick Look pieces must sit inside <Build>");
  return s;
}

interface Frame {
  /** Changes whenever layout may have moved: re-measure when it differs from last time. */
  version: number;
  root: HTMLDivElement | null;
  invalidate: () => void;
}

/** Calls `fn` with the scope's progress on every change and after every re-measure. */
function useProgress(fn: (v: number, f: Frame) => void) {
  const scope = useScope();
  const fnRef = useRef(fn);
  useLayoutEffect(() => {
    fnRef.current = fn;
  });
  useEffect(
    () =>
      scope.subscribe((v) =>
        fnRef.current(v, { version: scope.version.current, root: scope.root.current, invalidate: scope.invalidate }),
      ),
    [scope],
  );
  return scope;
}

interface BuildProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** "scroll": progress follows the block entering the screen. "time": plays once `play` is true. */
  mode?: "scroll" | "time";
  play?: boolean;
  /** Seconds, time mode only. */
  duration?: number;
  /** Bump to replay a time scope from the start. */
  replay?: number;
  /** Where the build starts and ends, as framer-motion scroll offsets. */
  offset?: [string, string];
  /** Changes this block's own pace. Defaults to a per-block id, so no two blocks build in lockstep. */
  seed?: string;
}

export function Build({
  children,
  className = "",
  id,
  mode = "scroll",
  play = true,
  duration = 3.4,
  replay = 0,
  offset = ["start 0.72", "start 0.06"],
  seed,
}: BuildProps) {
  const root = useRef<HTMLDivElement>(null);
  const autoSeed = useId();
  const key = seed ?? autoSeed;
  // Each scroll block starts a little late and/or finishes a little early, by its own
  // amount, so blocks next to each other drift out of step like separate people.
  const late = mode === "scroll" ? rand(`${key}:late`) * 0.14 : 0;
  const early = mode === "scroll" ? rand(`${key}:early`) * 0.12 : 0;
  const { containerRef } = useSnapScroll();
  const still = !!useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: root,
    container: containerRef,
    offset: offset as never,
  });
  // At the very bottom of the page the last blocks can't scroll any higher, so they
  // count as finished there instead of staying half built.
  const toEnd = useTransform(scrollYProgress, (v) => {
    const c = containerRef.current;
    return c && c.scrollTop + c.clientHeight >= c.scrollHeight - 4 ? 1 : v;
  });
  // A soft spring: cursors glide and settle instead of snapping to each wheel step.
  const smooth = useSpring(toEnd, { stiffness: 55, damping: 18, restDelta: 0.0004 });
  const timer = useMotionValue(still ? 1 : 0);
  const src = mode === "time" ? timer : smooth;

  const listeners = useRef(new Set<Listener>());
  const version = useRef(0);
  const raf = useRef(0);
  const pace = useCallback((v: number) => seg(v, late, 1 - early), [late, early]);
  const get = useCallback(() => (still ? 1 : pace(src.get())), [still, src, pace]);
  const notify = useCallback(() => {
    const v = get();
    listeners.current.forEach((f) => f(v));
  }, [get]);
  const invalidate = useCallback(() => {
    version.current++;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(notify);
  }, [notify]);

  useEffect(() => {
    const el = root.current;
    const unsub = src.on("change", (v) => {
      if (!still) {
        const w = pace(v);
        listeners.current.forEach((f) => f(w));
      }
    });
    const ro = new ResizeObserver(() => invalidate());
    if (el) ro.observe(el);
    let alive = true;
    document.fonts?.ready.then(() => alive && invalidate());
    invalidate();
    return () => {
      alive = false;
      unsub();
      ro.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [src, still, invalidate, pace]);

  // Time scopes: play once when allowed, again whenever `replay` changes.
  useEffect(() => {
    if (mode !== "time" || still) return;
    if (!play) {
      timer.set(0);
      return;
    }
    timer.set(0);
    const a = animate(timer, 1, { duration, ease: "linear", delay: 0.25 });
    return () => a.stop();
  }, [mode, play, duration, replay, still, timer]);

  const subscribe = useCallback((fn: Listener) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  const scope = useMemo<Scope>(
    () => ({ root, subscribe, version, invalidate, still }),
    [subscribe, invalidate, still],
  );

  return (
    <ScopeCtx.Provider value={scope}>
      <div ref={root} id={id} className={`relative ${className}`}>
        {children}
      </div>
    </ScopeCtx.Provider>
  );
}

// ─── Toggle / Appear: a class flip at one moment of the build ───────────────

type Tag = "span" | "div" | "li" | "p" | "h1" | "h2" | "h3";

/**
 * Sets `data-on` to "true" once progress passes `at`. Style the "before" state with
 * `data-[on=false]:` utilities. Starts "true" so the server HTML is the finished page.
 */
export function Toggle({
  at,
  as = "span",
  a,
  className = "",
  children,
  style,
}: {
  at: number;
  as?: Tag;
  a?: string;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  useProgress((v, { invalidate }) => {
    const el = ref.current;
    if (!el) return;
    const on = String(v >= at);
    if (el.dataset.on !== on) {
      el.dataset.on = on;
      invalidate();
    }
  });
  const El = as as "span";
  return (
    <El ref={ref as React.Ref<HTMLSpanElement>} data-on="true" data-a={a} className={className} style={style}>
      {children}
    </El>
  );
}

/** Fades and lifts in at `at`. */
export function Appear({ className = "", ...rest }: Parameters<typeof Toggle>[0]) {
  return (
    <Toggle
      {...rest}
      className={`transition-[opacity,transform] duration-500 ease-out data-[on=false]:translate-y-2 data-[on=false]:opacity-0 ${className}`}
    />
  );
}

// ─── Typed text ──────────────────────────────────────────────────────────────

/**
 * Text typed character by character between `from` and `to`. The untyped rest is
 * still there, just transparent, so the layout never jumps and screen readers get
 * the whole sentence.
 */
export function Typed({
  text,
  from,
  to,
  a,
  className = "",
  caret = "#F5F5F5",
}: {
  text: string;
  from: number;
  to: number;
  a?: string;
  className?: string;
  caret?: string;
}) {
  const shown = useRef<HTMLSpanElement>(null);
  const rest = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const last = useRef(-1);
  // When each character lands, 0..1. Uneven on purpose: quick bursts, a beat after
  // punctuation, longer gaps between words and the odd hesitation.
  const schedule = useMemo(() => {
    const out: number[] = [];
    let sum = 0;
    for (let i = 0; i < text.length; i++) {
      let k = 0.55 + rand(`${text}:${i}`) * 0.9;
      if (text[i] === " ") k *= 1.6;
      if (i > 0 && ".,;:?!".includes(text[i - 1]!)) k += 2.4;
      if (rand(`${text}:pause:${i}`) > 0.93) k += 1.8;
      sum += k;
      out.push(sum);
    }
    return out.map((x) => x / (sum || 1));
  }, [text]);
  useProgress((v) => {
    const t = seg(v, from, to);
    let n = 0;
    while (n < schedule.length && schedule[n]! <= t + 1e-9) n++;
    if (n !== last.current && shown.current && rest.current) {
      last.current = n;
      shown.current.textContent = text.slice(0, n);
      rest.current.textContent = text.slice(n);
    }
    if (bar.current) bar.current.style.display = v > from - 0.01 && v < to + 0.02 ? "inline-block" : "none";
  });
  return (
    <span data-a={a} className={className}>
      <span ref={shown}>{text}</span>
      <span
        ref={bar}
        aria-hidden="true"
        className="ql-caret relative -mr-[2px] h-[0.95em] w-[2px] translate-y-[0.12em] align-baseline"
        style={{ display: "none", background: caret }}
      />
      <span ref={rest} style={{ color: "transparent" }} />
    </span>
  );
}

// ─── Cursor ──────────────────────────────────────────────────────────────────

export interface Key {
  /** Progress at which the cursor is here. */
  at: number;
  /** `data-a` name of the element to point at. */
  to: string;
  /** Spot inside that element, 0..1 of its box (default centre). */
  x?: number;
  y?: number;
  /** Press the button here. */
  click?: boolean;
}

/** One collaborator's cursor, flying between elements of the scope. */
export function Cursor({
  who,
  keys,
  carry,
}: {
  who: Who;
  keys: Key[];
  /** A file or chip held by the cursor between two moments, like a drag. */
  carry?: { from: number; to: number; label: string };
}) {
  const p = PEOPLE[who];
  const ref = useRef<HTMLDivElement>(null);
  const carryRef = useRef<HTMLSpanElement>(null);
  const pts = useRef<{ at: number; x: number; y: number; click?: boolean }[]>([]);
  const measured = useRef(-1);
  const id = `${who}:${keys[0]?.to ?? ""}:${keys.length}`;
  // Nobody moves in perfect time with the others: each cursor runs slightly early or late.
  const lag = (rand(`${id}:lag`) - 0.5) * 0.035;

  const scope = useProgress((raw, { version, root }) => {
    const v = raw - lag;
    const el = ref.current;
    if (!el || !root) return;
    if (measured.current !== version) {
      measured.current = version;
      pts.current = keys.flatMap((k) => {
        const t = find(root, k.to);
        if (!t) return [];
        const b = boxIn(root, t);
        return [{ at: k.at, x: b.x + b.w * (k.x ?? 0.5), y: b.y + b.h * (k.y ?? 0.5), click: k.click }];
      });
    }
    const ps = pts.current;
    if (!ps.length) return;
    const first = ps[0]!;
    const lastP = ps[ps.length - 1]!;
    let x: number;
    let y: number;
    if (v <= first.at) {
      // Flies in from below right.
      const t = ease(seg(v, first.at - 0.08, first.at));
      x = first.x + 90 * (1 - t);
      y = first.y + 60 * (1 - t);
    } else if (v >= lastP.at) {
      const t = ease(seg(v, lastP.at, lastP.at + 0.08));
      x = lastP.x + 70 * t;
      y = lastP.y + 50 * t;
    } else {
      let i = 0;
      while (i < ps.length - 2 && v > ps[i + 1]!.at) i++;
      const a = ps[i]!;
      const b = ps[i + 1]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const s = seg(v, a.at, b.at);
      // Long moves sometimes overshoot and settle; every move bows a little sideways
      // instead of travelling in a ruler-straight line.
      const t = len > 70 && rand(`${id}:o${i}`) > 0.45 ? easeOver(s) : ease(s);
      const bend = (rand(`${id}:b${i}`) - 0.5) * Math.min(90, len * 0.4) * Math.sin(Math.PI * Math.min(1, s));
      x = a.x + dx * t + (-dy / len) * bend;
      y = a.y + dy * t + (dx / len) * bend;
    }
    const opacity = Math.min(seg(v, first.at - 0.08, first.at - 0.02), 1 - seg(v, lastP.at + 0.02, lastP.at + 0.08));
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    el.style.opacity = String(opacity);
    el.dataset.press = String(ps.some((k) => k.click && Math.abs(v - k.at) < 0.018));
    if (carryRef.current && carry) {
      carryRef.current.style.opacity = v > carry.from && v < carry.to ? "1" : "0";
    }
  });

  if (scope.still) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="ql-cursor group pointer-events-none absolute left-0 top-0 z-40"
      style={{ opacity: 0 }}
    >
      {/* Hands are never perfectly still: a small idle drift, each cursor on its own rhythm. */}
      <div
        className="ql-fidget"
        style={{ animationDelay: `-${(rand(`${id}:fd`) * 4).toFixed(2)}s`, animationDuration: `${(2.4 + rand(`${id}:fl`) * 1.8).toFixed(2)}s` }}
      >
      <svg width="18" height="20" viewBox="0 0 18 20" className="ql-pointer block drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        <path d="M1.5 1.5 16 9.2l-6.4 1.6-3 6.7L1.5 1.5Z" fill={p.color} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <span
        className="ql-ring absolute -left-2 -top-2 block h-5 w-5 rounded-full border-2 opacity-0"
        style={{ borderColor: p.color }}
      />
      <span
        className="absolute left-4 top-4 whitespace-nowrap rounded-[3px] px-1.5 py-[3px] font-[family-name:var(--font-mono)] text-[10px] font-medium leading-none"
        style={{ background: p.color, color: p.ink }}
      >
        {p.label}
      </span>
      {carry && (
        <span
          ref={carryRef}
          className="absolute left-5 top-9 whitespace-nowrap border border-dashed bg-[#0c0e11]/90 px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] text-white/80 transition-opacity duration-150"
          style={{ borderColor: p.color, opacity: 0 }}
        >
          {carry.label}
        </span>
      )}
      </div>
    </div>
  );
}

// ─── Selection box ───────────────────────────────────────────────────────────

/** A selection dragged out around an element, with handles and a live W × H readout. */
export function Select({
  target,
  from,
  to,
  who,
  name,
  pad = 6,
}: {
  target: string;
  from: number;
  to: number;
  who: Who;
  /** Layer name shown above the box. */
  name?: string;
  pad?: number;
}) {
  const color = PEOPLE[who].color;
  const ref = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLSpanElement>(null);
  const box = useRef<Box | null>(null);
  const measured = useRef(-1);
  const scope = useProgress((v, { version, root }) => {
    const el = ref.current;
    if (!el || !root) return;
    if (measured.current !== version) {
      measured.current = version;
      const t = find(root, target);
      box.current = t ? boxIn(root, t) : null;
    }
    const b = box.current;
    if (!b || v < from || v > to + 0.05) {
      el.style.opacity = "0";
      return;
    }
    const d = ease(seg(v, from, from + 0.09));
    const w = (b.w + pad * 2) * d;
    const h = (b.h + pad * 2) * d;
    el.style.transform = `translate3d(${b.x - pad}px, ${b.y - pad}px, 0)`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.opacity = String(1 - seg(v, to, to + 0.05));
    if (sizeRef.current) sizeRef.current.textContent = `${Math.round(b.w * d)} × ${Math.round(b.h * d)}`;
  });
  if (scope.still) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-30"
      style={{ opacity: 0, outline: `1.5px solid ${color}` }}
    >
      {name && (
        <span className="absolute -top-5 left-0 whitespace-nowrap font-[family-name:var(--font-mono)] text-[10px]" style={{ color }}>
          {name}
        </span>
      )}
      {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((c) => (
        <span key={c} className={`absolute ${c} block h-2 w-2 border bg-white`} style={{ borderColor: color }} />
      ))}
      <span
        ref={sizeRef}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[2px] px-1.5 py-[2px] font-[family-name:var(--font-mono)] text-[10px] leading-none"
        style={{ background: color, color: "#0b0b0b" }}
      />
    </div>
  );
}

// ─── Property chip (a slice of the inspector panel) ─────────────────────────

export function Prop({
  target,
  from,
  to,
  who,
  children,
  side = "right",
}: {
  target: string;
  from: number;
  to: number;
  who: Who;
  children: ReactNode;
  side?: "right" | "below" | "above";
}) {
  const color = PEOPLE[who].color;
  const ref = useRef<HTMLDivElement>(null);
  const box = useRef<Box | null>(null);
  const measured = useRef(-1);
  const scope = useProgress((v, { version, root }) => {
    const el = ref.current;
    if (!el || !root) return;
    if (measured.current !== version) {
      measured.current = version;
      const t = find(root, target);
      box.current = t ? boxIn(root, t) : null;
    }
    const b = box.current;
    if (!b || v < from || v > to + 0.04) {
      el.style.opacity = "0";
      return;
    }
    const rw = root.clientWidth;
    const cw = el.offsetWidth;
    // Right of the element when there is room, otherwise tucked below it.
    // "above" sits at the right end so it doesn't cover the selection's layer name.
    let x = side === "right" ? b.x + b.w + 14 : side === "above" ? b.x + b.w - cw : b.x;
    let y = side === "right" ? b.y : side === "below" ? b.y + b.h + 12 : b.y - el.offsetHeight - 12;
    if (x + cw > rw - 4) {
      x = Math.max(4, Math.min(b.x, rw - cw - 4));
      if (side === "right") y = b.y + b.h + 12;
    }
    const t = ease(seg(v, from, from + 0.04));
    el.style.transform = `translate3d(${x}px, ${y + 6 * (1 - t)}px, 0)`;
    el.style.opacity = String(t * (1 - seg(v, to, to + 0.04)));
  });
  if (scope.still) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-30 whitespace-nowrap border bg-[#0c0e11]/95 px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[10px] leading-snug text-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      style={{ opacity: 0, borderColor: `${color}88` }}
    >
      {children}
    </div>
  );
}

// ─── Spacing redline ─────────────────────────────────────────────────────────

/** The red measurement between the bottom of `a` and the top of `b`. */
export function Gap({ a, b, from, to }: { a: string; b: string; from: number; to: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const boxes = useRef<[Box, Box] | null>(null);
  const measured = useRef(-1);
  const scope = useProgress((v, { version, root }) => {
    const el = ref.current;
    if (!el || !root) return;
    if (measured.current !== version) {
      measured.current = version;
      const ea = find(root, a);
      const eb = find(root, b);
      boxes.current = ea && eb ? [boxIn(root, ea), boxIn(root, eb)] : null;
    }
    const bx = boxes.current;
    if (!bx || v < from || v > to + 0.04) {
      el.style.opacity = "0";
      return;
    }
    const top = bx[0].y + bx[0].h;
    const gap = Math.max(0, bx[1].y - top);
    el.style.transform = `translate3d(${Math.min(bx[0].x, bx[1].x) - 16}px, ${top}px, 0)`;
    el.style.height = `${gap * ease(seg(v, from, from + 0.05))}px`;
    el.style.opacity = String(1 - seg(v, to, to + 0.04));
    if (label.current) label.current.textContent = String(Math.round(gap));
  });
  if (scope.still) return null;
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30 w-px bg-[#FF4D5A]" style={{ opacity: 0 }}>
      <span className="absolute -left-1 top-0 h-px w-[9px] bg-[#FF4D5A]" />
      <span className="absolute -left-1 bottom-0 h-px w-[9px] bg-[#FF4D5A]" />
      <span
        ref={label}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[2px] bg-[#FF4D5A] px-1 py-[1px] font-[family-name:var(--font-mono)] text-[9px] leading-none text-white"
      />
    </div>
  );
}

// ─── Image drop: placeholder first, then the real image ─────────────────────

/**
 * Hidden before `at`, a placeholder frame (crossed box + file name) until `show`,
 * then the real content. The content sets the size, so nothing reflows.
 */
export function Drop({
  at,
  show,
  file,
  a,
  className = "",
  children,
}: {
  at: number;
  show: number;
  file: string;
  a?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useProgress((v) => {
    const el = ref.current;
    if (!el) return;
    const stage = v < at ? "0" : v < show ? "1" : "2";
    if (el.dataset.stage !== stage) el.dataset.stage = stage;
  });
  return (
    <div ref={ref} data-stage="2" data-a={a} className={`group/drop relative transition-opacity duration-300 data-[stage=0]:opacity-0 ${className}`}>
      <div className="h-full w-full transition-opacity duration-500 group-data-[stage=0]/drop:opacity-0 group-data-[stage=1]/drop:opacity-0">
        {children}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden border border-dashed border-white/25 bg-[#15181c] group-data-[stage=1]/drop:block"
      >
        <svg className="absolute inset-0 h-full w-full text-white/10" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M0 0 100 100M100 0 0 100" stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute bottom-2 left-2 font-[family-name:var(--font-mono)] text-[10px] text-white/45">{file}</span>
      </div>
    </div>
  );
}

// ─── Rulers (desktop only), fixed to the window edges ───────────────────────

export function Rulers() {
  const { containerRef } = useSnapScroll();
  const strip = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const still = !!useReducedMotion();
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const apply = () => {
      if (strip.current) strip.current.style.transform = `translate3d(0, ${-c.scrollTop}px, 0)`;
    };
    const measure = () => setHeight(c.scrollHeight);
    measure();
    apply();
    const ro = new ResizeObserver(measure);
    if (c.firstElementChild) ro.observe(c.firstElementChild);
    c.addEventListener("scroll", apply, { passive: true });
    return () => {
      ro.disconnect();
      c.removeEventListener("scroll", apply);
    };
  }, [containerRef]);

  const marks = Array.from({ length: Math.ceil(height / 100) + 1 }, (_, i) => i * 100);
  const tick = "repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0 1px, transparent 1px 10px)";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[5] hidden lg:block ${still ? "" : "ql-rulers-in"}`}
    >
      {/* Top */}
      <div className="absolute inset-x-0 top-0 h-[18px] border-b border-white/10 bg-[#0c0d10]/90">
        <div className="absolute inset-x-0 bottom-0 h-[5px]" style={{ backgroundImage: tick }} />
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i} className="absolute top-[2px] font-[family-name:var(--font-mono)] text-[8px] text-white/30" style={{ left: 22 + i * 100 }}>
            {i * 100}
          </span>
        ))}
      </div>
      {/* Left, scrolls with the page */}
      <div className="absolute bottom-0 left-0 top-[18px] w-[18px] overflow-hidden border-r border-white/10 bg-[#0c0d10]/90">
        <div ref={strip} className="absolute inset-x-0 top-0" style={{ height }}>
          <div
            className="absolute bottom-0 right-0 top-0 w-[5px]"
            style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.18) 0 1px, transparent 1px 10px)" }}
          />
          {marks.map((m) => (
            <span
              key={m}
              className="absolute left-[3px] origin-top-left -rotate-90 font-[family-name:var(--font-mono)] text-[8px] text-white/30"
              style={{ top: m + 26 }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
