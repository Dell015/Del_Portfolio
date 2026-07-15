"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OptionWheel from "./OptionWheel";
import { useSnapScroll } from "@/components/SmoothScroll";

/* ─── Section configuration ─────────────────────────────────── */

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "resume", label: "Resume" },
  { id: "footer", label: "Contact" },
] as const;

const SECTION_LABELS = SECTIONS.map((s) => s.label);

/* ─── NavWheel: appears on left-edge hover ──────────────────── */

export function NavWheel() {
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentPage, scrollToSection, scrollLocked } = useSnapScroll();

  const show = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    // Small delay so the wheel doesn't vanish instantly on slight mouse jitter
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 300);
  }, []);

  const handleChange = useCallback(
    (index: number) => {
      const section = SECTIONS[index];
      if (section) {
        scrollToSection(section.id);
      }
    },
    [scrollToSection]
  );

  // Don't render when scroll is locked (hero hasn't been revealed yet)
  if (scrollLocked) return null;

  return (
    <>
      {/* Invisible trigger zone: thin strip along the left edge */}
      <div
        className="fixed left-0 top-0 z-[60] h-full w-[24px]"
        onMouseEnter={show}
        onMouseLeave={hide}
        aria-hidden="true"
      />

      {/* The wheel itself */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed left-0 top-0 z-[59] h-full w-[380px] pointer-events-auto"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            {/* Subtle backdrop gradient so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E1013]/90 via-[#0E1013]/40 to-transparent pointer-events-none" />

            {/* Wheel container */}
            <div className="relative h-full w-full">
              <OptionWheel
                items={SECTION_LABELS}
                defaultSelected={currentPage}
                onChange={handleChange}
                textColor="#8b9098"
                activeColor="#edede9"
                side="left"
                fontSize={2.2}
                spacing={2.8}
                curve={1}
                tilt={8}
                blur={2}
                fade={0.25}
                smoothing={200}
                inset={40}
                loop={false}
                draggable
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
