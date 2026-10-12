"use client";

import { useEffect, useRef, useState } from "react";
import { BlackHoleCanvas, type BlackHoleTargets } from "@/components/blackhole/BlackHoleScene";
import { LAB_LAYOUT } from "@/components/blackhole/layouts";

/**
 * Lab: the black hole scene on its own page. Scroll feeds the hole with the portrait,
 * "Collapse" implodes the disk. The real pages use the same scene.
 */

const BEATS: [number, string][] = [
  [0, "Orbit"],
  [0.18, "Pull"],
  [0.5, "Fall"],
  [0.85, "Disk"],
];

export function BlackHoleLab() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const targets = useRef<BlackHoleTargets>({ pull: 0, collapse: 0, form: 1 });
  const [collapsed, setCollapsed] = useState(false);
  const [beat, setBeat] = useState("Orbit");
  const [progress, setProgress] = useState(0);
  const [lowPower] = useState(() => typeof window !== "undefined" && window.innerWidth < 900);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      targets.current.pull = p;
      setProgress(p);
      let name = BEATS[0][1];
      for (const [t, n] of BEATS) if (p >= t) name = n;
      setBeat(name);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    targets.current.collapse = next ? 1 : 0;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-text">
      <BlackHoleCanvas className="!absolute inset-0" portrait layout={LAB_LAYOUT} targets={targets} lowPower={lowPower} />

      {/* Native scroller drives the scene; it is transparent so the canvas shows through */}
      <div ref={scrollerRef} className="absolute inset-0 overflow-y-auto overscroll-contain">
        <div style={{ height: "600vh" }} />
      </div>

      <div className="pointer-events-none absolute left-5 top-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-text-muted sm:left-8 sm:top-7">
        <div>lab / black hole preview</div>
        <div className="mt-2 text-text">
          beat · {beat} <span className="text-text-muted">({Math.round(progress * 100)}%)</span>
        </div>
      </div>
      <div className="absolute bottom-5 right-5 flex gap-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] sm:bottom-7 sm:right-8">
        <button
          type="button"
          onClick={toggleCollapse}
          className="rounded-md border border-border bg-black/60 px-3 py-2 text-text backdrop-blur transition-colors hover:border-accent"
        >
          {collapsed ? "Restore" : "Collapse"}
        </button>
        <button
          type="button"
          onClick={() => scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-md border border-border bg-black/60 px-3 py-2 text-text-muted backdrop-blur transition-colors hover:text-text"
        >
          Top
        </button>
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-[2px] bg-border">
        <div className="w-full bg-accent" style={{ height: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
