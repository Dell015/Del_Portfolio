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
