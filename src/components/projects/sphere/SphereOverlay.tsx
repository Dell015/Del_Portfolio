"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSnapScroll } from "@/components/SmoothScroll";
import {
  PALETTES,
  SETTING_LIMITS,
  DEFAULT_SPHERE_SETTINGS,
  type SphereSettings,
} from "@/lib/sphere/settings";

interface SphereOverlayProps {
  /** True while the sphere is formed and explorable. */
  visible: boolean;
  settings: SphereSettings;
  onChange: (patch: Partial<SphereSettings>) => void;
  onReset: () => void;
  /** Rebuild the WebGL scene from scratch (for when something looks off). */
  onRefresh: () => void;
}

const SLIDERS = [
  { key: "size", label: "Particle size" },
  { key: "scale", label: "Sphere size" },
  { key: "spin", label: "Spin speed" },
  { key: "glow", label: "Glow" },
] as const;

const PANEL_ID = "sphere-customize-panel";

/**
 * Trackball for touch screens. Its pointer events reach the sphere's window-level
 * drag handler, and `touch-action: none` keeps the page from scrolling under the finger.
 */
function TouchBall() {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const origin = useRef<{ x: number; y: number } | null>(null);
  const R = 22;
  return (
    <div
      data-sphere-ui=""
      className="pointer-events-auto absolute bottom-3 left-3 hidden h-24 w-24 select-none items-center justify-center rounded-full border border-white/15 bg-[#0E1013]/70 backdrop-blur-md pointer-coarse:flex"
      style={{ touchAction: "none" }}
      role="presentation"
      aria-label="Drag to rotate the sphere"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        origin.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        if (!origin.current) return;
        const dx = e.clientX - origin.current.x;
        const dy = e.clientY - origin.current.y;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, R / d);
        setKnob({ x: dx * k, y: dy * k });
      }}
      onPointerUp={() => {
        origin.current = null;
        setKnob({ x: 0, y: 0 });
      }}
      onPointerCancel={() => {
        origin.current = null;
        setKnob({ x: 0, y: 0 });
      }}
    >
      <span aria-hidden="true" className="absolute font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.2em] text-text-muted/70" style={{ bottom: 8 }}>
        rotate
      </span>
      <span
        aria-hidden="true"
        className="h-9 w-9 rounded-full border border-white/40 bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.15)]"
        style={{ transform: `translate(${knob.x}px, ${knob.y - 6}px)`, transition: (knob.x || knob.y) ? "none" : "transform 220ms ease-out" }}
      />
    </div>
  );
}

/**
 * The words, the explanation and the controls around the sphere. It sits in the
 * canvas wrapper, which is pointer-transparent, so only the interactive pieces
 * opt back in (and forward the wheel, otherwise scrolling would stall over them).
 */
export function SphereOverlay({ visible, settings, onChange, onReset, onRefresh }: SphereOverlayProps) {
  const { containerRef } = useSnapScroll();
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the panel when the sphere scene is left, and on Escape / outside click
  useEffect(() => {
    if (!visible) return;
    return () => setOpen(false);
  }, [visible]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    function onDown(e: PointerEvent) {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (panelRef.current?.contains(t) || toggleRef.current?.contains(t)) return;
      setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  /** Let the wheel reach the page while the pointer is over a control. */
  const forwardWheel = useCallback(
    (e: React.WheelEvent) => {
      const el = containerRef.current;
      if (!el) return;
      el.dispatchEvent(
        new WheelEvent("wheel", {
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          deltaMode: e.deltaMode,
          bubbles: true,
          cancelable: true,
        }),
      );
    },
    [containerRef],
  );

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    onRefresh();
    window.setTimeout(() => setRefreshing(false), 900);
  };

  const isDefault =
    JSON.stringify(settings) === JSON.stringify(DEFAULT_SPHERE_SETTINGS);

  return (
    <div
      aria-hidden={!visible}
      // `inert` also removes the controls from the tab order while the scene is off screen
      inert={!visible}
      className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Mobile / tablet: one line under the nav */}
      <p className="absolute inset-x-6 top-24 text-center font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-text-muted lg:hidden">
        Seven projects · tap a point · tap away to close
      </p>

      {/* Left: what you are looking at */}
      <div className="absolute left-10 top-1/2 hidden max-w-[17rem] -translate-y-1/2 lg:block xl:left-16">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-accent">
          Index · 07
        </p>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] tracking-tight text-text">
          Seven products, <span className="text-text-muted">one sphere.</span>
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          Every point is something I designed and am still building. Karela, my thesis, is the
          closest to launch.
        </p>
      </div>

      {/* Right: how to explore */}
      <div className="absolute right-10 top-1/2 hidden w-60 -translate-y-1/2 lg:block xl:right-16">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-text-muted">
          How to explore
        </p>
        <dl className="mt-4 space-y-3.5 border-l border-white/10 pl-4">
          {[
            ["Drag", "Rotate the sphere"],
            ["Hover", "Preview a project"],
            ["Scroll", "Carry on to skills"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-3">
              <dt className="w-14 shrink-0 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-text">
                {k}
              </dt>
              <dd className="text-sm text-text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs leading-relaxed text-text-muted/80">
          Nothing here is shipped yet. Each project page shows what is built and what is next.
        </p>
      </div>

      {/* Touch only: a trackball for turning the sphere (a drag on the page itself scrolls it) */}
      <TouchBall />

      {/* Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 sm:bottom-6 sm:right-6">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          onWheel={forwardWheel}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-[#0E1013]/70 px-4 py-2 font-[family-name:var(--font-mono)] text-xs tracking-wide text-text backdrop-blur-md transition-colors duration-300 hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          style={open ? { borderColor: "rgba(209,26,42,0.7)" } : undefined}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7" />
            <circle cx="10.5" cy="4.5" r="1.6" />
            <circle cx="5.5" cy="11.5" r="1.6" />
          </svg>
          Customize
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          onWheel={forwardWheel}
          disabled={refreshing}
          aria-label="Refresh the sphere"
          title="Rebuild the sphere if it looks off"
          className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-[#0E1013]/70 px-4 py-2 font-[family-name:var(--font-mono)] text-xs tracking-wide text-text backdrop-blur-md transition-colors duration-300 hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
            <path d="M13.5 2.5v3h-3" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Customize panel */}
      {open && (
        <div
          id={PANEL_ID}
          ref={panelRef}
          role="dialog"
          aria-label="Customize the sphere"
          onWheel={forwardWheel}
          className="pointer-events-auto absolute bottom-16 right-3 w-[min(19rem,calc(100vw-1.5rem))] rounded-2xl border border-white/12 bg-[#0E1013]/90 p-5 shadow-2xl backdrop-blur-xl sm:bottom-[4.75rem] sm:right-6"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-text">
              Customize
            </h4>
            <button
              type="button"
              onClick={onReset}
              disabled={isDefault}
              className="font-[family-name:var(--font-mono)] text-[11px] tracking-wide text-text-muted underline-offset-4 transition-colors hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:no-underline disabled:opacity-40"
            >
              Reset
            </button>
          </div>

          <fieldset className="mt-4">
            <legend className="text-[11px] uppercase tracking-wider text-text-muted">Color</legend>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {PALETTES.map((p) => {
                const active = settings.palette === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ palette: p.id })}
                    aria-pressed={active}
                    aria-label={p.label}
                    title={p.label}
                    className="group flex flex-col items-center gap-1.5 rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span
                      className="h-8 w-8 rounded-full border transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]})`,
                        borderColor: active ? "#ffffff" : "rgba(255,255,255,0.15)",
                        boxShadow: active ? "0 0 0 2px rgba(255,255,255,0.25)" : undefined,
                      }}
                    />
                    <span className={`text-[10px] ${active ? "text-text" : "text-text-muted"}`}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 space-y-3.5">
            {SLIDERS.map(({ key, label }) => {
              const lim = SETTING_LIMITS[key];
              const id = `sphere-${key}`;
              return (
                <div key={key}>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor={id} className="text-[11px] uppercase tracking-wider text-text-muted">
                      {label}
                    </label>
                    <output htmlFor={id} className="font-[family-name:var(--font-mono)] text-[11px] text-text">
                      {settings[key].toFixed(2).replace(/\.?0+$/, "") || "0"}
                    </output>
                  </div>
                  <input
                    id={id}
                    type="range"
                    min={lim.min}
                    max={lim.max}
                    step={lim.step}
                    value={settings[key]}
                    onChange={(e) => onChange({ [key]: Number(e.target.value) })}
                    className="mt-1.5 h-1.5 w-full cursor-pointer accent-accent"
                  />
                </div>
              );
            })}
          </div>

          <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-text-muted">
            Background particles
            <input
              type="checkbox"
              role="switch"
              checked={settings.backdrop}
              onChange={(e) => onChange({ backdrop: e.target.checked })}
              className="h-4 w-4 cursor-pointer accent-accent"
            />
          </label>
        </div>
      )}
    </div>
  );
}
