"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { contact, footer as footerContent, site } from "@/lib/content/site";
import ScrollFloat from "@/components/ScrollFloat";
import { useSnapScroll } from "@/components/SmoothScroll";

export function Footer() {
  const { containerRef } = useSnapScroll();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <footer
      ref={sectionRef}
      id="footer"
      data-snap-section=""
      className="relative overflow-hidden border-t border-white/5 px-6 py-32 md:py-40"
    >
      {/* Decorative — full bleed */}
      <motion.div
        className="absolute top-[30%] right-[10%] w-32 h-32 rounded-full pointer-events-none"
        style={{
          y: useTransform(scrollYProgress, [0, 1], [50, -30]),
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-4xl relative z-10 flex flex-col items-center gap-10 text-center">
        {/* Personality line — ScrollFloat */}
        <ScrollFloat
          as="p"
          containerClassName="font-[family-name:var(--font-display)] text-3xl font-medium text-text md:text-4xl lg:text-5xl leading-[1.2]"
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.03}
        >
          {footerContent.personalityLine}
        </ScrollFloat>

        {/* Contact links — staggered entrance */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { label: "Email", href: `mailto:${contact.email}` },
            { label: "GitHub", href: contact.github, external: true },
            { label: "LinkedIn", href: contact.linkedin, external: true },
            { label: "Phone", href: `tel:${contact.phone}` },
          ].map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="font-[family-name:var(--font-mono)] text-sm text-text-muted transition-all duration-300 hover:text-accent hover:scale-105"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {link.label}
            </motion.a>
          ))}
        </motion.div>

        {/* Copyright */}
        <motion.p
          className="text-xs text-text-muted/40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          © {new Date().getFullYear()} {site.name}. Built with intention.
        </motion.p>
      </div>
    </footer>
  );
}
