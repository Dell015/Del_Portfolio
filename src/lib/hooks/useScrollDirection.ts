"use client";

import { useEffect, useState } from "react";
import { useSnapScroll } from "@/components/SmoothScroll";

/**
 * `hidden` is true while the user is scrolling down past `offset` px, and false
 * as soon as they scroll back up. Runs from a passive scroll listener — never
 * from render — and ignores sub-`threshold` jitter so trackpads don't flicker it.
 */
export function useHideOnScrollDown(offset = 160, threshold = 6): boolean {
  const { containerRef } = useSnapScroll();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let last = el.scrollTop;

    function onScroll() {
      const y = el!.scrollTop;
      const delta = y - last;
      if (Math.abs(delta) < threshold) return;
      setHidden(delta > 0 && y > offset);
      last = y;
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef, offset, threshold]);

  return hidden;
}
