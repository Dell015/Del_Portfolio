"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A quiet dot grid that lights up around the cursor.
 *
 * It replaces a full-screen WebGL shader: nothing animates on its own, so it
 * costs nothing while idle, never competes with the text, and works on every
 * device. The light follows the pointer with a small ease so it trails the
 * cursor rather than snapping to it. With no pointer (touch) it just rests.
 */
export function DotField({ children, className = "" }: { children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const section = el.parentElement;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let running = false;

    function tick() {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el!.style.setProperty("--mx", `${cx}px`);
      el!.style.setProperty("--my", `${cy}px`);
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const r = el!.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }

    section.addEventListener("pointermove", onMove);
    return () => {
      section.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={`dot-field pointer-events-none absolute inset-0 ${className}`}>
      <div className="dot-field__base" />
      <div className="dot-field__glow" />
      <div className="dot-field__lit" />
      {children}
    </div>
  );
}
