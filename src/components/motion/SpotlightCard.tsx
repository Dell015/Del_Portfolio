"use client";

import { useCallback, type HTMLAttributes, type PointerEvent } from "react";

/**
 * A card whose border and surface light up under the cursor.
 * Pure CSS does the painting (see `.spotlight-card` in globals.css); this only
 * feeds it the pointer position, so there is no per-frame React work.
 * Touch devices have no hover, so the effect is switched off there.
 */
export function SpotlightCard({
  className = "",
  children,
  onPointerMove,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const handleMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }
      onPointerMove?.(e);
    },
    [onPointerMove],
  );

  return (
    <div {...rest} onPointerMove={handleMove} className={`spotlight-card ${className}`}>
      {children}
    </div>
  );
}
