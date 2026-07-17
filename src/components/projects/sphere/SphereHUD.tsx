"use client";

import { useEffect, useState } from "react";

interface SphereHUDProps {
  progress: number;
  hoveredProject?: string | null;
}

export function SphereHUD({ progress, hoveredProject }: SphereHUDProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => f + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const phase = progress < 0.25 ? 1 : progress < 0.5 ? 2 : progress < 0.65 ? 3 : progress < 0.8 ? 4 : 5;
  const phaseLabel = ["", "GATHERING", "CONDENSING", "DISPERSING", "AMBIENT", "SPHERE"][phase];

  // Only show when animation is active
  const opacity = progress > 0.02 && progress < 0.98 ? 1 : 0;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
      style={{ opacity }}
    >
      {/* Top-left: coordinates */}
      <div className="absolute top-6 left-6 font-[family-name:var(--font-mono)] text-[10px] leading-tight tracking-wider">
        <p className="text-emerald-400/60">
          x: {(Math.sin(frame * 0.05) * 3.2).toFixed(3)}
        </p>
        <p className="text-emerald-400/60">
          y: {(Math.cos(frame * 0.03) * 2.1).toFixed(3)}
        </p>
        <p className="text-emerald-400/60">
          z: {(Math.sin(frame * 0.07) * 1.8).toFixed(3)}
        </p>
        <p className="mt-1 text-pink-400/60">
          PHASE: {phaseLabel}
        </p>
      </div>

      {/* Top-right: progress meter */}
      <div className="absolute top-6 right-6 font-[family-name:var(--font-mono)] text-[10px] leading-tight tracking-wider text-right">
        <p className="text-emerald-400/60">
          SCROLL: {(progress * 100).toFixed(1)}%
        </p>
        <p className="text-emerald-400/60">
          PARTICLES: {progress < 0.5 ? "ACTIVE" : "STABLE"}
        </p>
        <p className="text-pink-400/60">
          NODES: {progress > 0.88 ? "VISIBLE" : "HIDDEN"}
        </p>
      </div>

      {/* Bottom-left: frame counter */}
      <div className="absolute bottom-6 left-6 font-[family-name:var(--font-mono)] text-[10px] leading-tight tracking-wider">
        <p className="text-emerald-400/40">
          FRM: {(frame % 9999).toString().padStart(4, "0")}
        </p>
        <p className="text-emerald-400/40">
          SYS: NOMINAL
        </p>
      </div>

      {/* Bottom-right: hovered project name */}
      <div className="absolute bottom-6 right-6 font-[family-name:var(--font-mono)] text-[10px] leading-tight tracking-wider text-right">
        {hoveredProject ? (
          <>
            <p className="text-pink-400/80">
              TARGET: {hoveredProject.toUpperCase().replace("-", ".")}
            </p>
            <p className="text-pink-400/60">
              STATUS: CLICK TO INSPECT
            </p>
          </>
        ) : (
          <>
            <p className="text-emerald-400/40">
              {progress > 0.88 ? "DRAG TO ROTATE" : "SCROLL TO ADVANCE"}
            </p>
            <p className="text-emerald-400/40">
              DEL.PORTFOLIO.v1
            </p>
          </>
        )}
      </div>
    </div>
  );
}
