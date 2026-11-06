"use client";

import { useModeStore, type Mode } from "@/lib/store/mode";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { useSnapScroll } from "@/components/SmoothScroll";
import { ViewPreview } from "./ViewPreview";

const mono = "font-[family-name:var(--font-mono)]";

const VIEWS: { mode: Mode; n: string; name: string; line: string; preview: "particles" | "cursors" }[] = [
  {
    mode: "immersive",
    n: "01",
    name: "Full experience",
    line: "A particle portrait, a black hole and a solar system of my projects.",
    preview: "particles",
  },
  {
    mode: "clean",
    n: "02",
    name: "Quick Look",
    line: "The short version, built live by four cursors as you scroll. Light on any device.",
    preview: "cursors",
  },
];

/**
 * The big "switch view" block at the end of both home pages. Each card carries a
 * small live preview of its view. Switching saves the choice (same as the
 * first-visit screen) and starts the other view from the top, intro included.
 */
export function ViewSwitch({ className = "" }: { className?: string }) {
  const hydrated = useModeStore((s) => s.hydrated);
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const choose = useModeStore((s) => s.choose);
  const { webglAvailable } = useDeviceCapability();
  const { containerRef, replayIntro } = useSnapScroll();

  const current: Mode = hydrated && mode === "immersive" && !reducedMotion ? "immersive" : "clean";
  const blocked = reducedMotion
    ? "Off while your device asks for reduced motion."
    : !webglAvailable
      ? "Your browser can't run the 3D scenes."
      : null;

  const go = (m: Mode) => {
    if (m === current) return;
    const c = containerRef.current;
    if (c) c.scrollTop = 0;
    // Chosen on purpose, so it starts like a first visit: "Find out", then the particles form.
    if (m === "immersive") replayIntro();
    choose(m);
  };

  return (
    <section aria-labelledby="view-switch-title" className={`relative z-10 ${className}`}>
      <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-white/45`}>
        <span className="text-accent">●</span> Switch view
      </p>
      <h2
        id="view-switch-title"
        className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.9rem,4.2vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text"
      >
        {current === "clean" ? "Seen the short version? Try the full one." : "Want the short version?"}
      </h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {VIEWS.map((v) => {
          const here = v.mode === current;
          const off = v.mode === "immersive" && !here && !!blocked;
          const heavy = v.mode === "immersive" && !off;
          return (
            <button
              key={v.mode}
              type="button"
              onClick={() => go(v.mode)}
              disabled={here || off}
              aria-pressed={here}
              className={`group relative flex min-h-[200px] flex-col justify-start overflow-hidden border bg-[#0d0e11] p-6 text-left transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-7 ${
                here
                  ? "cursor-default border-white/10"
                  : off
                    ? "cursor-not-allowed border-white/10 opacity-60"
                    : "cursor-pointer border-accent/50 hover:border-accent hover:shadow-[0_0_0_1px_#D11A2A,0_18px_60px_-20px_rgba(209,26,42,0.55)]"
              }`}
            >
              <ViewPreview kind={v.preview} dim={here || off} />

              <span className={`relative flex items-center justify-between gap-4 ${mono} text-[11px] uppercase tracking-[0.16em]`}>
                <span className={here || off ? "text-white/40" : "text-white/70"}>{v.n}</span>
                {here ? (
                  <span className="inline-flex items-center gap-2 text-white/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3ad07a]" /> You&apos;re here
                  </span>
                ) : off ? (
                  <span className="text-white/45">Not available</span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap bg-accent px-2 py-1 text-white">
                    Switch
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                )}
              </span>

              <span className="relative mt-8 block">
                <span
                  className={`block font-[family-name:var(--font-display)] text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-none tracking-[-0.02em] ${
                    here || off ? "text-white/60" : "text-text"
                  }`}
                >
                  {v.name}
                </span>
                <span className={`mt-3 block max-w-[17rem] text-[14px] leading-relaxed ${here || off ? "text-white/40" : "text-white/70"}`}>
                  {off ? blocked : v.line}
                </span>
                {heavy && (
                  <span
                    className={`mt-4 inline-flex items-start gap-2 border relative border-[#F2A541]/40 bg-[#1c160c] px-2.5 py-1.5 ${mono} text-[10px] uppercase leading-snug tracking-[0.12em] text-[#F2A541]`}
                  >
                    <span aria-hidden="true">⚠</span>
                    <span>Heavy: needs a strong GPU. Best on a laptop or desktop; may stutter on phones and older machines.</span>
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
