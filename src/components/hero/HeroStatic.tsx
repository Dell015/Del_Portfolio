"use client";

import Image from "next/image";
import { availability, site } from "@/lib/content/site";
import { Parallax } from "@/components/motion/Parallax";

/**
 * The default hero (and the fallback for immersive mode): who I am, what I do, a
 * face, and clear next steps — readable in a few seconds by anyone, with no
 * WebGL, scroll-jacking or hidden interactions.
 */
export function HeroStatic() {
  // Entrance is pure CSS (`.hero-rise` in globals.css), not a framer-motion `initial`
  // state, so the text paints on the first frame, before any JavaScript has loaded.
  return (
    <section
      id="hero"
      data-snap-section=""
      className="relative flex min-h-screen items-center overflow-hidden px-6 pb-16 pt-28 md:px-16 lg:px-24"
    >
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        {/* Portrait — first on small screens so the person is the first thing seen */}
        {/* No entrance animation here on purpose: this image is the Largest Contentful
            Paint, and fading it in would delay that metric by the animation length. */}
        <div className="relative order-first mx-auto w-full max-w-[420px] lg:order-last lg:max-w-none">
          {/* Soft backlight so the dark jacket separates from the page */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(209,26,42,0.07) 40%, transparent 70%)",
            }}
          />
          <Parallax distance={36}>
            <Image
              src="/images/randel.webp"
              alt="Portrait of Randel Serafica"
              width={2000}
              height={1265}
              priority
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="relative h-auto w-full select-none"
              style={{
                maskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
              }}
              draggable={false}
            />
          </Parallax>
        </div>

        {/* Text */}
        <div className="relative text-center lg:text-left">
          <p
            className="hero-rise font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-text-muted md:text-sm"
            style={{ "--d": "0.15s" } as React.CSSProperties}
          >
            {site.name} · Cauayan, Isabela
          </p>

          <h1
            className="hero-rise mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ "--d": "0.25s" } as React.CSSProperties}
          >
            {site.heroQuestion}
          </h1>

          <p
            className="hero-rise mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-muted lg:mx-0"
            style={{ "--d": "0.35s" } as React.CSSProperties}
          >
            {site.identityStatement}
          </p>

          <div
            className="hero-rise mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            style={{ "--d": "0.45s" } as React.CSSProperties}
          >
            <a
              href="#projects"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-7 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-white transition-colors duration-300 hover:bg-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              See my projects
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#footer"
              className="inline-flex min-h-[48px] items-center rounded-full border border-white/20 px-7 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-text transition-colors duration-300 hover:border-white/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Get in touch
            </a>
          </div>

          {availability.active && (
            <p
            className="hero-rise mt-8 inline-flex items-center gap-2.5 font-[family-name:var(--font-mono)] text-xs text-text-muted"
            style={{ "--d": "0.55s" } as React.CSSProperties}
          >
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#4ADE80]" />
              {availability.label}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
