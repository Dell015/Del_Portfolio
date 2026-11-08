"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { useLocalTime } from "@/lib/hooks/useLocalTime";
import { useModeStore } from "@/lib/store/mode";
import { availability, footer as footerContent } from "@/lib/content/site";

/*
 * Navigation as a camera viewfinder: no bar, just the four corners of the screen,
 * each marked with a red crop corner like the portrait's frame.
 *   top-left: name (back to top)      top-right: contact + local time
 *   bottom-left: the section index    bottom-right: how far down the page you are
 * Phones keep the two top corners; the section index opens from "Menu".
 */

const NAV_LINKS = [
  { n: "01", label: "About", href: "/#about" },
  { n: "02", label: "Projects", href: "/#projects" },
  { n: "03", label: "Skills", href: "/#skills" },
  { n: "04", label: "Background", href: "/#background" },
  { n: "05", label: "Resume", href: "/#resume" },
] as const;

const CONTACT_LINK = { label: "Contact", href: "/#footer" } as const;

/** Section IDs in page order. */
const SECTION_IDS = ["hero", "about", "projects", "skills", "background", "resume", "footer"] as const;

const mono = "font-[family-name:var(--font-mono)]";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

type Pos = "tl" | "tr" | "bl" | "br";
const CORNER: Record<Pos, { box: string; mark: string }> = {
  tl: { box: "left-4 top-4 pl-5 pt-1 sm:left-7 sm:top-6", mark: "left-0 top-0 border-l border-t" },
  // Right-hand corners step in by the scroll container's scrollbar width (--sbw), or the bar covers them.
  tr: { box: "right-[calc(1rem+var(--sbw,0px))] top-4 pr-5 pt-1 text-right sm:right-[calc(1.75rem+var(--sbw,0px))] sm:top-6", mark: "right-0 top-0 border-r border-t" },
  bl: { box: "bottom-6 left-7 pb-1 pl-5", mark: "bottom-0 left-0 border-b border-l" },
  br: { box: "bottom-6 right-[calc(1.75rem+var(--sbw,0px))] pb-1 pr-5 text-right", mark: "bottom-0 right-0 border-b border-r" },
};

function Corner({ pos, className = "", children }: { pos: Pos; className?: string; children: React.ReactNode }) {
  return (
    <div className={`pointer-events-auto absolute ${CORNER[pos].box} ${className}`}>
      <span aria-hidden="true" className={`absolute h-3.5 w-3.5 border-accent ${CORNER[pos].mark}`} />
      {children}
    </div>
  );
}

/* ─── Nav ───────────────────────────────────────────────────── */

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const particlesActive = useModeStore((s) => s.particlesActive);
  // The two home pages swap their sections at runtime, so re-observe when either changes.
  const mode = useModeStore((s) => s.mode);
  const activeSection = useActiveSection(SECTION_IDS, `${particlesActive}-${mode}`);
  const { scrollLocked, containerRef } = useSnapScroll();
  const pathname = usePathname();
  const time = useLocalTime("Asia/Manila");

  // Scroll readout, written straight to the DOM (no re-render per scroll frame).
  const { scrollYProgress } = useScroll({ container: containerRef });
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const pct = Math.round(Math.min(1, Math.max(0, v)) * 100);
    if (pctRef.current) pctRef.current.textContent = String(pct).padStart(3, "0");
    if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`;
  });

  // Width of the scroll container's scrollbar (0 for overlay scrollbars on phones/macOS).
  const [sbw, setSbw] = useState(0);
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const measure = () => setSbw(Math.max(0, c.offsetWidth - c.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    return () => ro.disconnect();
  }, [containerRef]);

  // Hidden while the immersive intro holds the page; always there otherwise.
  const visible = !scrollLocked || menuOpen;

  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const close = useCallback(() => setMenuOpen(false), []);
  const isActive = (href: string) => pathname === "/" && activeSection === (href.split("#")[1] ?? "");

  return (
    <>
      <motion.header
        className="pointer-events-none fixed inset-0 z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ visibility: visible ? "visible" : "hidden", ["--sbw" as string]: `${sbw}px` }}
      >
        {/* ── top-left: name ── */}
        <Corner pos="tl">
          <Link
            href="/"
            onClick={(e) => {
              close();
              // Already home: glide to the top instead of reloading the page.
              if (pathname === "/") {
                e.preventDefault();
                containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            aria-label="Randel Serafica, back to top"
            className={`group block ${mono} text-[11px] uppercase tracking-[0.18em] text-text ${focus}`}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent transition-transform duration-300 group-hover:scale-150" />
              Randel Serafica
            </span>
            <span className="mt-1.5 hidden text-[10px] tracking-[0.16em] text-text-muted sm:block">
              Full-stack dev · Cauayan, PH
            </span>
          </Link>
        </Corner>

        {/* ── top-right: contact (desktop) / menu (phones) ── */}
        <Corner pos="tr">
          <a
            href={CONTACT_LINK.href}
            onClick={close}
            className={`group hidden items-center gap-2 border-b border-accent pb-1 ${mono} text-[11px] uppercase tracking-[0.18em] text-text transition-colors hover:text-white md:inline-flex ${focus}`}
          >
            {CONTACT_LINK.label}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </a>
          <p className={`mt-2 hidden ${mono} text-[10px] uppercase tracking-[0.16em] text-text-muted md:block`}>
            {time ? `${time} PHT` : "PHT"}
            {availability.active && (
              <>
                <span className="mx-1.5">·</span>
                <span className="text-text">open to work</span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            // Same line height as the name so the two top corners line up; the bigger tap area is invisible.
            className={`relative block ${mono} text-[11px] uppercase leading-[17px] tracking-[0.18em] text-text after:absolute after:-inset-3 after:content-[''] md:hidden ${focus}`}
          >
            {menuOpen ? "Close ×" : "Menu"}
          </button>
        </Corner>

        {/* ── bottom-left: section index ── */}
        <Corner pos="bl" className="hidden md:block">
          <nav aria-label="Main navigation">
            <ul className="space-y-[7px]">
              {NAV_LINKS.map((l) => {
                const on = isActive(l.href);
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      aria-current={on ? "location" : undefined}
                      className={`group flex items-center ${mono} text-[10px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                        on ? "text-text" : "text-text-muted hover:text-text"
                      } ${focus}`}
                    >
                      <span className={`mr-2.5 ${on ? "text-accent" : "text-white/30 group-hover:text-white/60"}`}>{l.n}</span>
                      {l.label}
                      <span
                        aria-hidden="true"
                        className={`ml-2.5 h-px bg-accent transition-[width] duration-300 ${on ? "w-6" : "w-0 group-hover:w-3"}`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Corner>

        {/* ── bottom-right: scroll readout ── */}
        <Corner pos="br" className="hidden md:block">
          <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-text-muted`}>
            Scroll <span ref={pctRef} className="text-text">000</span>%
          </p>
          <span aria-hidden="true" className="mt-2 block h-px w-20 bg-white/10">
            <span ref={barRef} className="block h-px w-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
          </span>
        </Corner>
      </motion.header>

      {/* ── Phone menu: the section index, full screen ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="site-menu"
            aria-label="Main navigation"
            className="fixed inset-0 z-[55] flex flex-col bg-[#0b0c0e]/[0.97] px-6 pb-8 pt-24 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="border-t border-white/10">
              {[...NAV_LINKS, { n: "06", ...CONTACT_LINK }].map((l, i) => {
                const on = isActive(l.href);
                return (
                  <motion.li
                    key={l.href}
                    className="border-b border-white/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + i * 0.04, duration: 0.3, ease: "easeOut" }}
                  >
                    <a
                      href={l.href}
                      onClick={close}
                      aria-current={on ? "location" : undefined}
                      className={`flex min-h-[60px] items-baseline gap-4 py-3 ${focus}`}
                    >
                      <span className={`${mono} text-[11px] ${on ? "text-accent" : "text-white/35"}`}>{l.n}</span>
                      <span
                        className={`font-[family-name:var(--font-display)] text-[1.9rem] font-bold leading-none tracking-[-0.02em] ${
                          on ? "text-text" : "text-text/75"
                        }`}
                      >
                        {l.label}
                      </span>
                      {on && <span aria-hidden="true" className="ml-auto self-center h-px w-6 bg-accent" />}
                    </a>
                  </motion.li>
                );
              })}
            </ul>
            <p className={`mt-auto ${mono} text-[11px] text-text-muted`}>
              {time ? `${time} PHT · ` : ""}
              {footerContent.personalityLine}
            </p>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
