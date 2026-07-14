# Requirements Document

## Introduction
A personal portfolio website for Randel Serafica (full-stack developer, startup founder) built as a single-page-scroll experience with a global Clean/Immersive mode toggle. Clean mode is a fully complete, accessible, fast fallback; Immersive mode layers WebGL/particle/motion effects on top of the same content.

---

## Requirement 1: Mode toggle system
**User Story:** As a visitor, I want to switch between a calm and a spectacle version of the site, so that I can pick the experience I want without losing any content.

### Acceptance Criteria
1. WHEN a visitor loads the site for the first time THE SYSTEM SHALL default to Clean mode.
2. WHEN a visitor toggles to Immersive mode THE SYSTEM SHALL mount the relevant WebGL/canvas layers and apply the Immersive interaction set.
3. WHEN a visitor toggles back to Clean mode THE SYSTEM SHALL fully unmount all WebGL/canvas components rather than hiding them with CSS.
4. WHEN a visitor's OS has `prefers-reduced-motion` enabled THE SYSTEM SHALL reduce animation durations and disable scatter/parallax/kinetic-type effects even while in Immersive mode.
5. WHEN a visitor returns to the site after choosing a mode THE SYSTEM SHALL persist and restore their last chosen mode via localStorage.
6. WHEN the mode is toggled THE SYSTEM SHALL transition instantly (no full page reload) with a cross-fade (~0.3-0.4s).

---

## Requirement 2: Hero section — particle-portrait reveal
**User Story:** As a visitor, I want an engaging first impression that reveals who Randel is, so that I remember the site and want to keep scrolling.

### Acceptance Criteria
1. WHEN the hero section loads in Immersive mode THE SYSTEM SHALL display a particle cloud (cloudB — abstract/silhouette shape) behind the hero question and a CTA button.
2. WHEN a visitor clicks the hero button THE SYSTEM SHALL morph the particle cloud from cloudB to cloudA (Randel's face) via a per-particle lerp with a click-triggered tween (1-1.5s, eased).
3. WHEN a visitor scrolls down past the hero in Immersive mode THE SYSTEM SHALL morph the particle cloud from cloudA toward cloudC (next-section handoff image), scroll-linked, with parallax on surrounding layers.
4. WHEN a visitor scrolls back up THE SYSTEM SHALL reverse the morph (cloudC → cloudA → cloudB) using the same scroll-progress-driven tween.
5. WHEN the site is in Clean mode OR `prefers-reduced-motion` is set THE SYSTEM SHALL display a static photo with a simple fade-in instead of running the particle system.
6. WHEN the transition is mid-flight THE SYSTEM SHALL apply a curl-noise-driven offset per particle (organic scatter), returning to zero offset at rest states.

---

## Requirement 3: About / Personality section
**User Story:** As a visitor, I want to see who Randel is beyond his resume, so that I can judge whether I'd want to work with him.

### Acceptance Criteria
1. WHEN the About section enters the viewport in Immersive mode THE SYSTEM SHALL reveal Randel's photo center-stage using the particle-portrait system (cloudA), reused from the hero.
2. WHEN the photo resolves THE SYSTEM SHALL scatter the bio text fragments around the photo with staggered fade/drift (0.4s each, ~0.05s stagger), using a per-session consistent seed.
3. WHEN a visitor continues scrolling past the initial reveal THE SYSTEM SHALL fade out the scattered text and reveal two vertical photo strips: Journey (left) and Hobbies (right).
4. WHEN a visitor hovers over either side strip THE SYSTEM SHALL expand/magnify the targeted photo (scale + z-index bump, 0.3s) while siblings compress slightly.
5. WHEN a visitor clicks a photo in either strip THE SYSTEM SHALL open a caption/description overlay.
6. WHEN the site is in Clean mode THE SYSTEM SHALL show a static bio paragraph and a simple photo grid for hobbies/journey, with no scatter, strip, or hover-magnify choreography.

---

## Requirement 4: Projects — bento grid
**User Story:** As a visitor, I want to quickly see Randel's projects and how each looks and works, so that I can evaluate his range and depth.

### Acceptance Criteria
1. WHEN the Projects section renders THE SYSTEM SHALL display each project as a card shaped to its platform: mobile-ratio (tall, ~9:19.5) or desktop-ratio (wide, ~16:10).
2. WHEN a card is at rest THE SYSTEM SHALL show only the device-framed screenshot/preview, without pitch or tech-stack text visible.
3. WHEN a visitor hovers over a card THE SYSTEM SHALL animate the card upward/outward (scale + lift + shadow, 0.4-0.5s) and reveal a detail panel with project name, pitch, tech badges, and links.
4. WHEN a hovered card is mobile-ratio THE SYSTEM SHALL reveal its detail panel beside the device frame rather than overlaying on top.
5. WHEN a visitor clicks a card THE SYSTEM SHALL navigate to that project's case study page (`/projects/[slug]`).
6. WHEN the site is in Immersive mode AND the base interaction is stable THE SYSTEM MAY optionally mount an isolated mini WebGL demo inside the device frame (deferred).
7. IF real screenshots are not yet available THE SYSTEM SHALL render a placeholder gradient (per-project identity color) with the project's wordmark.

---

## Requirement 5: Project case study pages
**User Story:** As a visitor, I want to read the real depth behind a project, so that I can judge engineering and product thinking.

### Acceptance Criteria
1. WHEN a visitor navigates to a project case study THE SYSTEM SHALL render a dedicated route (`/projects/[slug]`).
2. WHEN the case study page renders THE SYSTEM SHALL include: hero shot/demo, problem statement, role + timeline, UI/UX decisions, architecture explanation with one highlighted backend decision, challenge-and-resolution narrative, live + repo links, and next-steps reflection.
3. WHEN the site is in Immersive mode THE SYSTEM SHALL still render case study pages in mostly Clean-mode style (smooth scroll and kinetic headings allowed; heavy WebGL excluded).
4. IF content fields are not yet provided THE SYSTEM SHALL render a clearly marked placeholder rather than fabricated content.

---

## Requirement 6: Skills / tech stack section
**User Story:** As a visitor, I want to scan Randel's technical range quickly.

### Acceptance Criteria
1. WHEN the Skills section renders THE SYSTEM SHALL display each tech icon in grayscale by default with a subtle, staggered idle drift animation.
2. WHEN a visitor hovers or focuses a tech icon THE SYSTEM SHALL transition that icon to full color and scale it up slightly (0.2-0.3s).
3. WHEN a visitor hovers a tech icon THE SYSTEM MAY show a one-line "how I've used this" note if provided in content data.
4. WHEN icons are displayed THE SYSTEM SHALL group them by category (Frontend / Backend / DevOps / Tools) via subtle zone separation.
5. IF the full tech list has not yet been provided THE SYSTEM SHALL scaffold with placeholder icons clearly marked as TODO.

---

## Requirement 7: Resume + contact/footer
**User Story:** As a visitor, I want an easy way to get Randel's resume and contact info.

### Acceptance Criteria
1. WHEN a visitor scrolls to the end of the main content THE SYSTEM SHALL present a distinct "Download Resume" CTA before the footer, not nested inside it.
2. WHEN the footer renders THE SYSTEM SHALL display contact links (email, GitHub, LinkedIn, phone) and a personality-driven closing line.
3. IF the resume file is not yet finalized THE SYSTEM SHALL use a clearly marked placeholder link.

---

## Requirement 8: Cross-cutting motion and accessibility
**User Story:** As any visitor, I want the site to feel intentional and to work regardless of my device or accessibility needs.

### Acceptance Criteria
1. WHEN any UI state changes (page load, mode toggle, section handoff, hover, expand/collapse) THE SYSTEM SHALL animate the transition per the timing table in `design-system.md` — no hard-cuts.
2. WHEN the viewport is mobile-sized THE SYSTEM SHALL adapt bento grid, side-strip, and hero layouts responsively.
3. WHEN keyboard navigation is used THE SYSTEM SHALL provide visible focus states on all interactive elements.
