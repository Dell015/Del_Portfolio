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
  /** True once the visitor came back to a section (e.g. from a case study), skipping the hero intro. */
  introSkipped: boolean;
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

/**
 * A pinned section (the About scene) is several screens tall but should count as ONE
 * page for everything else that reasons in pages (the sphere sequence, the project
 * labels). While the pin is held the page number stays at the section's start, and
 * after it the extra height is subtracted, so those thresholds keep their meaning.
 */
let _pinEl: HTMLElement | null = null;
export function registerScrollPin(el: HTMLElement | null) {
  _pinEl = el;
}
function virtualPage(raw: number, viewportHeight: number) {
  if (!_pinEl) return raw;
  const start = _pinEl.offsetTop / viewportHeight;
  const extra = Math.max(0, (_pinEl.offsetHeight - viewportHeight) / viewportHeight);
  if (raw <= start) return raw;
  if (raw <= start + extra) return start;
  return raw - extra;
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
  introSkipped: false,
  unlockScroll: () => {},
  lockScroll: () => {},
  scrollToSection: () => {},
  containerRef: { current: null },
});

export function useSnapScroll() {
  // Subscribe to the external store for scroll values, no setState on every scroll
  const scrollProgress = useSyncExternalStore(subscribeScroll, getScrollProgress, getScrollProgress);
  const currentPage = useSyncExternalStore(subscribeScroll, getCurrentPage, getCurrentPage);
  const ctx = useContext(ScrollContext);
  return { ...ctx, scrollProgress, currentPage };
}

/**
 * SmoothScroll, scroll container.
 * Scroll is LOCKED until the hero reveal button is clicked.
 */
// A flag on `window` lives for exactly one page load and survives this component
// remounting on navigation (module-level state does not, the dev bundler can load a second
// copy of this file). That is what tells a real load or reload apart from coming back
// from a case study.
declare global {
  interface Window {
    __introLoadHandled?: boolean;
    __leftHome?: boolean;
  }
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  // Coming back to home after visiting another page skips the intro. Read from `window`
  // because this component remounts on navigation and its own state does not survive.
  const cameBack = typeof window !== "undefined" && !!window.__leftHome;
  const [lockedState, setLockedState] = useState(!cameBack);
  const [introSkipped, setIntroSkipped] = useState(cameBack);
  const pathname = usePathname();
  // Only the home page ever locks scrolling (until the immersive hero is revealed).
  const scrollLocked = lockedState && pathname === "/";

  // Disable browser scroll restoration and force scroll to top on mount.
  // This prevents the particle system from rendering in a stale mid-scroll state on reload.
  // A #hash in the URL is kept: it is a deep link (e.g. "/#projects" from a case
  // study's back link) and the effect below scrolls to it.
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

  // When navigating back to home page with a hash, unlock scroll and scroll to section.
  // The very first run is a page load or reload, not a navigation: a leftover "#projects"
  // from an earlier nav click must not skip the intro, so the hash is dropped and the
  // page starts at the very top.
  useEffect(() => {
    const initialLoad = !window.__introLoadHandled;
    window.__introLoadHandled = true;
    if (pathname !== "/") {
      window.__leftHome = true;
      return;
    }

    if (initialLoad || !window.__leftHome) {
      // A real load or reload: drop any stale "#hash" so the page starts at the very top.
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      return;
    }

    // Back on home after visiting another page: skip the intro. The URL hash is applied
    // by the router after this effect runs, so it is read inside the timer.
    let settle: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => {
      setIntroSkipped(true);
      setLockedState(false);
      // The case study's only way home is "Back to projects", so land there. The page
      // is still changing height right after the intro is skipped, so keep nudging
      // until the section sits at the top (or give up after ~3s).
      const hash = window.location.hash.slice(1) || "projects";
      let tries = 0;
      settle = setInterval(() => {
        const el = document.getElementById(hash);
        tries++;
        if (el && Math.abs(el.getBoundingClientRect().top) < 2) {
          clearInterval(settle);
          return;
        }
        el?.scrollIntoView({ behavior: "auto" });
        if (tries > 20) clearInterval(settle);
      }, 150);
    }, 200);

    return () => {
      clearTimeout(timer);
      clearInterval(settle);
    };
  }, [pathname]);

  // Mouse-wheel smoothing. A physical wheel reports big discrete steps (~100px),
  // which the browser applies as a jump. All vertical wheel and touchpad input is
  // eased toward a target position instead.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = container.scrollTop;
    let current = container.scrollTop;
    let raf = 0;
    let last = 0;
    let animating = false;
    // Positions this loop wrote recently, so its own scroll events aren't mistaken
    // for an outside scroll.
    const written: number[] = [];

    const maxScroll = () => container.scrollHeight - container.clientHeight;

    function step(now: number) {
      const dt = Math.min(48, now - last || 16);
      last = now;
      // A scroll lock (hero sequence) took over: drop any momentum still in flight.
      if (getComputedStyle(container!).overflowY === "hidden") {
        animating = false;
        return;
      }
      // Frame-rate independent exponential ease (~150ms to settle most of the way)
      const k = 1 - Math.exp(-dt / 110);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        animating = false;
      }
      container!.scrollTop = current;
      written.push(container!.scrollTop);
      if (written.length > 4) written.shift();
      if (animating) raf = requestAnimationFrame(step);
    }

    function isWheelLike(e: WheelEvent) {
      // Smooth every vertical wheel/touchpad delta by accumulating it into one
      // eased target. (Detecting "real" mouse wheels by delta size missed
      // high-DPI and scaled displays, which send fractional steps and fell
      // through to the browser's stepped scrolling.)
      return Math.abs(e.deltaY) >= Math.abs(e.deltaX);
    }

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || e.defaultPrevented) return; // pinch-zoom / already handled
      if (getComputedStyle(container!).overflowY === "hidden") return; // locked
      if (!isWheelLike(e)) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("textarea, [data-native-scroll], .overflow-x-auto")) return;

      e.preventDefault();
      if (!animating) {
        target = container!.scrollTop;
        current = target;
      }
      const delta =
        e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * container!.clientHeight : e.deltaY;
      target = Math.max(0, Math.min(maxScroll(), target + delta));
      if (!animating) {
        animating = true;
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    }

    // Anything else that moves the page (keyboard, scrollbar drag, anchor jumps)
    // must take over from the eased animation instead of fighting it.
    function onScrollSync() {
      if (animating && !written.some((w) => Math.abs(w - container!.scrollTop) < 1.5)) {
        animating = false;
        cancelAnimationFrame(raf);
      }
      if (!animating) {
        target = container!.scrollTop;
        current = target;
        written.length = 0;
      }
    }

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("scroll", onScrollSync, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("scroll", onScrollSync);
    };
  }, []);

  // Track scroll position, updates external store, NOT React state
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

        const rawPage = virtualPage(scrollTop / viewportHeight, viewportHeight);
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
    setLockedState(false);
  }, []);

  const lockScroll = useCallback(() => {
    setLockedState(true);
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
        introSkipped,
        unlockScroll,
        lockScroll,
        scrollToSection,
        containerRef,
      }}
    >
      <div
        ref={containerRef}
        className={`relative h-screen ${scrollLocked ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        {children}
      </div>
    </ScrollContext.Provider>
  );
}
