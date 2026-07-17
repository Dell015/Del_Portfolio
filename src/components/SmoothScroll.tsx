"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll context: exposes current page index, scroll progress, and lock state.
 */
interface ScrollContextValue {
  currentPage: number;
  scrollProgress: number;
  totalPages: number;
  scrollLocked: boolean;
  unlockScroll: () => void;
  lockScroll: () => void;
  scrollToSection: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// External store for scroll progress to avoid setState in scroll handler
let _scrollProgress = 0;
let _currentPage = 0;
const _listeners = new Set<() => void>();

function subscribeScroll(cb: () => void) {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}

function getScrollProgress() { return _scrollProgress; }
function getCurrentPage() { return _currentPage; }

function notifyScrollListeners() {
  _listeners.forEach((cb) => cb());
}

const ScrollContext = createContext<ScrollContextValue>({
  currentPage: 0,
  scrollProgress: 0,
  totalPages: 0,
  scrollLocked: true,
  unlockScroll: () => {},
  lockScroll: () => {},
  scrollToSection: () => {},
  containerRef: { current: null },
});

export function useSnapScroll() {
  // Subscribe to the external store for scroll values — no setState on every scroll
  const scrollProgress = useSyncExternalStore(subscribeScroll, getScrollProgress, getScrollProgress);
  const currentPage = useSyncExternalStore(subscribeScroll, getCurrentPage, getCurrentPage);
  const ctx = useContext(ScrollContext);
  return { ...ctx, scrollProgress, currentPage };
}

/**
 * SmoothScroll — scroll container.
 * Scroll is LOCKED until the hero reveal button is clicked.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scrollLocked, setScrollLocked] = useState(true);
  const pathname = usePathname();

  // Disable browser scroll restoration and force scroll to top on mount.
  // This prevents the particle system from rendering in a stale mid-scroll state on reload.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    // Reset external scroll store
    _scrollProgress = 0;
    _currentPage = 0;
    notifyScrollListeners();
  }, []);

  // Count sections on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sections = container.querySelectorAll<HTMLElement>("[data-snap-section]");
    setTotalPages(sections.length);
  }, []);

  // When navigating back to home page with a hash, unlock scroll and scroll to section
  useEffect(() => {
    if (pathname !== "/") {
      // Non-home pages should never be scroll-locked
      setScrollLocked(false);
      return;
    }

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    // Unlock scroll since user is returning (already saw the hero)
    setScrollLocked(false);

    // Wait for DOM to settle then scroll to the target section
    const timer = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Track scroll position — updates external store, NOT React state
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
        _scrollProgress = rawPage;
        _currentPage = Math.round(rawPage);
        notifyScrollListeners();
        ticking = false;
      });
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const unlockScroll = useCallback(() => {
    setScrollLocked(false);
  }, []);

  const lockScroll = useCallback(() => {
    setScrollLocked(true);
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
      value={{
        currentPage: _currentPage,
        scrollProgress: _scrollProgress,
        totalPages,
        scrollLocked,
        unlockScroll,
        lockScroll,
        scrollToSection,
        containerRef,
      }}
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
