"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useModeStore, type Mode } from "@/lib/store/mode";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { site } from "@/lib/content/site";

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
    body: "The short version. A clean page with everything that matters, and no heavy effects. Works on any device.",
    cta: "Show me the page",
  },
  {
    value: "immersive",
    tag: "The full experience",
    title: "Let's have fun",
    body: "A particle portrait, a black hole and a 3D project sphere you can spin. Best on a laptop or desktop.",
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

  // Only the home page has the two experiences; a shared case-study link opens straight to its content.
  const onHome = usePathname() === "/";
  const open = onHome && hydrated && !chosen && webglAvailable && !reducedMotion;

  return <AnimatePresence>{open && <Gate onChoose={choose} />}</AnimatePresence>;
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

      <div className="relative w-full max-w-3xl text-center">
        <motion.p
          className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-text-muted"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {site.name} · Portfolio
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
          Same person, same work. Pick how you want to meet it. You can change this from the footer.
        </motion.p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
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
                className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-7 ${
                  fun
                    ? "border-accent/50 bg-gradient-to-br from-accent/[0.14] to-white/[0.02] hover:border-accent hover:shadow-[0_0_60px_-10px_rgba(209,26,42,0.55)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
                } hover:-translate-y-1`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  className={`font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] ${
                    fun ? "text-accent" : "text-text-muted"
                  }`}
                >
                  {o.tag}
                </span>
                <span className="mt-3 block font-[family-name:var(--font-display)] text-2xl font-semibold text-text">
                  {o.title}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-text-muted">{o.body}</span>
                <span
                  className={`mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-sm font-semibold ${
                    fun ? "text-white" : "text-text"
                  }`}
                >
                  {o.cta}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
