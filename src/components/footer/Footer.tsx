"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail, FiPhone } from "react-icons/fi";
import {
  availability,
  builtWith,
  contact,
  contactForm,
  footer as footerContent,
  footerNav,
  site,
} from "@/lib/content/site";
import ScrollFloat from "@/components/ScrollFloat";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useModeStore } from "@/lib/store/mode";
import { ContactForm } from "./ContactForm";

const SOCIALS = [
  {
    label: "Email",
    value: contact.email,
    href: `mailto:${contact.email}`,
    Icon: FiMail,
    external: false,
  },
  {
    label: "GitHub",
    value: "@Dell015",
    href: contact.github,
    Icon: FiGithub,
    external: true,
  },
  {
    label: "LinkedIn",
    value: "randel-serafica",
    href: contact.linkedin,
    Icon: FiLinkedin,
    external: true,
  },
  {
    label: "Phone",
    value: contact.phone,
    href: `tel:${contact.phone.replace(/\s/g, "")}`,
    Icon: FiPhone,
    external: false,
  },
] as const;

export interface FooterProps {
  /**
   * Whether `/api/contact` can deliver mail. Resolved on the server (see
   * `page.tsx`) so the form degrades to a `mailto:` link instead of failing
   * on submit.
   */
  contactEnabled?: boolean;
}

export function Footer({ contactEnabled = false }: FooterProps) {
  const { containerRef } = useSnapScroll();
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const yDecor = useTransform(scrollYProgress, [0, 1], [50, -30]);

  return (
    <footer
      ref={sectionRef}
      id="footer"
      data-snap-section=""
      className="relative overflow-hidden px-6 pt-24 pb-16 md:pt-32 md:pb-20"
    >
      {/* Gradient divider — marks the footer as a landing, not a continuation of
          the atmospheric section above it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(209,26,42,0.35) 50%, transparent 100%)",
        }}
      />

      {/* Decorative parallax bloom — full bleed */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-[20%] right-[8%] h-40 w-40 rounded-full"
        style={{
          y: yDecor,
          background:
            "radial-gradient(circle, rgba(209, 26, 42, 0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14 md:gap-16">
        {/* ══ ROW 1 — Identity + contact form (left) / socials (right) ══ */}
        <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          {/* Left column */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <motion.p
              className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {contactForm.eyebrow}
            </motion.p>

            <ScrollFloat
              containerClassName="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text md:text-5xl lg:text-6xl"
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
            >
              {site.name}
            </ScrollFloat>

            <motion.p
              className="mt-3 font-[family-name:var(--font-serif)] text-lg italic text-text-muted md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {footerContent.personalityLine}
            </motion.p>

            <motion.p
              className="mt-6 mb-6 max-w-md text-sm leading-relaxed text-text-muted/70"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {contactForm.blurb}
            </motion.p>

            <div className="w-full max-w-md">
              <ContactForm enabled={contactEnabled} />
            </div>
          </div>

          {/* Right column — socials. Vertical stack rather than a horizontal row:
              four icon+value pairs would wrap badly in a narrow column. */}
          <div className="flex flex-col items-center md:items-start">
            <motion.p
              className="mb-5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-text-muted"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Elsewhere
            </motion.p>

            <ul className="flex w-full max-w-xs flex-col gap-1">
              {SOCIALS.map(({ label, value, href, Icon, external }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="group flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-300 hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-text-muted transition-colors duration-300 group-hover:text-accent"
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-text-muted/50">
                        {label}
                      </span>
                      <span className="truncate text-sm text-text-muted transition-colors duration-300 group-hover:text-text">
                        {value}
                      </span>
                    </span>
                    <FiArrowUpRight
                      className="ml-auto h-3.5 w-3.5 shrink-0 text-text-muted/0 transition-all duration-300 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <Divider />

        {/* ══ ROW 2 — Quick nav (left) / availability (right) ══ */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between md:gap-6">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
              {footerNav.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <a
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center font-[family-name:var(--font-mono)] text-sm text-text-muted transition-colors duration-300 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="inline-flex min-h-[36px] items-center gap-2.5 rounded-full border border-border bg-surface/50 px-4 py-2 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              {/* Radar ping. Dropped entirely under reduced-motion — a looping
                  animation is exactly what that preference is asking to avoid. */}
              {availability.active && !reducedMotion && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-[#4ADE80]"
                  animate={{ scale: [1, 2.4, 2.4], opacity: [0.6, 0, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    times: [0, 0.7, 1],
                  }}
                />
              )}
              <span
                className={`relative h-2 w-2 rounded-full ${
                  availability.active ? "bg-[#4ADE80]" : "bg-text-muted/50"
                }`}
              />
            </span>
            <span className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-text-muted">
              {availability.label}
            </span>
          </motion.div>
        </div>

        {/* ══ ROW 3 — Built with (left) / copyright (right) ══ */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between md:gap-6">
          <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-text-muted/40">
              Built with
            </span>
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {builtWith.map((tech, i) => (
                <motion.li
                  key={tech}
                  className="rounded-full border border-border bg-surface-2/40 px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] tracking-wide text-text-muted/70"
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {tech}
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.p
            className="text-xs text-text-muted/40"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            © {new Date().getFullYear()} {site.name}. Built with intention.
          </motion.p>
        </div>
      </div>
    </footer>
  );
}

/** Hairline rule that fades at both ends so it never reads as a container edge. */
function Divider() {
  return (
    <div
      aria-hidden="true"
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(245,245,245,0.08) 20%, rgba(245,245,245,0.08) 80%, transparent 100%)",
      }}
    />
  );
}
