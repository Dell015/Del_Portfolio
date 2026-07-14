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
| Hero: question → face reveal | Camera dolly + particle morph (click-triggered) | 1-1.5s, eased |
| Hero: scroll down/up | Particle re-morph + parallax layers | Scroll-linked |
| Section-to-section handoff | Outgoing fades/scatters → incoming enters | 0.4-0.6s overlap |
| About: bio scatter-in | Staggered fade + drift per fragment | 0.4s each, ~0.05s stagger |
| About: side-strip hover | Scale + z-index bump, siblings compress | 0.3s |
| Projects: card hover-expand | Scale + lift + shadow; detail content delayed | Card: 0.4-0.5s / Detail: 0.3s, ~0.05s delay |
| Skills: grayscale → color | CSS filter transition on hover/focus | 0.2-0.3s |
| Magnetic hover (Immersive) | Subtle attraction toward cursor | Continuous, spring-based |

### Global Motion Rules
- Prefer `cubic-bezier` eased curves over linear or default `ease`.
- Nothing appears or disappears instantly — even tooltips get a short fade.
- Respect `prefers-reduced-motion`: reduce durations and drop scatter/parallax/kinetic-type effects.
- Clean mode already satisfies reduced-motion by default.

---

## Signature Element

The **particle portrait reveal** is the one moment this site should be remembered by — reused across hero question, face reveal, and section handoff. Everything else stays comparatively quiet so this moment keeps its impact.

---

## Spacing & Layout Conventions
- Single-page scroll with anchored sections (no separate routes except case studies)
- Bento grid mixes mobile-ratio (9:19.5) and desktop-ratio (16:10) cards
- Max content width: ~1200px, with full-bleed backgrounds
- Section padding: generous vertical rhythm (min 80-120px between sections)
- Cards: subtle border (`--border`), rounded corners (8-12px)
