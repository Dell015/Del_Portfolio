"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A curtain that wipes up over the page when a project case study is opened (and when
 * "Back to projects" is used), then lifts off once the next page is in place.
 * Only those two links are intercepted; everything else navigates normally.
 */
const COVER_MS = 480;
const EASE = [0.76, 0, 0.24, 1] as const;

type Phase = "idle" | "covering" | "covered" | "revealing";

function isCaseStudyLink(href: string) {
  return /^\/projects\/[^/#?]+\/?$/.test(href);
}

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const [label, setLabel] = useState("Opening");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function go(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  useEffect(() => {
    if (reduce) return;
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (phaseRef.current !== "idle") return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href) return;
      const here = window.location.pathname;
      const opening = here === "/" && isCaseStudyLink(href);
      const leaving = here.startsWith("/projects/") && href.startsWith("/#");
      if (!opening && !leaving) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setLabel(opening ? "Opening" : "Back");
      go("covering");
      timer.current = setTimeout(() => {
        go("covered");
        router.push(href);
      }, COVER_MS);
    }
    // Capture phase so this runs before the router's own link handling.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(timer.current);
    };
  }, [reduce, router]);

  // The new page is in place: lift the curtain.
  useEffect(() => {
    if (phaseRef.current !== "covered") return;
    const t = setTimeout(() => go("revealing"), 250);
    return () => clearTimeout(t);
  }, [pathname]);

  // Safety: never leave the curtain up if the navigation doesn't happen.
  useEffect(() => {
    if (phase !== "covered") return;
    const t = setTimeout(() => go("revealing"), 4000);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "idle") return null;

  const up = phase === "revealing";
  return (
    <motion.div
      aria-hidden
      className="pointer-events-auto fixed inset-0 z-[90] flex items-center justify-center bg-[#0F0F0F]"
      initial={{ y: "100%" }}
      animate={{ y: up ? "-100%" : "0%" }}
      transition={{ duration: COVER_MS / 1000, ease: EASE }}
      onAnimationComplete={() => {
        if (phaseRef.current === "revealing") go("idle");
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--accent)]" />
      <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
        {label}
      </span>
    </motion.div>
  );
}
