"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useActiveSection } from "@/lib/hooks/useActiveSection";
import { useHideOnScrollDown } from "@/lib/hooks/useScrollDirection";
import { useModeStore } from "@/lib/store/mode";
import { footer as footerContent } from "@/lib/content/site";

/* ─── Nav Links ─────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Background", href: "/#background" },
  { label: "Resume", href: "/#resume" },
] as const;

const CONTACT_LINK = { label: "Contact", href: "/#footer" } as const;

/* ─── Section IDs in page order ─────────────────────────────── */

const SECTION_IDS = ["hero", "about", "projects", "skills", "background", "resume", "footer"] as const;

/* ─── Hamburger Icon ────────────────────────────────────────── */

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
      <motion.span
        className="block h-[1.5px] w-5 rounded-full bg-text"
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      <motion.span
        className="block h-[1.5px] w-5 rounded-full bg-text"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
      <motion.span
        className="block h-[1.5px] w-5 rounded-full bg-text"
        animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── Mobile Menu Panel ─────────────────────────────────────── */

const menuVariants = {
  closed: {
    x: "100%",
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
  open: {
    x: "0%",
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const menuItemVariants = {
  closed: { opacity: 0, x: 20 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.05, duration: 0.3, ease: "easeOut" as const },
  }),
};

/* ─── Nav Component ─────────────────────────────────────────── */

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const particlesActive = useModeStore((s) => s.particlesActive);
  const activeSection = useActiveSection(SECTION_IDS, particlesActive);
  const { scrollLocked, containerRef } = useSnapScroll();
  const hidden = useHideOnScrollDown();
  const pathname = usePathname();

  // Show nav after scroll is unlocked; hide it while scrolling down, reveal on scroll up
  // (never while the mobile menu is open).
  // Thin progress line along the pill's lower edge: how far down the page you are.
  const { scrollYProgress } = useScroll({ container: containerRef });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  const navVisible = !scrollLocked && (!hidden || mobileOpen);
  // Close mobile menu on resize past breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLinkClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const isActive = (href: string) => {
    const sectionId = href.split("#")[1] ?? "";
    return activeSection === sectionId;
  };

  return (
    <>
      {/* ─── Floating glass pill ─── */}
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-4"
        initial={{ y: -80, opacity: 0 }}
        animate={navVisible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="pointer-events-auto relative flex w-full max-w-[min(100%,820px)] items-center justify-between gap-2 overflow-hidden rounded-full border border-white/10 bg-[#0f0f0f]/60 py-1.5 pl-2 pr-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150 md:w-auto md:max-w-none md:justify-center md:gap-1"
        >
          {/* Brand: back to top */}
          <Link
            href="/"
            onClick={(e) => {
              // Already home: glide to the top instead of reloading the page.
              if (pathname === "/") {
                e.preventDefault();
                containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            aria-label="Randel Serafica, back to top"
            className="group flex items-center gap-2 rounded-full py-1.5 pl-3 pr-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-text transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:pr-4"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(209,26,42,0.6)] transition-transform duration-300 group-hover:scale-125"
            />
            Randel
          </Link>

          <span aria-hidden="true" className="mx-1 hidden h-4 w-px bg-white/10 md:block" />

          {/* Page links: a soft highlight slides to the hovered or current one */}
          <nav
            className="hidden items-center md:flex"
            aria-label="Main navigation"
            onMouseLeave={() => setHovered(null)}
          >
            {NAV_LINKS.map((link) => {
              const lit = (hovered ?? NAV_LINKS.find((l) => isActive(l.href))?.href) === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  aria-current={isActive(link.href) ? "location" : undefined}
                  className={`relative rounded-full px-3.5 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    lit || isActive(link.href) ? "text-text" : "text-text-muted"
                  }`}
                >
                  {lit && (
                    <motion.span
                      layoutId="nav-highlight"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.09]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              );
            })}
          </nav>

          <span aria-hidden="true" className="mx-1 hidden h-4 w-px bg-white/10 md:block" />

          {/* Contact: the one call to action */}
          <a
            href={CONTACT_LINK.href}
            className="group/cta hidden items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-text hover:text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
          >
            {CONTACT_LINK.label}
            <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover/cta:translate-x-0.5">
              →
            </span>
          </a>

          {/* Mobile: menu button */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>

          {/* Scroll progress */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-6 bottom-0 h-px origin-left bg-gradient-to-r from-accent/0 via-accent to-accent/0"
            style={{ scaleX: progress }}
          />
        </div>
      </motion.header>

      {/* Mobile Menu Overlay + Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in Panel, glassmorphism */}
            <motion.nav
              id="mobile-menu"
              className="fixed top-0 right-0 z-50 h-full w-[280px] md:hidden flex flex-col pt-24 px-8 pb-8 backdrop-blur-xl"
              style={{
                backgroundColor: "rgba(15, 15, 15, 0.7)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
              }}
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-2">
                {[...NAV_LINKS, CONTACT_LINK].map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    custom={i}
                    variants={menuItemVariants}
                    initial="closed"
                    animate="open"
                    onClick={handleLinkClick}
                    className={`
                      block py-3 px-4 rounded-lg font-[family-name:var(--font-display)] text-lg font-medium
                      transition-colors duration-200
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                      ${
                        isActive(link.href)
                          ? "text-accent bg-white/5"
                          : "text-text-muted hover:text-text hover:bg-white/5"
                      }
                    `}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              {/* Footer line */}
              <div className="mt-auto pt-8 border-t border-white/5">
                <p className="font-[family-name:var(--font-mono)] text-xs text-text-muted">
                  {footerContent.personalityLine}
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
