"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

/**
 * Scroll context: exposes current page index, scroll progress, and lock state.
 */
interface ScrollContextValue {
  /** Current snapped section index (0-based) */
  currentPage: number;
  /** Fractional scroll progress (e.g., 0.5 = halfway between page 0 and 1) */
  scrollProgress: number;
  /** Total number of snap sections */
  totalPages: number;
  /** Whether scrolling is locked (hero hasn't been revealed yet) */
  scrollLocked: boolean;
  /** Unlock scrolling (called after hero reveal) */
  unlockScroll: () => void;
  /** Scroll to a specific section by ID */
  scrollToSection: (id: string) => void;
}

const ScrollContext = createContext<ScrollContextValue>({
  currentPage: 0,
  scrollProgress: 0,
  totalPages: 0,
  scrollLocked: true,
  unlockScroll: () => {},
  scrollToSection: () => {},
});

export function useSnapScroll() {
  return useContext(ScrollContext);
}

/**
 * SmoothScroll — single scroll container with CSS scroll-snap.
 * Scroll is LOCKED until the hero reveal button is clicked.
 * After unlock, proximity snap scrolling between full-viewport sections.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [scrollLocked, setScrollLocked] = useState(true);

  // Count snap sections on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll<HTMLElement>("[data-snap-section]");
    setTotalPages(sections.length);
  }, []);

  // Track scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = container!.scrollTop;
        const viewportHeight = container!.clientHeight;
        if (viewportHeight === 0) { ticking = false; return; }

        const rawPage = scrollTop / viewportHeight;
        setCurrentPage(Math.round(rawPage));
        setScrollProgress(rawPage);
        ticking = false;
      });
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const unlockScroll = useCallback(() => {
    setScrollLocked(false);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Handle anchor clicks
  useEffect(() => {
    function handleHashClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      let id: string | null = null;
      if (href.startsWith("/#")) id = href.slice(2);
      else if (href.startsWith("#")) id = href.slice(1);

      if (id) {
        const el = document.getElementById(id);
        if (el && containerRef.current) {
          e.preventDefault();
          window.history.pushState(null, "", `#${id}`);
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }

    document.addEventListener("click", handleHashClick);
    return () => document.removeEventListener("click", handleHashClick);
  }, []);

  return (
    <ScrollContext.Provider
      value={{ currentPage, scrollProgress, totalPages, scrollLocked, unlockScroll, scrollToSection }}
    >
      <div
        ref={containerRef}
        className={`h-screen ${scrollLocked ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        {children}
      </div>
    </ScrollContext.Provider>
  );
}
