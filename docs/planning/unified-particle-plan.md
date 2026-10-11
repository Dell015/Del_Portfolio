# Unified Particle System — Remaining Implementation

> What's left to build on top of the current stable codebase (commit `5d82115`).

---

## What's Already Done

The current `HeroParticleCanvas.tsx` already implements:

- **Single unified canvas** — `fixed inset-0 z-[1]`, persists across Hero → About → Projects
- **80K particle shader** with all major phase uniforms: `uProgress`, `uDissolve`, `uAmbient`, `uGather`, `uCondense`, `uExplode`, `uScatter`, `uSphere`
- **Phase behaviors in vertex shader** — idle flow, curl turbulence, cursor vortex, gather (ease-in pull), condense (vortex), explode (elastic burst), scatter, sphere formation (smoothstep lerp to fibonacci)
- **Color shift** during sphere phases (portrait colors → pink/magenta)
- **ProjectNodes** — dynamic count from `projects` array, fibonacci positions, auto-rotate, opacity fade-in at `sphereProgress > 0.7`
- **Camera zoom-out** tied to sphere progress
- **Mouse tracking** + world-space projection for cursor effects
- **Morph easing** — custom 3-segment curve (slow start, fast middle, careful end)
- **TweenDriver** — click-triggered 4.5s morph animation
- **Scroll-linked phase mapping** — all phases driven by `scrollProgress` from `SmoothScroll`
- **ProjectSphereSection** — 300vh scroll spacer with SphereHUD overlay, section heading, project label links
- **SphereHUD** — debug-style coordinate/phase readout overlay

---

## What's Missing (implement in this order)

### 1. Reload / Scroll Restoration Bug Fix

**Problem:** On reload, browser may restore scroll position mid-page, causing particles to render in an intermediate state instead of starting from the beginning.

**Files:** `SmoothScroll.tsx`, `HeroParticleCanvas.tsx`

**Implementation:**
- `SmoothScroll` on mount: set `history.scrollRestoration = 'manual'`, force `scrollTop = 0`, reset external store values
- `HeroParticleCanvas` on mount: force all phase refs to 0 regardless of initial scrollProgress; only begin phase derivation after portrait reveal completes (`progressRef.current >= 0.95`)

---

### 2. Scroll-Lock + Virtual Scroll Accumulator

**Problem:** Currently, sphere phases are mapped to raw `scrollProgress` (page scroll position). This means you can't get fine-grained scrubbing or reversibility — you scroll the whole page and phases fly by too fast. The user should be "trapped" in the animation zone with precise control.

**New file:** `src/lib/hooks/useVirtualScroll.ts`  
**Modified:** `SmoothScroll.tsx` (add `lockScroll()`), `HeroParticleCanvas.tsx` (consume virtual values instead of raw SP for GATHER→SMALL_FADE)

**Phase budgets (px of virtual scroll):**
| Phase | Budget | Easing |
|-------|--------|--------|
| GATHER | 300px | ease-in |
| CONDENSE | 400px | ease-in-out |
| RING_COMPRESS | starts 150px into CONDENSE, spans remaining 250px | linear within window |
| EXPLODE | 250px | elastic-out |
| SMALL_FADE | 200px | linear |
| **Total locked** | **1150px** | |

**Behavior:**
- Trigger lock when `scrollProgress >= 1.8` (entering projects zone)
- Intercept `wheel`/`touchmove`, accumulate delta into virtual position
- Map virtual position → phase progress values (fully reversible on scroll-up)
- If accumulator hits 0 scrolling up → unlock, user scrolls back to About
- When SMALL_FADE completes (accumulator = 1150) → unlock, normal scroll resumes into SPHERE_FORM

---

### 3. RING_COMPRESS Phase (shader addition)

**Problem:** Missing the secondary "suck pulse" — a ring of particles that compresses inward slightly after the vortex starts condensing.

**File:** `HeroParticleCanvas.tsx` (vertex shader + new uniform `uRingCompress`)

**Shader logic:** Affects a band of particles (speed 0.3–0.8), creates torus shape that compresses inward. Starts 150px into CONDENSE budget, finishes at CONDENSE end.

---

### 4. SMALL_PARTICLES_FADE + Big Particles

**Problem:** After EXPLODE, the 80K small particles should fade to invisible while 800 large, glowing particles appear as a separate system. Currently the same 80K particles just scatter and form the sphere.

**New file:** `src/components/hero/BigParticles.tsx`  
**Modified:** `HeroParticleCanvas.tsx` (add `uSmallFade` uniform to existing shader, mount BigParticles in same canvas)

**BigParticles:**
- 800 `InstancedMesh` spheres
- Pink/violet/red palette, additive blending
- Random scattered positions (initial) → fibonacci sphere (driven by `sphereFormRef`)
- Appear as small particles fade out (alpha crossfade)
- Bloom post-processing via `@react-three/postprocessing` (EffectComposer + Bloom) — already in `package.json`

---

### 5. Sphere Interactivity (OrbitControls + Hover + Cards + Tint)

**Problem:** The sphere currently auto-rotates but can't be interacted with. Need orbit drag, node hover detection, floating HTML cards, and sphere color tinting.

**New file:** `src/components/projects/sphere/ProjectNodeCard.tsx`  
**Modified:** `HeroParticleCanvas.tsx` (enable pointer events conditionally, add OrbitControls, add raycaster-based hover)

**When `sphereFormProgress >= 1.0`:**
- Enable `pointer-events: auto` on canvas container
- Mount `OrbitControls` (zoom disabled, pan disabled, damping enabled)
- Auto-rotate pauses on drag/hover
- Node `onPointerOver`/`onPointerOut` → scale up hovered ring, dim others
- Project world position → screen coords via `vector.project(camera)` → CSS left/top for HTML card
- **ProjectNodeCard**: glassmorphism card (gradient swatch, name, pitch, "View Project" link)
- **Sphere tint**: BigParticles material lerps from white → hovered project's `identityGradient[0]` color (~0.3s), back to white on hover-out

---

### 6. Mobile / Performance

**Files:** `HeroParticleCanvas.tsx`, `BigParticles.tsx`

- Detect mobile via viewport width (`< 768px`)
- Desktop: 80K small / 800 big | Mobile: 30K small / 400 big
- DPR: `[1, 2]` desktop → `[1, 1.5]` mobile
- Bloom: disable on mobile
- Touch scroll-lock: use touch delta with 2x multiplier; don't `preventDefault` on horizontal swipe (About panel tabs still need to work)
- `prefers-reduced-motion`: skip all particle phases — existing `HeroStatic` fallback path already handles this

---

## File Map

| File | Action |
|------|--------|
| `src/components/SmoothScroll.tsx` | Add scroll restoration fix + `lockScroll()` method |
| `src/lib/hooks/useVirtualScroll.ts` | **Create** — virtual scroll accumulator hook |
| `src/components/hero/HeroParticleCanvas.tsx` | Add: virtual scroll integration, `uRingCompress` uniform, `uSmallFade` uniform, BigParticles mount, OrbitControls, node hover logic, pointer-events toggle, mobile detection |
| `src/components/hero/BigParticles.tsx` | **Create** — 800 instanced mesh particles |
| `src/components/projects/sphere/ProjectNodeCard.tsx` | **Create** — HTML hover card overlay |
| `src/components/projects/sphere/ProjectSphereSection.tsx` | Remove `bg-black` if present; adjust height for new scroll-lock budget |
| `src/components/projects/sphere/SphereHUD.tsx` | Wire up real phase names from virtual scroll state |

---

## Execution Order

| Step | Est. Time |
|------|-----------|
| 1. Reload fix | 15 min |
| 2. Scroll-lock + virtual scroll | 1.5 hrs |
| 3. RING_COMPRESS shader | 30 min |
| 4. Small fade + Big particles + Bloom | 1 hr |
| 5. Sphere interactivity (orbit, hover, cards, tint) | 1.5 hrs |
| 6. Mobile / performance | 45 min |
