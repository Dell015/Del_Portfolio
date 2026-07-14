"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Initializes Lenis smooth scroll site-wide.
 * Runs in both Clean and Immersive modes (cheap, high impact).
 * Respects prefers-reduced-motion by disabling smooth scroll.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle anchor links (e.g. /#projects)
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (href?.startsWith("/#")) {
        const id = href.slice(2);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el, { offset: -80 });
        }
      }
    };

    document.addEventListener("click", handleHashClick);

    return () => {
      document.removeEventListener("click", handleHashClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
