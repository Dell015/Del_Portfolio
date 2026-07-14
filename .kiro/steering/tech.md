# Technical Design Document

## Overview
A Next.js (App Router) single-page-scroll portfolio with anchored sections, a global Clean/Immersive mode context, and separate case-study routes per project. Immersive-only visuals are implemented as isolated, independently mountable components so Clean mode never pays their cost.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Routing for case-study pages + easy deploy on Vercel |
| Animation/scroll | Framer Motion + Lenis | Industry-standard, good docs |
| 3D/Shaders | Three.js / React Three Fiber | Composable with React state (mode toggle) |
| Styling | Tailwind CSS | Fast iteration, pairs well with bento-grid layouts |
| State (mode toggle) | Zustand | Simple global toggle, easy to persist |
| Deployment | Vercel | Zero-config for Next.js |

## Architecture

```
app/
  layout.tsx                # wraps app in ModeProvider, loads fonts (Space Grotesk, Inter, JetBrains Mono)
  page.tsx                  # main scroll page: Hero, About, Projects, Skills, ResumeCTA, Footer
  projects/[slug]/page.tsx  # case study route, reads from lib/content/projects.ts

components/
  mode/
    ModeProvider.tsx         # React Context + localStorage persistence + prefers-reduced-motion read
    ModeToggle.tsx           # nav pill switch
  hero/
    Hero.tsx                 # question + button, mounts HeroParticleCanvas only in Immersive
    HeroStatic.tsx           # Clean-mode fallback: static photo + fade-in
    HeroParticleCanvas.tsx   # R3F canvas: cloudA/B/C, scroll+click driven tween
  about/
    About.tsx                # orchestrates Beat 1 (scatter) -> Beat 2 (strips)
    PortraitReveal.tsx       # reuses hero particle system (cloudA) — shared component, not duplicated
    ScatterFragments.tsx
    SideStrip.tsx            # generic; instanced twice (Journey / Hobbies)
    PhotoLightbox.tsx
  projects/
    BentoGrid.tsx
    ProjectCard.tsx          # variant: 'mobile' | 'desktop', handles hover-expand + detail reveal
    DeviceFrame.tsx          # renders screenshot/placeholder gradient inside device chrome
  skills/
    SkillsField.tsx
    SkillIcon.tsx            # grayscale <-> color transition, idle drift
  resume/
    ResumeCTA.tsx
  footer/
    Footer.tsx

lib/
  content/
    site.ts                  # identity statement, hero question, bio, scatter fragments
    projects.ts              # project data table (from content.md)
    skills.ts                # tech list with categories + usage notes
  particles/
    sampleImageToPoints.ts   # grid-samples an image -> {x,y,z,color}[] point cloud
    curlNoise.ts             # noise field used for in-flight scatter offset
  hooks/
    useScrollProgress.ts
    usePrefersReducedMotion.ts

styles/
  tokens.css                 # CSS variables from design-system.md
```

## Key Components & Interfaces

### ModeProvider
```ts
type Mode = 'clean' | 'immersive';
interface ModeContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
  reducedMotion: boolean; // derived from matchMedia, read-only
}
```
- Persists `mode` to `localStorage('site-mode')`.
- Reads `prefers-reduced-motion` via `matchMedia` and exposes it.
- Consumers combine `mode === 'immersive' && !reducedMotion` to decide whether to run heavy effects.

### HeroParticleCanvas (reused by PortraitReveal in About)
```ts
interface ParticlePortraitProps {
  cloudA: PointCloud;   // face
  cloudB: PointCloud;   // question-screen silhouette/abstract
  cloudC?: PointCloud;  // handoff image (hero only)
  driveMode: 'click-then-scroll' | 'scroll-only';
  onRevealComplete?: () => void;
}
interface PointCloud {
  positions: Float32Array; // xyz per particle
  colors: Float32Array;    // rgb per particle
}
```
- All clouds must have the **same particle count and shared index mapping** so `lerp(cloudX[i], cloudY[i], t)` is valid per-particle.
- `t` (0→1) driven by: click tween (GSAP) for initial B→A reveal, then scroll progress for A→C and reverse.
- At rest (`t` exactly 0 or 1), curl-noise offset = 0 so the image reads crisp.
- During transition, offset scales with a bell curve peaking mid-transition.
- Rendered via R3F `<Points>` + custom `ShaderMaterial`.

### sampleImageToPoints
- Input: image, grid interval (px).
- Output: `PointCloud` — one particle per sampled pixel, position from pixel coords, color from pixel RGB.
- Face and silhouette clouds sampled at same grid interval to keep particle counts equal.

### ProjectCard
```ts
interface ProjectCardProps {
  project: Project;
  variant: 'mobile' | 'desktop';
}
```
- Resting: `DeviceFrame` only.
- Hover: scale/lift via `:hover` transform, detail panel via opacity/transform transition with short delay.
- `variant === 'mobile'`: detail panel beside the frame, not overlaying.
- Click → Next.js `<Link>` to `/projects/[slug]`.

### SideStrip (About)
```ts
interface SideStripProps {
  side: 'left' | 'right';
  items: { image: string; caption: string }[];
}
```
- Idle: CSS `translateY` loop (marquee-style), paused/slowed on hover.
- Hover item: scale + z-index bump, siblings compress.
- Click: opens `PhotoLightbox`.

### SkillIcon
```ts
interface SkillIconProps {
  name: string;
  icon: string; // image src or component
  usageNote?: string;
  category: 'frontend' | 'backend' | 'devops' | 'tools';
}
```
- `filter: grayscale(1)` at rest → `grayscale(0) + scale(1.08)` on hover/focus via CSS transition.

## Data Models

```ts
// lib/content/projects.ts
interface Project {
  slug: string;
  name: string;
  platform: 'mobile' | 'web' | 'web+mobile';
  cardVariant: 'mobile' | 'desktop';
  pitch: string;
  description: string;
  role: string;
  teamSize: string;
  techStack: string[];
  identityGradient: [string, string];
  accentColor?: string;
  liveUrl?: string;
  repoUrl?: string;
  screenshot?: string;
  caseStudy?: {
    timeline?: string;
    architectureNote?: string;
    challenge?: string;
    nextSteps?: string;
  };
}
```

## Error Handling
- Missing `screenshot`: `DeviceFrame` falls back to per-project gradient + wordmark placeholder.
- Missing `liveUrl`/`repoUrl`: render as disabled/greyed with "coming soon" state.
- Particle system image load failure: fall back to `HeroStatic` automatically.
- `prefers-reduced-motion`: checked on mount and on `matchMedia` change events.

## Performance Rules
- WebGL/canvas layers fully **unmounted** (not CSS-hidden) when switching to Clean mode.
- Particle system is the only Three.js canvas on the page at any time — no stacking.
- Lenis smooth scroll runs in both modes (cheap, high impact).
- Images lazy-loaded; particle source images preloaded only when Immersive is active.
