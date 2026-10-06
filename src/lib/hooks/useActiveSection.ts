"use client";

import { useEffect, useState } from "react";
import { useSnapScroll } from "@/components/SmoothScroll";

/**
 * Which section is crossing the middle of the viewport.
 *
 * Observes the real section elements inside the site's scroll container, so it
 * stays correct however tall each section is. (The previous approach divided
 * scrollTop by viewport height and indexed into a fixed list — it only worked
 * if every section was exactly one screen tall.)
 *
 * `refreshKey` re-attaches the observer when sections are swapped at runtime
 * (e.g. the Projects grid <-> particle sphere).
 */
export function useActiveSection(ids: readonly string[], refreshKey?: unknown): string {
  const { containerRef } = useSnapScroll();
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A thin band across the middle of the viewport: the section under it is "current".
      { root, rootMargin: "-45% 0px -54% 0px", threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [containerRef, ids, refreshKey]);

  return active;
}
