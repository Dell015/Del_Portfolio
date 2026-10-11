# Animation References

Collected references for text reveal animations and motion design used in this portfolio.

---

## Text Reveal Techniques

### Masked Line Reveal (clip-path / overflow-hidden)
- Characters start translated below their container's clip boundary
- Stagger per character (30-60ms) creates a wave effect
- Used by top agencies (Awwwards SOTD winners)
- Reference: https://codepen.io/designcourse/embed/RwyMePX (GSAP + Split Type)
- Reference: https://codepen.io/mamdouh_mohammed/embed/JjzJNRr (GSAP Text Reveal)
- Reference: https://www.awwwards.com/inspiration/text-reveal-animation-on-scroll-elixir-studio

### Character-by-Character Reveal
- Each letter animates independently (opacity, translateY, blur)
- Scramble effect: random chars resolve into final letter
- Reference: https://www.framer.com/marketplace/components/split-text-animation/ (Clip Reveal per char)
- Reference: https://codepen.io/GreenSock/embed/bGEqbaQ (SplitText per character)

### Blur-to-Sharp Reveal
- Text starts blurred and fades to sharp per word/character
- Premium feel, used on luxury brand sites
- Reference: https://www.framer.com/marketplace/components/textgenerate/ (word-by-word blur)
- Reference: https://www.framer.com/marketplace/components/unblur-text-reveal (scroll-triggered)

### Wipe / Shutter Reveal
- Colored slices sweep across characters
- Cinematic, dramatic timing
- Reference: https://www.framer.com/marketplace/components/textreveal-x/ (shutter reveal)
- Reference: https://www.framer.com/marketplace/components/wipe-text-reveal/ (line-by-line wipe)

### Gravity / Physics-Based
- Blocks fall away to reveal text beneath
- Spring-physics choreography
- Reference: https://www.framer.com/marketplace/components/gravity-text-reveal/
- Reference: https://www.framer.com/marketplace/components/split-reveal-text/

---

## Portfolio Hero Animation Patterns

### Staggered Dramatic Headline
- First word enters → pause → second word enters
- Creates reading rhythm, forces the viewer to absorb each word
- Large type + controlled timing = cinematic presence
- Reference: https://www.awwwards.com/inspiration/hero-interaction-diana-toloza-portfolio-2024
- Reference: https://www.awwwards.com/sites/aw-portfolio

### Text Behind Image (Knockout)
- Large headline behind a portrait/photo
- Stroke-only text visible where image overlaps
- Creates depth and editorial magazine feel
- Common on designer/developer portfolios

---

## Implementation Notes

### Technique Used in This Project
- **Masked character reveal**: overflow-hidden container + translateY per character
- **Staggered timing**: FULLSTACK chars enter first (40ms stagger), then 0.4s pause, then DEVELOPER chars enter
- **Easing**: cubic-bezier(0.22, 1, 0.36, 1) — fast start, soft landing
- **Bio text**: simple fade + drift with delay after headlines complete

### Framer Motion Approach
```tsx
// Per-character animation with overflow clip
<span style={{ overflow: 'hidden', display: 'inline-block' }}>
  <motion.span
    style={{ display: 'inline-block' }}
    initial={{ y: '100%' }}
    animate={{ y: '0%' }}
    transition={{ duration: 0.5, delay: charIndex * 0.04, ease: [0.22, 1, 0.36, 1] }}
  >
    {char}
  </motion.span>
</span>
```


---

## Scroll-Linked Particle & Parallax References

### Particle Dissolve → Ambient Background
- Particles morphing on scroll with custom shader: https://discourse.threejs.org/t/colorverse-website-particles-morphing-on-scroll-with-custom-shader/43847
- Three ways to create 3D particle effects (space dust, sparks): https://varun.ca/three-js-particles/
- Interactive Particles with Three.js (Codrops): https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
- Crafting Scroll Based Animations in Three.js (Codrops): https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/
- Three.js animate on scroll (sbcode): https://sbcode.net/threejs/animate-on-scroll/
- Scroll-Reactive 3D Gallery (Codrops): https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/

### Framer Motion Parallax
- Framer Motion scroll-linked animations: https://www.framer.com/motion/scroll-animations/
- useScroll + useTransform for parallax: different speeds per layer
- Parallax depth: background 40-80% speed, foreground 120-140% speed
- Reference: https://www.framer.com/academy/lessons/framer-animations-scroll-speed-parallax

### Implementation Pattern Used
```tsx
// Mixed parallax — different speeds create depth perception
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const yAggressive = useTransform(scrollYProgress, [0, 1], [100, -80]);  // moves fast
const ySubtle = useTransform(scrollYProgress, [0, 1], [40, -20]);       // barely moves
const yReverse = useTransform(scrollYProgress, [0, 1], [-50, 80]);      // moves opposite
```

### Particle State Machine (scroll-linked)
```
scrollProgress 0.00 - 0.05  → Portrait intact (no dissolve)
scrollProgress 0.05 - 0.40  → Fast twist/scatter (portrait shatters)
scrollProgress 0.40 - 1.80  → Ambient drift (beautiful flowing background)
scrollProgress 1.80 - 2.20  → Fade out (approaching next section)
scrollProgress 2.20+        → Fully hidden
```


---

## Sequential Exit Timing (Cinematic Stagger)

### Key Principles (from GSAP patterns reference)
- Entrance stagger: 0.1–0.2s between items (fast, energetic)
- Exit stagger: 0.3–0.5s gaps between items (cinematic, lets viewer absorb each departure)
- Easing: power3.out for entrances (strong deceleration), power2.out for scroll reveals
- Never stagger > 0.2s on entrance (feels broken), but exits CAN be slower
- Reference: https://github.com/alirezarezvani/claude-skills/blob/main/marketing/landing/skills/landing/references/gsap_animation_patterns.md

### Scroll-Linked Exit Sequence Pattern
```
Element 1: scroll 0.02 → 0.18 (leaves immediately)
  [gap: 0.10 scroll units]
Element 2: scroll 0.12 → 0.28
  [gap: 0.10 scroll units]
Element 3: scroll 0.22 → 0.42
  [gap: 0.12 scroll units]
Element 4: scroll 0.34 → 0.55 (lingers longest)
```
Each element gets ~0.1 scroll units of "alone time" where it's the only thing leaving — the viewer sees each departure individually.

### Additional References
- Scroll exit effects for hero sections: https://docs.automaticcss.com/effects/exit-effects
- Scroll-driven CSS hero animations: https://www.builder.io/blog/scroll-driven-animations
- Cinematic scroll experiences: https://motion.dev/examples/react-scroll-zoom-hero
