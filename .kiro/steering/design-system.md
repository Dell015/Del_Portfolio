# Design System

The token system every section pulls from. Keeps the site feeling like one cohesive product.

---

## Typography

| Role | Typeface | Used for |
|---|---|---|
| **Display** | Space Grotesk | Section headings, hero question, project names |
| **Body** | Inter | Bio copy, case-study text, descriptions |
| **Utility/mono** | JetBrains Mono | Tech badges, eyebrows/labels, tooltips, code-flavored accents |

Scale: hero question > section headings > body > badges/labels (small, letter-spaced). Max three families site-wide.

---

## Color Palette

Dark, near-black neutral base so accent colors pop without competing:

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#0E1013` | Page background |
| `--surface` | `#15181C` | Card/section backgrounds |
| `--surface-2` | `#1B1F24` | Nested elements (badges, inputs) |
| `--text` | `#EDEDE9` | Primary text |
| `--text-muted` | `#8B9098` | Secondary text, captions |
| `--accent` | `#F2B84B` | Buttons, links, hover highlights, focus states — the one site-wide accent |
| `--border` | `rgba(237,237,233,0.08)` | Hairline dividers, card outlines |

### Per-Project Identity Colors

Used only inside project cards/case studies — gives each project visual personality:

| Project | Gradient | Vibe |
|---|---|---|
| Karela | `#17936F → #C4E86B` | Movement/energy |
| HIRED.PH | `#2B6CB0 → #7FC1F5` | Structural, trustworthy |
| Tag.Ai | `#C93B96 → #FF8FCF` | Playful, social |
| Icarus | `#2E2E2E → #E7E7E7` + `#E6484F` accent | Stark, logic-driven |
| garahe | `#B5651D → #4A4A4A` | Mechanical, grounded |

---

## Mode Layers

| Layer | Clean | Immersive |
|---|---|---|
| Scroll | Lenis inertial smooth scroll (both) | Same + scroll-velocity skew on select sections |
| Hero | Static photo, subtle gradient | Particle flow field (cloudA/B/C morph) |
| Cursor | Default | Magnetic hover on buttons/links (subtle) |
| Headings | Static, clean type | Kinetic variable-weight on scroll/hover |
| Projects grid | Static bento, hover = lift/shadow + detail | Same + per-cell WebGL demo on hover (deferred) |
| About | Static bio + photo grid | Particle portrait + scatter fragments + side strips |
| Skills | Grayscale icons, color on hover | Same + idle drift + neighbor repel |
| Extra | — | Audio-reactive easter egg (explicit click only) |

---

## Animation & Transition Timing

| Moment | Motion | Timing |
|---|---|---|
| Page load | Fade + slight upward drift on hero | 0.6-0.8s ease-out |
| Mode toggle | Cross-fade; canvas mount/unmount | 0.3-0.4s |
| Hero: question → face reveal | Per-character masked reveal + particle morph | 1-1.5s (morph: slow start, fast middle, careful end) |
| Hero: scroll down | Particle dissolve (fast twist) + text sequential exit with flash sweep | Scroll-linked |
| Hero: knockout text | FULLSTACK/DEVELOPER drift up + sequential fade, each element at different speed | Scroll-linked (0–0.62 progress) |
| Section-to-section handoff | Outgoing parallax drift + fade → incoming scroll-triggered entrance | Continuous, no dead space |
| About: panel switch | Horizontal spring slide (drag/swipe OR tab click) | Spring: stiffness 300, damping 30 |
| About: content entrance | Every element scroll-triggered: fade + drift + blur/scale | whileInView, staggered 0.04-0.1s |
| Projects: card hover-expand | Scale + lift + shadow; detail content delayed | Card: 0.4-0.5s / Detail: 0.3s, ~0.05s delay |
| Skills: icon entrance | Scroll-triggered stagger per icon, grayscale → color on hover | 0.2-0.3s |
| Resume/Footer: entrance | Scroll-triggered fade + drift per element | Staggered |
| Navbar | Hide on scroll down, show on scroll up (spring-based slide) | 0.4s ease |
| Magnetic hover (Immersive) | Subtle attraction toward cursor | Continuous, spring-based |

---

## Scroll-Triggered Motion System (applies to ALL sections)

**Core principle: every part of the scroll has something happening. No dead space.**

### Per-Element Scroll Triggers (whileInView)
Every visible element must animate in when it enters the viewport:
- **Headings**: `opacity: 0, x: -50, blur(4px)` → `opacity: 1, x: 0, blur(0)` | 0.7s, ease [0.22, 1, 0.36, 1]
- **Body text**: `opacity: 0, y: 30` → `opacity: 1, y: 0` | 0.5-0.6s, ease [0.4, 0, 0.2, 1]
- **Cards/panels**: `opacity: 0, y: 25, scale: 0.95` → `opacity: 1, y: 0, scale: 1` | 0.5s, staggered 0.08-0.1s
- **Tags/badges**: `opacity: 0, y: 15, scale: 0.9` → `opacity: 1, y: 0, scale: 1` | 0.4s, staggered 0.04-0.05s
- **Labels/mono text**: `opacity: 0, x: -20` → `opacity: 1, x: 0` | 0.5s
- **Decorative elements**: aggressive parallax via `useScroll` + `useTransform`

### Parallax Depth System (useScroll + useTransform)
Each section gets a `useScroll({ target: sectionRef })` and maps elements to different parallax speeds:
- **Decorative circles/blobs**: ±80-120px (very aggressive — creates depth)
- **Section containers/tabs**: ±10-20px (subtle — feels alive without distracting)
- **Reverse parallax** on select elements: moves opposite to scroll for contrast

### Sequential Exit Pattern (hero knockout)
When elements need to leave the screen:
1. All elements drift up together slowly from scroll start (shared `yShared` transform)
2. Individual elements fade out in sequence with clear gaps between each departure
3. Optional flash sweep per element right before it disappears
4. Easing: fast opacity fade (8% scroll range per element)

### Section Transition Feel
- **Entering**: elements cascade in via `whileInView` with staggered delays
- **Present**: subtle parallax drift keeps things alive while user reads
- **Exiting**: parallax naturally carries elements upward/away as next section enters
- Result: the scroll **never feels static** — something is always moving

### Timing Table (entrances)
| Stagger | Use case |
|---|---|
| 0.04-0.05s | Tags, badges, small repeated items |
| 0.08-0.1s | Cards, grid items |
| 0.1-0.15s | Major content blocks (heading → body → supporting) |
| 0.3-0.5s | Sequential exits (each element gets solo departure time) |

### Global Motion Rules
- Prefer `cubic-bezier` eased curves over linear or default `ease`.
- Nothing appears or disappears instantly — even tooltips get a short fade.
- Respect `prefers-reduced-motion`: reduce durations and drop scatter/parallax/kinetic-type effects.
- Clean mode already satisfies reduced-motion by default.
- Every section should feel as alive as the hero — continuous subtle motion throughout.
- Use `viewport: { once: true }` for entrances (don't re-animate on scroll up).

---

## Signature Element

The **particle portrait reveal** is the one moment this site should be remembered by — reused across hero question, face reveal, and section handoff. Everything else stays comparatively quiet so this moment keeps its impact.

---

## Spacing & Layout Conventions
- Single-page scroll with anchored sections (no separate routes except case studies)
- **Full-bleed sections**: every section spans the full viewport width. No visible container boundaries.
- Content text/cards can be max-width constrained for readability, but backgrounds, decorative elements, parallax shapes, and animations extend edge-to-edge
- The viewer should never see or feel where a container "ends" — animations, gradients, and particles bleed to the edges
- Bento grid mixes mobile-ratio (9:19.5) and desktop-ratio (16:10) cards
- Max content width for text: ~1200px centered, but visual elements are unconstrained
- Section padding: generous vertical rhythm (min 80-120px between sections)
- Cards: subtle border (`--border`), rounded corners (8-12px)

### Responsive Design Rules (all sections)
- **Mobile-first**: base styles for 320px+, enhance upward
- **Breakpoints**: 375px, 428px (mobile), 768px (tablet), 1024px (laptop), 1280px, 1440px, 1920px, 2560px (ultrawide)
- **Typography**: use `clamp()` for all display/heading sizes (e.g., `clamp(3rem, 10vw, 8rem)`)
- **Spacing**: prefer `vw`, `vh`, `%`, `clamp()` over fixed `px` for margins/paddings
- **Layouts**: flex/grid with responsive columns (1→2→4 cols), never assume fixed width
- **Touch**: all interactions must work without hover (no hover-only content), drag gestures for panels
- **Aspect ratios**: test 21:9 (ultrawide), 16:9, 4:3, 9:16 (mobile portrait), 19.5:9 (tall mobile)
- **Particle canvas**: camera FOV/position adjusts per aspect ratio to keep portrait centered
- **Animations**: reduce parallax range on mobile (too much movement on small screens is jarring)
- **Landscape mobile**: hero height adapts, knockout text scales down, About panels stack if needed
