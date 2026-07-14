"use client";

import { useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { type RefObject, useCallback } from "react";

interface MagneticHoverOptions {
  /** Maximum displacement in pixels (default: 6) */
  strength?: number;
  /** Radius in pixels within which the effect activates (default: element bounds) */
  radius?: number;
}

interface MagneticHoverReturn {
  x: MotionValue<number>;
  y: MotionValue<number>;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const springConfig = { stiffness: 150, damping: 15, mass: 1 };

export function useMagneticHover(
  ref: RefObject<HTMLElement | null>,
  options: MagneticHoverOptions = {}
): MagneticHoverReturn {
  const { strength = 6, radius } = options;

  const xMotion = useMotionValue(0);
  const yMotion = useMotionValue(0);

  const x = useSpring(xMotion, springConfig);
  const y = useSpring(yMotion, springConfig);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      // If radius is specified, only activate within that radius
      if (radius !== undefined) {
        const distance = Math.sqrt(distX * distX + distY * distY);
        if (distance > radius) {
          xMotion.set(0);
          yMotion.set(0);
          return;
        }
      }

      // Normalize displacement relative to element half-size, clamped to strength
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;

      const moveX = Math.max(-strength, Math.min(strength, (distX / halfWidth) * strength));
      const moveY = Math.max(-strength, Math.min(strength, (distY / halfHeight) * strength));

      xMotion.set(moveX);
      yMotion.set(moveY);
    },
    [ref, strength, radius, xMotion, yMotion]
  );

  const onMouseLeave = useCallback(() => {
    xMotion.set(0);
    yMotion.set(0);
  }, [xMotion, yMotion]);

  return { x, y, onMouseMove, onMouseLeave };
}
