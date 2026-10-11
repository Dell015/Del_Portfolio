# Dev Portfolio Plan — "Clean + Immersive" System

**Goal:** Personal showcase site. Prove: (1) strong UI/UX taste, (2) real backend/engineering chops, (3) personality, (4) working projects people can actually try.

**Core mechanic:** A mode toggle. Default = **Clean**. Opt-in = **Immersive**. Same content, different intensity of interaction/visual layer. This doubles as a portfolio flex (theming architecture, performance budgeting).

**Standing rule:** every state change in this site (mode toggle, section-to-section handoff, hover states, card expand/collapse, page load) gets a transition — nothing hard-cuts. Treat this as a global constraint, not a per-section reminder.

---

## Content — Finalized Copy (source of truth, replace as you go)

### Identity
- **Name:** Randel Serafica
- **Identity statement (locked draft):** "Full-stack developer and startup founder — I build products, lead the teams behind them, and make sure both scale."
  - *Alt options kept on file:* "I don't just write the code — I build the teams that ship it." / "Developer by trade, founder by instinct, team lead by necessity."

### Hero question (Section A.1)
- **Locked draft:** "Founder. Developer. Team lead. Which one are you about to meet?"
  - *Alt options kept on file:* "Who builds the team, the product, and the code behind both?" / "Behind every scaled product, someone led the team that built it. Meet them."

### About bio (short version, Section B)
> "I'm Randel — an aspiring full-stack developer and startup founder. I've led technical teams to regional competitions, and I build products meant to scale from day one, not bolted on after."

### Scatter fragments (Section B, placeholder — swap freely later)
- "leads before it's asked"
- "ships fast, fixes faster"
- "founder at heart"
- "full-stack, full send"
- "competition-tested"
- "figures it out"
- "still building, always"
- "scales teams and code"

### Journey / Hobbies (Section B side strips)
- **Status:** kept general/placeholder for now — Randel will finalize once real photos are ready.

### Projects (Section C — bento grid, Section D — case studies)

| Project | Platform | One-line pitch | Description | Tech stack (placeholder) |
|---|---|---|---|---|
| **Karela** | Mobile | Turns the movement you already do into fitness progress and real civic impact. | Hybrid fitness + civic intelligence platform combining adaptive running algorithms with crowdsourced urban sensing. Tracks physical activity, adapts via an AI coach named **Ani**, rewards consistency through an RPG progression system, and connects daily effort to real civic impact in the community. | React Native, Node.js, AI Coaching |
| **HIRED.PH** | Web + Mobile | A skills-first job platform that gets people hired without degrees, resumes, or even internet access. | Inclusive, skills-first job platform for skilled non-degree-holding Filipinos (blue-collar workers, undergraduates). Eliminates the need for college degrees, polished resumes, and even internet access as hiring barriers. | Next.js, PostgreSQL, Offline-first |
| **Tag.Ai** | Mobile + Web | A social drinking game that gets people off their phones and into real conversation. | Social drinking game webapp built to bring people into real conversation instead of their phones. Curated card library, wildcard system, coin economy, customizable decks — every session unique. | React, Firebase, Realtime |
| **Icarus** | Web + Mobile | Proves you actually understand the work you submitted — code, thesis, pitch deck, or otherwise. | A Universal Integrity & Logic Auditor. Challenges the user to prove they genuinely understand work they submit — a codebase, thesis, business plan, pitch deck, or any document representing their thinking. | TypeScript, LLM Reasoning, Auth |
| **garahe** | Web + Mobile | Your entire vehicle history — repairs, costs, decisions — in one place, and smarter the longer you use it. | Private, web-based vehicle companion. Vehicle knowledge lives in one place, belongs entirely to the owner, gets smarter with use. Built for people who forget service history, lose receipts, switch mechanics, or can't tell if they can really afford their next vehicle. | Vue, Express, MongoDB |

**Still needed per project (fill in as available):** your specific role + timeline, one interesting backend/architecture decision worth highlighting, a real challenge + how it was solved, live link + repo link, and real screenshots/recordings to replace the placeholder gradient device mockups.

### Skills / Tech Stack (Section E)
- **Status:** not yet provided — need full tech list (languages, frameworks, tools, infra) + 2-3 "how I've used this" notes for strongest skills.

### Contact / Footer (Section F)
- **Status:** not yet provided — need email, GitHub, LinkedIn (or other links), resume file status (ready vs. placeholder), and a personality line for the footer CTA.

---

## 0. Mode System (build this first — everything else plugs into it)

### Toggle placement
A small pill/switch in the top nav, always visible, labeled something like `● Clean / Immersive ○` or an icon toggle (sun/spark, calm/wave — your call on personality). Not buried in a settings drawer — it's a feature, show it.

### State rules
| Rule | Why |
|---|---|
| Default = Clean on first visit | Fast load, accessible, recruiter-safe first impression |
| Persist choice (localStorage on real deployed site) | Respect returning visitor's preference |
| Fully **unmount** the WebGL/canvas layer when switching to Clean, don't just `display: none` | CSS-hiding still burns GPU cycles |
| Honor `prefers-reduced-motion` in both modes | Immersive should still tone itself down, not override OS setting |
| Toggle is instant, no page reload | This itself is a small technical flex |

### What's active in each mode

| Layer | Clean | Immersive |
|---|---|---|
| Scroll | Inertial smooth scroll (Lenis) — **on in both**, it's cheap and feels premium everywhere | Same + scroll-velocity skew on select sections |
| Hero | Static/subtle gradient, maybe a lightweight canvas animation or none | Particle flow field OR 3D swirly ribbon shader (pick one, see below) |
| Cursor | Default | Magnetic hover on buttons/links (subtle, not violent) |
| Headings | Static, clean type | Kinetic variable-weight typography on scroll/hover |
| Projects grid | Static bento grid, hover = simple lift/shadow | Bento grid where each cell mounts its own tiny WebGL/interactive demo on hover |
| Extra flex | — | One easter egg: audio-reactive visualizer, gated behind explicit click (never autoplay audio) |

**Pick ONE hero effect for Immersive**, don't stack multiple cursor-owning effects. My recommendation: **particle flow field** — most impressive-to-effort ratio, and pairs well with a bento dashboard aesthetic later.

---

## 0.5 Design System (typography, color, signature element)

This is the token system every section pulls from — locking it now keeps the site feeling like one cohesive product instead of five separately-styled sections.

### Typography
| Role | Typeface | Used for |
|---|---|---|
| **Display** | Space Grotesk (or similar geometric-but-warm sans) | Section headings, hero question, project names — carries the personality |
| **Body** | Inter | Bio copy, case-study text, descriptions — needs to disappear and just read well |
| **Utility/mono** | JetBrains Mono | Tech badges, eyebrows/labels, tooltips, code-flavored accents — reinforces "developer" without overusing it |

Type scale should be deliberate, not default — e.g. hero question notably larger than section headings, section headings notably larger than body, badges/labels small and letter-spaced. Avoid using more than these three families anywhere in the site.

### Color palette
Base is a dark, near-black neutral (not pure black) so the per-project accent colors (below) can pop without competing with a loud site-wide theme:

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#0E1013` | Page background |
| `--surface` | `#15181C` | Card/section backgrounds |
| `--surface-2` | `#1B1F24` | Nested elements (badges, inputs) |
| `--text` | `#EDEDE9` | Primary text |
| `--text-muted` | `#8B9098` | Secondary text, captions |
| `--accent` | `#F2B84B` | Buttons, links, hover highlights, focus states — the *one* site-wide accent |
| `--border` | `rgba(237,237,233,0.08)` | Hairline dividers, card outlines |

**Per-project identity colors** (used only inside project cards/case studies, not site-wide — this is what gives each project its own visual personality even as placeholder gradients before real screenshots exist):

| Project | Gradient |
|---|---|
| Karela | `#17936F → #C4E86B` (movement/energy) |
| HIRED.PH | `#2B6CB0 → #7FC1F5` (structural, trustworthy) |
| Tag.Ai | `#C93B96 → #FF8FCF` (playful, social) |
| Icarus | `#2E2E2E → #E7E7E7` with `#E6484F` accent (stark, logic-driven) |
| garahe | `#B5651D → #4A4A4A` (mechanical, grounded) |

This keeps the site-wide chrome quiet and disciplined while letting the one place personality-per-project should show (project cards) actually be bold — matches the "spend your boldness in one place" principle rather than making every section loud.

### Signature element
The **particle portrait reveal** (Section A.1) is the one moment this site should be remembered by — it's reused (not just once) across the hero question, face reveal, and section handoff, which is what makes it a signature rather than a one-off trick. Everything else (bento hover-expand, skills grayscale-to-color) should stay comparatively quiet and disciplined so the hero moment keeps its impact.

---

## 0.6 Animation & Transition Spec (consolidated)

Every section above describes its own motion — this table is the single reference so timing/easing stays consistent site-wide instead of every section inventing its own feel.

| Moment | Motion | Approx timing |
|---|---|---|
| Page load | Fade + slight upward drift on hero content | 0.6-0.8s ease-out |
| Mode toggle (Clean ↔ Immersive) | Cross-fade; canvas layers mount/unmount (never just hidden) | 0.3-0.4s |
| Hero: question → face reveal | Camera dolly/zoom + particle morph (click-triggered tween) | 1-1.5s, eased, not linear |
| Hero: scroll down/up | Particle re-morph to next image + parallax layers at differing scroll-speed multipliers | Scroll-linked (tied to scroll progress, not fixed duration) |
| Section-to-section handoff | Outgoing content fades/scatters slightly before incoming content enters — never a hard cut | 0.4-0.6s overlap |
| About: bio scatter-in | Staggered fade + drift per text fragment, seeded consistently per session | 0.4s each, ~0.05s stagger |
| About: side-strip hover | Scale + z-index bump on targeted photo, siblings compress slightly | 0.3s |
| Projects: card hover-expand | Scale + lift (translateY) + shadow growth; detail content fades/slides in with a short delay after the card itself starts moving | Card: 0.4-0.5s / Detail content: 0.3s, ~0.05s delay |
| Skills: grayscale → color | CSS filter transition on hover/focus | 0.2-0.3s |
| Buttons/links (magnetic hover, Immersive) | Subtle attraction toward cursor within a small radius | Continuous, spring-based (not eased fixed-duration) |

**Global rules:**
- Prefer `cubic-bezier` eased curves over linear or default `ease` — motion should feel physical, not mechanical.
- Nothing appears or disappears instantly — even utility elements (tooltips, badges) get at least a short fade.
- Respect `prefers-reduced-motion`: reduce durations and drop scatter/parallax/kinetic-type effects even in Immersive mode when the OS setting requests it — Clean mode already satisfies this by default.

---

## 1. Site Map / Page Flow

```
Landing (Hero)
   ↓
About / Personality
   ↓
Projects (Bento Grid — the core of the site)
   ↓ (click into)
   Project Case Study (per project)
   ↓
Skills / Tech Stack (can also live as a bento sub-section)
   ↓
Resume Download (own small CTA moment)
   ↓
Contact / Footer
```

Single-page scroll with anchored sections is recommended over separate routes for a personal portfolio — smoother narrative, better for the scroll-driven interactions above. Project **case studies** can be separate routes/pages (`/projects/[slug]`) since they need real depth.

---

## 2. Page-by-Page Breakdown

### A. Landing / Hero
**Purpose:** 3-second gut check — "this person has taste and skill."

**Content:**
- Your name, one-line identity statement (not just "Software Developer" — something with personality, e.g. "I build interfaces that feel alive, and the backends that actually make them work.")
- Mode toggle visible in nav
- Scroll-down cue

**Technique:**
- Clean: subtle gradient/mesh background, maybe a lightweight typing or fade-in animation
- Immersive: hero canvas effect (particle field / shader) — see **A.1 below for the confirmed hero concept**

---

### A.1 Confirmed Immersive Hero Concept — "Question + Reveal"

**The beat (what the visitor experiences):**
1. **State 1 — Question screen:** Bot gradient background, slow-moving abstract particle patterns, a distorted/scattered silhouette of a person barely readable in the noise. A question (e.g. *"Who builds the interfaces you don't think about?"*) + a single button (e.g. `Find out →`).
2. **Click the button:** Camera zooms/dollies in on the particle cloud. As it moves, the noise resolves — angle-dependent reveal — and **your actual face** becomes clearly readable from this specific viewing angle.
3. **Scroll down:** Camera/particles rotate to a new angle → face scatters back into abstract noise → resolves into a **second distinct image** (could be a project screenshot silhouette, an abstract brand mark, or a "developer" motif) as it hands off into the next section via parallax.
4. **Scroll back up (outro/reverse):** Same motion in reverse — new image scatters, your face reforms, then scatters back into the original question-screen noise.

**Why this works well:** it turns "who is this person" into an actual interactive reveal instead of just stating it — memorable, on-brand for a dev showing off interaction design, and it reuses one particle system for three moments (question, face reveal, section handoff) instead of building three separate effects.

**How to build it (the "cheat" approach beats a true dual-projection solve — see chat discussion for why):**

1. **Two (or three) source particle shapes, not one dual-purpose cloud:**
   - `cloudA` = particle positions sampled from your face photo (grid-sample pixels → point positions + colors, same technique as any particle-portrait)
   - `cloudB` = particle positions sampled from silhouette/abstract shape for the question-screen state
   - `cloudC` (optional) = a third shape for the scroll-down handoff image
2. **Each particle in each cloud shares the same index/ID** so you can `lerp` between `cloudA[i]` and `cloudB[i]` per-particle — this is what makes the morph look organic instead of like a cut.
3. **State machine, not literal camera angle:**
   - Rather than truly relying on physical camera-angle math (fragile, hard to make readable), drive the transition with **scroll progress or a click-triggered tween value (0→1)** using GSAP or React Spring
   - At `t=0`: render `cloudB` positions (question-screen noise/silhouette)
   - Button click → tween `t` to reveal state → render `cloudA` positions (your face), camera also does a subtle dolly/zoom for drama
   - Scroll down → tween continues → render `cloudC` positions (next-section image), with parallax offset on other layers
   - Scroll up → tween runs backward → back through `cloudA` → `cloudB`
4. **Add curl noise as a "flight path" not the destination** — during the transition (not at rest), give each particle a noise-driven detour so it looks like it's scattering/flowing rather than snapping linearly between two points. At rest (t=0 or t=1), noise offset = 0, so the image reads crisp.
5. **Tech:** Three.js / React Three Fiber `Points` + a custom `ShaderMaterial` (positions/colors as attributes, `t` and noise-seed as uniforms), GSAP or `useScroll` (R3F drei) to drive `t`.
6. **Fallback for Clean mode / reduced-motion:** just show the real photo statically, with a normal fade-in — no particle system runs at all in Clean mode.

**Scope flag:** this is the most ambitious single feature in the plan — budget it real time (likely the single biggest build item), and get the particle-portrait sampling + two-cloud lerp working *before* attempting scroll-linked camera moves or the extra silhouette states.

---

### B. About / Personality
**Purpose:** Humanize you. This is where recruiters decide "would I want to work with this person."

**Confirmed concept — two beats: "Arrival" then "Explore"**

**Beat 1 — Arrival (on section enter)**
- The same silhouette-to-photo particle transition from the hero (reuse `cloudA`/portrait-particle system — don't build a second one) resolves **center stage**, your photo forming in the middle of the viewport as the section scrolls into view.
- Around it, your **short bio + a few fun facts scatter in as floating text fragments** — not a paragraph block, but individual short lines/words positioned asymmetrically around the photo (e.g. "coffee > sleep", "self-taught", "3 yrs shipping", "plays bass badly"). Each fragment fades/drifts in with a slight stagger and different depth (some closer/bigger, some smaller/further — subtle parallax between fragments avoids a flat "wall of text" look).
- Keep fragments genuinely short (2-5 words each) — they're texture and personality, not the actual bio copy. The real bio sentence or two can be one slightly more prominent central fragment near the photo.

**Beat 2 — Explore (on continued scroll)**
- The scattered text fades out, the center photo shrinks/settles, and **two vertical strips of moving photos** appear on the left and right edges of the screen (like film strips, slow auto-scroll/drift vertically when idle).
  - **Right strip = Hobbies.** On hover, the strip shifts toward the cursor/expands, individual photos enlarge under the pointer (classic "magnify on hover" gallery behavior).
  - **Left strip = Journey.** Same interaction, mirrored — photos represent milestones (bootcamp, first job, first shipped project, etc.), in chronological order top to bottom or bottom to top.
- **Click any photo** (either strip) → opens a small caption/description overlay (modal or inline expand) — e.g. clicking a journey photo shows "2022 — landed first junior role", clicking a hobby photo shows "Weekend rock climbing, terrified of heights, doing it anyway."

**Why this works:** it turns a normally static About page into a spatial, exploratory moment — reuses your hero's particle tech (efficient), and the left/right split gives a clean metaphor (journey = where I've been, hobbies = who I am outside code) without needing a menu or tabs.

**Technique notes:**
- Text fragment scatter: simple CSS/Framer Motion stagger + random-ish offsets seeded once per load (so it's not literally random every render — keep it consistent per session for polish)
- Side strips: CSS scroll-snap or a small custom vertical marquee (translateY loop), hover = scale + z-index bump on the targeted image, siblings slightly compress to make room
- Click-to-expand: a lightweight modal/lightbox component, reused for both strips
- Clean mode equivalent: static bio paragraph + a simple photo grid for hobbies/journey (no scatter, no strips, no hover-magnify) — same content, no motion choreography

---

### C. Projects — Bento Grid (the centerpiece)
**Purpose:** Prove you can ship real, working things — front and back end.

**Confirmed concept — device-ratio cards that expand into detail on hover**

- Each grid cell is sized to **either a mobile aspect ratio (tall, ~9:19.5) or a desktop aspect ratio (wide, ~16:10)** — no generic square cards. This immediately communicates "this project is an app" vs "this project is a web product" just from the card shape, and gives the grid natural size variation without arbitrary 1x1/2x2 choices.
- **Resting state:** the card shows just the device frame with a static screenshot or muted looping preview inside it — minimal, clean, quiet grid.
- **On hover:** the card **animates/expands** (scale up + z-index lift, siblings gently make room or dim slightly) and **transforms into a detail card** showing:
  - Project name + one-line pitch
  - Tech stack badges
  - A short 1-2 line "what it does" blurb
  - Links (live site / repo) as small icon buttons
  - *(Flagged for future: expand this hover-card further with a mini live-interaction preview once the base grid is solid — don't build that on day one)*
- **On click:** goes to the full case study page (Section D).

**Mobile vs desktop card behavior nuance:**
- Desktop-ratio cards: hover-expand mostly widens/lifts in place (grid already gives it room)
- Mobile-ratio cards: hover-expand can reveal the detail info **beside** the phone frame (since the frame itself stays narrow) rather than overlaying on top of it — keeps the device shape readable even while expanded

**Technique:**
- Clean: static bento grid, device-shaped thumbnails, hover = lift + shadow + the info-reveal above (this interaction is core content, not just an Immersive flourish, so keep it in Clean mode too — just skip any WebGL per-cell effects)
- Immersive: additionally, cells can mount a tiny isolated WebGL/interactive demo inside the device frame instead of a static screenshot (this is the "Interactive Bento Box Dashboard" idea) — genuine architecture flex, not just visual sugar. Build this **after** the base hover-expand interaction is solid.

**Grid layout:** mix mobile-ratio and desktop-ratio cards side by side for rhythm — e.g. one wide desktop project next to two stacked mobile projects reads well visually and mirrors real device proportions rather than arbitrary bento sizing.

---

### D. Project Case Study (per project, own page)
**Purpose:** This is where "how it looks AND how it works" really lives — go deep here.

**Content:**
1. Hero shot / short demo video or GIF
2. Problem statement — what were you solving?
3. Your role + timeline
4. **UI/UX decisions** — show a couple of before/after or alternative-options screenshots, explain *why* you chose what you chose
5. **Architecture** — a simple diagram (frontend ↔ API ↔ DB ↔ services), explain one interesting backend decision (e.g. caching strategy, auth flow, real-time sockets)
6. Challenges + how you solved them (this is what separates junior from senior-reading portfolios)
7. Live link + GitHub repo
8. What you'd do differently / next steps

**Technique:** Mostly Clean-mode styling even in Immersive — this page is about **reading**, not spectacle. Maybe keep smooth scroll + kinetic headings, drop the heavy stuff.

---

### E. Skills / Tech Stack
**Purpose:** Quick scannable proof of range.

**Confirmed concept — grayscale icon field, reacts on hover**

- All tech-stack icons (React, Node, Postgres, Docker, etc.) rendered **grayscale/desaturated by default**, gently floating/drifting in place (small idle animation — subtle bob or slow drift, not distracting).
- **On hover:** the targeted icon transitions to full color, scales up slightly, and can add a small extra flourish (glow, slight rotation, or a tooltip showing years-used/context) — "gets colored and more" as you put it. Neighboring icons can subtly react too (slight repel/make-room) for a tactile, physical feel, similar in spirit to the magnetic hover used elsewhere.
- Keep icons **grouped by category** (Frontend / Backend / DevOps / Tools) even though visually they float — grouping can be shown via subtle zone separation (soft label per cluster) rather than hard grid lines, so it stays consistent with the floating aesthetic.
- Optional: on hover, show a one-line "how I've used this" note near the icon instead of a bare tooltip — turns a logo wall into something a recruiter can actually read/learn from.

**Technique:**
- Grayscale → color: CSS `filter: grayscale(1)` transitioning to `grayscale(0)` on hover/focus, cheap and works in both modes
- Idle float: simple per-icon randomized `translateY` loop (CSS keyframes or Framer Motion), staggered so icons don't move in sync
- Neighbor-repel-on-hover: a nice-to-have, lower priority than the core grayscale→color reveal — build the base interaction first

---

### F. Contact / Footer

**Resume download:** place a clear **"Download Resume"** button as its own small moment just before the footer — not buried inside the footer itself. Treat it as a mini call-to-action (its own short heading, e.g. "Want the short version?"), since it's genuinely one of the most-clicked elements on a dev portfolio and deserves visibility rather than being one more footer link.

**Footer content:** Email, GitHub, LinkedIn, maybe a "let's build something" line with personality.

**Technique:** Keep simple in both modes — this is a utility section, not a showcase one.

---

## 3. Tech Stack Recommendations

| Layer | Suggestion | Why |
|---|---|---|
| Framework | Next.js (React) | Routing for case-study pages + easy deploy on Vercel |
| Animation/scroll | Framer Motion + Lenis (smooth scroll) | Industry-standard, good docs |
| 3D/Shaders | Three.js / React Three Fiber, or raw WebGL/GLSL for the particle field | R3F if you want it composable with React state (mode toggle) |
| Styling | Tailwind CSS | Fast iteration, pairs well with bento-grid layouts |
| State (mode toggle) | React Context or lightweight store (Zustand) | Simple global toggle, easy to persist |
| Deployment | Vercel | Zero-config for Next.js |

---

## 4. Build Order (realistic solo sequencing)

1. Static Clean-mode site fully built and content-complete (all sections, real project content, case studies written)
2. Mode toggle infrastructure (context/store + mount/unmount logic)
3. Lenis smooth scroll (both modes) — cheap, high impact
4. Bento grid layout for projects (static version first)
5. Immersive hero effect (particle field) — biggest single visual investment, do it once you're confident in the rest
6. Magnetic hover + kinetic typography (Immersive extras)
7. Per-cell mini-interactions in bento grid (Immersive)
8. Optional audio-reactive easter egg — last, purely bonus

**Ship Clean mode as a complete, polished site before touching shaders.** A recruiter who visits while Immersive is half-built should never see broken WebGL — always have Clean be the safe, complete fallback.

---

## Open questions for next pass
- Journey milestones + hobby list (once photos are ready)
- Per-project: role/timeline, one architecture decision, one real challenge, live + repo links
- Full skills/tech stack list + 2-3 "how I've used this" notes
- Contact links (email, GitHub, LinkedIn, etc.), resume file status, footer personality line
- Final pick on identity statement / hero question wording (drafts are locked-in defaults, not final)
