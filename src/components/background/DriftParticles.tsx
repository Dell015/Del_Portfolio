"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Dot {
  x: number;
  y: number;
  z: number; // 0 far .. 1 near: near dots are bigger, brighter and drift faster
  phase: number;
  red: boolean;
}

/**
 * Slow drifting dust behind the Background timeline. Plain 2D canvas, paused while the
 * section is off screen, fewer dots on phones, and still when motion is reduced.
 */
export function DriftParticles({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    let raf = 0;
    let visible = false;
    let last = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(110, Math.max(24, (w * h) / (w < 700 ? 16000 : 14000))));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        phase: Math.random() * Math.PI * 2,
        red: Math.random() < 0.18,
      }));
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        if (!reduced) {
          d.y -= (6 + d.z * 16) * dt;
          d.x += Math.sin(t * 0.0003 + d.phase) * (4 + d.z * 8) * dt;
          if (d.y < -8) {
            d.y = h + 8;
            d.x = Math.random() * w;
          }
          if (d.x < -8) d.x = w + 8;
          if (d.x > w + 8) d.x = -8;
        }
        const tw = 0.55 + 0.45 * Math.sin(t * 0.0012 + d.phase * 3);
        const a = (0.12 + d.z * 0.5) * tw;
        const r = 0.7 + d.z * 1.6;
        ctx.beginPath();
        ctx.fillStyle = d.red ? `rgba(209,26,42,${a * 1.3})` : `rgba(235,235,235,${a})`;
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (d.red && d.z > 0.5) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(209,26,42,${a * 0.18})`;
          ctx.arc(d.x, d.y, r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      if (!visible) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(loop);
    };

    build();
    draw(0, 0);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        cancelAnimationFrame(raf);
        last = 0;
        if (visible && !reduced) raf = requestAnimationFrame(loop);
      },
      { rootMargin: "120px" },
    );
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      build();
      draw(performance.now(), 0);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
