"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useModeStore, type Mode } from "@/lib/store/mode";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { site } from "@/lib/content/site";
import { useSnapScroll } from "@/components/SmoothScroll";
import { ViewPreview } from "./ViewPreview";

const OPTIONS: {
  value: Mode;
  tag: string;
  title: string;
  body: string;
  cta: string;
}[] = [
  {
    value: "clean",
    tag: "About 1 minute",
    title: "Quick look",
    body: "The short version, built live by a swarm of cursors as you scroll. Light on any device.",
    cta: "Show me",
  },
  {
    value: "immersive",
    tag: "The full experience",
    title: "Let's have fun",
    body: "A particle portrait, a black hole and a solar system of my projects.",
    cta: "Let's go",
  },
];

/**
 * First-visit screen: "quick look, or ready to have fun?".
 *
 * It only exists in the browser, after the saved choice has been read, so the
 * server HTML (and anything that does not run JS) is still the full clean page.
 * It is skipped for visitors who cannot get the fun version anyway (no WebGL, or
 * reduced motion) and for anyone who already picked on an earlier visit.
 */
export function ModeGate() {
  const hydrated = useModeStore((s) => s.hydrated);
  const chosen = useModeStore((s) => s.chosen);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const choose = useModeStore((s) => s.choose);
  const { webglAvailable } = useDeviceCapability();
  const { replayIntro } = useSnapScroll();

  // Only the home page has the two experiences; a shared case-study link opens straight to its content.
  const onHome = usePathname() === "/";
  const open = onHome && hydrated && !chosen && webglAvailable && !reducedMotion;

  // Picking the full experience always starts with its intro, even if this visit began on
  // another page (which normally skips the intro when coming home).
  const pick = (m: Mode) => {
    if (m === "immersive") replayIntro();
    choose(m);
  };

  return <AnimatePresence>{open && <Gate onChoose={pick} />}</AnimatePresence>;
}

function Gate({ onChoose }: { onChoose: (m: Mode) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Decorative drifting dots, fixed positions so server and client agree and nothing reflows.
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
          return x - Math.floor(x);
        };
        return {
          left: `${r(1) * 100}%`,
          top: `${r(2) * 100}%`,
          size: 2 + r(3) * 5,
          delay: -r(4) * 14,
          dur: 12 + r(5) * 14,
          red: r(6) > 0.82,
        };
      }),
    [],
  );

  useEffect(() => {
    // Focus the dialog itself: screen readers start in it, and no button shows a focus ring until Tab.
    dialogRef.current?.focus();
  }, []);

  // Escape takes the quick route; Tab stays inside the two choices.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onChoose("clean");
      } else if (e.key === "Tab") {
        const a = refs.current[0];
        const b = refs.current[1];
        if (!a || !b) return;
        const on = document.activeElement;
        if (e.shiftKey && on === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && on === b) {
          e.preventDefault();
          a.focus();
        } else if (on !== a && on !== b) {
          e.preventDefault();
          a.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onChoose]);

  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-gate-title"
      className="fixed inset-0 z-[90] flex items-center outline-none justify-center overflow-y-auto bg-[#0b0b0b] px-5 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Soft red glow and drifting dots: the page's particles, hinted at */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[38%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(209,26,42,0.16), transparent 65%)" }}
        />
        {dots.map((d, i) => (
          <span
            key={i}
            className="gate-dot absolute rounded-full"
            style={{
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              background: d.red ? "#D11A2A" : "rgba(245,245,245,0.55)",
              animationDuration: `${d.dur}s`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-4xl text-center">
        <motion.p
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-text-muted"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {site.name} · Full-stack developer
        </motion.p>

        <motion.h1
          id="mode-gate-title"
          className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.1rem,6vw,4rem)] font-bold leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          Quick look, or ready to <em className="font-[family-name:var(--font-serif)] font-normal text-accent">have fun?</em>
        </motion.h1>

        <motion.p
          className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-muted"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          Same work either way. The quick version takes about a minute. You can switch later from the footer.
        </motion.p>

        <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          {OPTIONS.map((o, i) => {
            const fun = o.value === "immersive";
            return (
              <motion.button
                key={o.value}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                onClick={() => onChoose(o.value)}
                className={`group relative flex min-h-[230px] flex-col justify-start overflow-hidden border bg-[#0d0e11] p-6 text-left transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-7 ${
                  fun
                    ? "border-accent/60 hover:border-accent hover:shadow-[0_0_0_1px_#D11A2A,0_18px_60px_-20px_rgba(209,26,42,0.55)]"
                    : "border-white/15 hover:border-white/40 hover:shadow-[0_18px_60px_-24px_rgba(255,255,255,0.18)]"
                }`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* A live miniature of each view, the same ones as the switch in the footer */}
                <ViewPreview kind={fun ? "particles" : "cursors"} />

                <span className="relative flex items-center justify-between gap-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em]">
                  <span className={`min-w-0 ${fun ? "text-accent" : "text-text-muted"}`}>
                    {String(i + 1).padStart(2, "0")} · {o.tag}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-2 py-1 ${
                      fun ? "bg-accent text-white" : "border border-white/20 text-text"
                    }`}
                  >
                    {o.cta}
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </span>

                <span className="relative mt-8 block">
                  <span className="block font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.2vw,2.5rem)] font-bold leading-none tracking-[-0.02em] text-text">
                    {o.title}
                  </span>
                  <span className="mt-3 block max-w-[17rem] text-[14px] leading-relaxed text-white/70">{o.body}</span>
                  {fun && (
                    <span className="mt-4 inline-flex items-start gap-2 border relative border-[#F2A541]/40 bg-[#1c160c] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase leading-snug tracking-[0.12em] text-[#F2A541]">
                      <span aria-hidden="true">⚠</span>
                      <span>Heavy: needs a strong GPU. Best on a laptop or desktop; may stutter on phones and older machines.</span>
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
