"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "@/components/mode/ModeToggle";
import { site } from "@/lib/content/site";
import { useSnapScroll } from "@/components/SmoothScroll";

/* ─── Nav Links ─────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#footer" },
] as const;

/* ─── Section IDs in page order ─────────────────────────────── */

const SECTION_IDS = ["hero", "about", "projects", "skills", "resume", "footer"];

/* ─── Custom Hook: useActiveSection via snap scroll context ── */

function useActiveSection(): string {
  const { currentPage } = useSnapScroll();
  // Map page index to section ID
  return SECTION_IDS[currentPage] ?? "hero";
}

/* ─── Hamburger Icon ────────────────────────────────────────── */

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
      <motion.span
        className="block h-[2px] w-5 rounded-full bg-text"
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      <motion.span
        className="block h-[2px] w-5 rounded-full bg-text"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
      <motion.span
        className="block h-[2px] w-5 rounded-full bg-text"
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
  const activeSection = useActiveSection();
  const { scrollLocked } = useSnapScroll();

  // Hide nav entirely when scroll is locked (hero page before reveal)
  const navVisible = !scrollLocked;

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
    const sectionId = href.replace("#", "");
    return activeSection === sectionId;
  };

  return (
    <>
      <motion.header
        className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(14, 16, 19, 0.8)",
          borderBottom: "1px solid var(--border)",
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={navVisible ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo / Name */}
        <a
          href="#hero"
          className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-text transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:rounded-sm"
        >
          {site.name}
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`
                relative font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest
                transition-colors duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:rounded-sm
                ${isActive(link.href) ? "text-accent" : "text-text-muted hover:text-text"}
              `}
            >
              {link.label}
              {/* Active indicator underline */}
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-active-underline"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Right side: ModeToggle + Hamburger */}
        <div className="flex items-center gap-3">
          <ModeToggle />

          {/* Hamburger button — visible below md */}
          <button
            className="relative flex md:hidden items-center justify-center w-9 h-9 rounded-md transition-colors duration-200 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay + Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in Panel */}
            <motion.nav
              id="mobile-menu"
              className="fixed top-0 right-0 z-50 h-full w-[280px] md:hidden flex flex-col pt-24 px-8 pb-8"
              style={{
                backgroundColor: "var(--surface)",
                borderLeft: "1px solid var(--border)",
              }}
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link, i) => (
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
                          ? "text-accent bg-surface-2"
                          : "text-text-muted hover:text-text hover:bg-surface-2"
                      }
                    `}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              {/* Footer personality line in mobile menu */}
              <div className="mt-auto pt-8 border-t border-border">
                <p className="font-[family-name:var(--font-mono)] text-xs text-text-muted">
                  Let&apos;s build something that actually ships.
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
