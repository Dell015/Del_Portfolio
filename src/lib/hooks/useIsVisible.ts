"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Returns true when the element is within `margin` of the viewport.
 * Uses the nearest scrollable ancestor as root.
 */
export function useIsVisible(margin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Find the scroll container (overflow-y auto/scroll ancestor)
    let root: HTMLElement | null = null;
    let parent = el.parentElement;
    while (parent && parent !== document.documentElement) {
      const style = window.getComputedStyle(parent);
      if (style.overflowY === "auto" || style.overflowY === "scroll") {
        root = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { root, rootMargin: margin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return { ref, visible };
}
