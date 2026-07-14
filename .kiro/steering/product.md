# Implementation Plan

Guiding rule: ship a complete, polished Clean-mode site before touching any shader/particle work. Clean mode must be a safe, complete fallback at all times.

- [ ] 1. Project scaffold
  - [ ] 1.1 Initialize Next.js app (App Router) + Tailwind CSS
  - [ ] 1.2 Add font imports (Space Grotesk, Inter, JetBrains Mono) and `styles/tokens.css` with color variables from `design-system.md`
  - [ ] 1.3 Create `lib/content/site.ts`, `projects.ts`, `skills.ts` populated from `.kiro/steering/content.md` (mark unfilled fields as TODO, not fabricated)

- [ ] 2. Mode toggle infrastructure
  - [ ] 2.1 Build `ModeProvider` (Context + localStorage persistence + `prefers-reduced-motion` detection)
  - [ ] 2.2 Build `ModeToggle` nav pill component
  - [ ] 2.3 Verify: toggling mode does not reload the page and persists across refresh
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

- [ ] 3. Clean-mode static site (content-complete)
  - [ ] 3.1 Hero: `HeroStatic` — name, identity statement, hero question text, static photo/fade-in, scroll cue
  - [ ] 3.2 About: static bio paragraph + simple photo grid placeholders for journey/hobbies
  - [ ] 3.3 Projects: `BentoGrid` + `ProjectCard` static version (device-frame shape by variant, hover = lift/shadow + detail panel reveal — this interaction ships in Clean mode too, not Immersive-only)
  - [ ] 3.4 Project case study route (`/projects/[slug]`) with all 8 content blocks from Requirement 5.2, placeholders where content is missing
  - [ ] 3.5 Skills section: static grayscale-to-color icon field (CSS-only interaction, no idle drift yet)
  - [ ] 3.6 Resume CTA + Footer with contact links
  - _Requirements: 3.6, 4.1-4.5, 4.7, 5.1-5.2, 5.4, 6.1-6.2, 6.4-6.5, 7.1-7.3_

- [ ] 4. Global smooth scroll
  - [ ] 4.1 Integrate Lenis inertial smooth scroll site-wide (both modes)
  - [ ] 4.2 Verify no scroll-jank conflicts with anchored-section navigation

- [ ] 5. Section-to-section transitions
  - [ ] 5.1 Implement fade/scatter handoff between sections per animation spec (0.4-0.6s overlap)
  - [ ] 5.2 Implement page-load fade + drift for hero content
  - _Requirements: 8.1_

- [ ] 6. Particle-portrait system (core Immersive investment — biggest single item, budget real time)
  - [ ] 6.1 Build `sampleImageToPoints` utility, verify equal particle counts across cloudA/B/(C)
  - [ ] 6.2 Build `curlNoise` in-flight offset function (zero at rest, peaks mid-transition)
  - [ ] 6.3 Build `HeroParticleCanvas` (R3F Points + ShaderMaterial), wire click-triggered B→A tween
  - [ ] 6.4 Wire scroll-linked A→C tween + parallax on surrounding layers, and reverse on scroll-up
  - [ ] 6.5 Add automatic fallback to `HeroStatic` if source images fail to load
  - [ ] 6.6 Swap `Hero` to mount `HeroParticleCanvas` only when `mode === 'immersive' && !reducedMotion`
  - _Requirements: 2.1-2.6_

- [ ] 7. Reuse particle system in About
  - [ ] 7.1 Build `PortraitReveal` reusing the hero particle component (cloudA) — do not duplicate the shader/canvas logic
  - [ ] 7.2 Build `ScatterFragments` (staggered fade/drift, per-session-seeded, not re-randomized per render)
  - [ ] 7.3 Build `SideStrip` (idle vertical drift, hover-expand toward cursor, siblings compress) — instance twice for Journey/Hobbies
  - [ ] 7.4 Build `PhotoLightbox` for click-to-expand captions
  - [ ] 7.5 Wire About's two-beat sequence: photo+scatter reveal on section enter → strips on continued scroll
  - _Requirements: 3.1-3.5_

- [ ] 8. Immersive extras — magnetic hover + kinetic typography
  - [ ] 8.1 Magnetic hover on buttons/links (subtle attraction within small radius)
  - [ ] 8.2 Kinetic variable-weight typography on section headings (scroll/hover driven)

- [ ] 9. Skills field polish (Immersive)
  - [ ] 9.1 Add staggered idle drift animation per icon
  - [ ] 9.2 Add optional "how I've used this" note on hover, sourced from `lib/content/skills.ts`
  - _Requirements: 6.1, 6.3_

- [ ] 10. Bento grid Immersive upgrade (defer until base grid is stable)
  - [ ] 10.1 Design isolated mini-interactive/WebGL component contract per device frame
  - [ ] 10.2 Mount per-cell demo only in Immersive mode, one project at a time, verifying performance before adding the next
  - _Requirements: 4.6_

- [ ] 11. Optional easter egg
  - [ ] 11.1 Audio-reactive visualizer, gated behind explicit click, no autoplay audio

- [ ] 12. Accessibility and responsiveness pass
  - [ ] 12.1 Verify visible focus states on all interactive elements (toggle, cards, icons, links)
  - [ ] 12.2 Verify responsive collapse of bento grid, side strips, and hero at mobile widths
  - [ ] 12.3 Manually toggle OS `prefers-reduced-motion` and confirm Immersive degrades correctly across hero, about, and projects
  - _Requirements: 1.4, 8.2, 8.3_

- [ ] 13. Content pass (ongoing, not blocking build)
  - [ ] 13.1 Replace placeholder project screenshots with real media as available
  - [ ] 13.2 Fill in per-project architecture/challenge content as Randel provides it
  - [ ] 13.3 Fill in Journey/Hobbies photos + captions once available
