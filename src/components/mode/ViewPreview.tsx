"use client";

import { useEffect, useRef } from "react";

/**
 * Small live previews inside the view-switch cards, drawn on a plain 2D canvas
 * (no WebGL, so they cost almost nothing):
 * - "particles": a tilted accretion ring around a dark core, the full experience in miniature.
 * - "cursors": a handful of collaborator cursors wandering and selecting things, the Quick Look.
 *
 * Hovering the card speeds the particles up / pulls the cursors toward the pointer.
 * Only animates while on screen; reduced motion gets one still frame.
 */
export function ViewPreview({ kind, dim = false }: { kind: "particles" | "cursors"; dim?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia("(max-width: 640px)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    let last = performance.now();
    const hot = { on: false, x: 0, y: 0, k: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // ── particles ──────────────────────────────────────────────
    const N = phone ? 260 : 460;
    const dots = Array.from({ length: N }, () => {
      const r = 0.3 + Math.pow(Math.random(), 0.8) * 0.7; // 0.3..1 of the ring size
      return {
        a: Math.random() * Math.PI * 2,
        r,
        s: (0.18 + Math.random() * 0.12) / Math.sqrt(r),
        z: (Math.random() - 0.5) * 0.12,
        red: Math.random() < 0.55,
        size: 1 + Math.random() * 1.4,
      };
    });
    const drawParticles = (dt: number) => {
      // Narrow cards (phones) keep it up in the top-right corner, clear of the text.
      const narrow = w < 480;
      const cx = narrow ? w * 0.8 : w * 0.72;
      const cy = narrow ? h * 0.42 : h * 0.56;
      const R = narrow ? Math.min(w * 0.3, h * 0.42) : Math.min(w * 0.4, h * 1.05);
      const tilt = -0.28;
      const spin = 1 + hot.k * 2.4;
      ctx.clearRect(0, 0, w, h);
      // glow behind the core
      const g = ctx.createRadialGradient(cx, cy, R * 0.05, cx, cy, R * 0.75);
      g.addColorStop(0, `rgba(209,26,42,${0.32 + hot.k * 0.2})`);
      g.addColorStop(1, "rgba(209,26,42,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);
      for (const d of dots) {
        d.a += d.s * spin * dt;
        const rr = d.r * (1 - hot.k * 0.12);
        const x0 = Math.cos(d.a) * rr * R;
        const y0 = (Math.sin(d.a) * 0.36 + d.z) * rr * R;
        const x = cx + x0 * cos - y0 * sin;
        const y = cy + x0 * sin + y0 * cos;
        const front = Math.sin(d.a) > 0 ? 1 : 0.45;
        const a = (0.45 + 0.55 * front) * (dim ? 0.5 : 1);
        ctx.fillStyle = d.red ? `rgba(255,90,102,${a})` : `rgba(245,240,235,${a * 0.9})`;
        ctx.fillRect(x, y, d.size, d.size);
      }
      ctx.globalCompositeOperation = "source-over";
      // the dark core
      ctx.fillStyle = "#050506";
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.13, 0, Math.PI * 2);
      ctx.fill();
    };

    // ── cursors ────────────────────────────────────────────────
    const PEOPLE = [
      { c: "#D11A2A", l: "Randel" },
      { c: "#F2A541", l: "design" },
      { c: "#3DD6C3", l: "copy" },
      { c: "#9B8CFF", l: "code" },
    ];
    const M = phone ? 5 : 9;
    // Narrow cards (phones) keep the swarm in the top-right corner, clear of the text.
    const area = () => (w < 480 ? { x0: w * 0.56, x1: w - 64, y0: 62, y1: h * 0.62 } : { x0: w * 0.48, x1: w - 72, y0: 66, y1: h - 34 });
    const pick = () => {
      const A = area();
      return { x: A.x0 + Math.random() * (A.x1 - A.x0), y: A.y0 + Math.random() * (A.y1 - A.y0) };
    };
    type Cur = { x: number; y: number; tx: number; ty: number; wait: number; who: number; label: boolean; sel: { x: number; y: number; w: number; h: number; t: number } | null };
    let curs: Cur[] = [];
    const seedCursors = () => {
      curs = Array.from({ length: M }, (_, i) => {
        const p = pick();
        const t = pick();
        return { x: p.x, y: p.y, tx: t.x, ty: t.y, wait: Math.random(), who: i % 4, label: i < 4, sel: null };
      });
    };
    const arrow = (x: number, y: number, color: string, s: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(13, 6.6);
      ctx.lineTo(7.4, 8);
      ctx.lineTo(4.8, 14);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.restore();
    };
    const drawCursors = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (const c of curs) {
        if (hot.on) {
          // flock toward the pointer, each one keeping a little distance
          c.tx = hot.x + Math.cos(c.who * 1.7 + c.x * 0.01) * 34;
          c.ty = hot.y + Math.sin(c.who * 2.3 + c.y * 0.01) * 26;
        } else if (c.wait > 0) {
          c.wait -= dt;
          if (c.wait <= 0) {
            const t = pick();
            c.tx = t.x;
            c.ty = t.y;
          }
        }
        const k = 1 - Math.pow(0.02, dt * (hot.on ? 1.6 : 0.9));
        c.x += (c.tx - c.x) * k;
        c.y += (c.ty - c.y) * k;
        if (!hot.on && c.wait <= 0 && Math.hypot(c.tx - c.x, c.ty - c.y) < 2) {
          c.wait = 0.4 + Math.random() * 1.4;
          if (Math.random() < 0.55) {
            const sw = 26 + Math.random() * 60;
            const sh = 12 + Math.random() * 30;
            c.sel = { x: c.x - sw, y: c.y - sh, w: sw, h: sh, t: 1 };
          }
        }
        const p = PEOPLE[c.who]!;
        if (c.sel) {
          c.sel.t -= dt * 0.7;
          if (c.sel.t <= 0) c.sel = null;
          else {
            ctx.globalAlpha = Math.min(1, c.sel.t * 1.5) * (dim ? 0.5 : 0.9);
            ctx.strokeStyle = p.c;
            ctx.lineWidth = 1;
            ctx.strokeRect(c.sel.x + 0.5, c.sel.y + 0.5, c.sel.w, c.sel.h);
            ctx.globalAlpha = 1;
          }
        }
        ctx.globalAlpha = dim ? 0.55 : 1;
        arrow(c.x, c.y, p.c, phone ? 0.85 : 1);
        if (c.label) {
          const tw = ctx.measureText(p.l).width;
          ctx.fillStyle = p.c;
          ctx.fillRect(c.x + 11, c.y + 12, tw + 8, 13);
          ctx.fillStyle = c.who === 0 ? "#fff" : "#111";
          ctx.fillText(p.l, c.x + 15, c.y + 21.5);
        }
        ctx.globalAlpha = 1;
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      hot.k += ((hot.on ? 1 : 0) - hot.k) * Math.min(1, dt * 4);
      if (kind === "particles") drawParticles(dt);
      else drawCursors(dt);
      if (visible && !still) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (kind === "cursors") seedCursors();
    frame(performance.now());

    const ro = new ResizeObserver(() => {
      resize();
      if (kind === "cursors") seedCursors();
      if (!visible || still) frame(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible && !still) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      hot.x = e.clientX - r.left;
      hot.y = e.clientY - r.top;
    };
    const enter = (e: PointerEvent) => {
      hot.on = true;
      move(e);
    };
    const leave = () => {
      hot.on = false;
      for (const c of curs) c.wait = Math.random() * 0.6;
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [kind, dim]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 32%, black 55%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 32%, black 55%)",
      }}
    />
  );
}
