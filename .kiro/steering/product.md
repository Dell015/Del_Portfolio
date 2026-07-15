# Implementation Plan

Guiding rules:
1. **Motion-first**: Every section must feel alive. No dead space in the scroll — something is always moving.
2. **Scroll-triggered everything**: All elements use `whileInView` entrance + parallax depth via `useScroll`/`useTransform`.
3. **Responsive + adaptive**: Every layout, animation, and interaction must work across all resolutions, aspect ratios (ultrawide, 16:9, 4:3, mobile portrait/landscape), and platforms (desktop, tablet, mobile, touch).
4. Clean mode remains a safe, complete fallback at all times.

---

## Completed

- [x] 1. Project scaffold (Next.js App Router + Tailwind CSS + fonts + tokens)
- [x] 2. Mode toggle infrastructure (ModeProvider + glassmorphism ModeToggle + persistence)
- [x] 3. Hero section
  - [x] Particle morph system (slow start, fast middle, careful end easing)
  - [x] Per-character masked text reveal ("I'm a [Founder/Developer/Team Lead]")
  - [x] Text-behind-image knockout (FULLSTACK left, DEVELOPER right)
  - [x] Scroll-linked sequential exit (flash sweep per word, different speeds)
  - [x] Particle dissolve → ambient drift background (persists through About)
  - [x] Photo fade-in over particles → fade-out on scroll
- [x] 4. Navbar (invisible glassmorphism, "Randel" center, links left, toggle right, hide on scroll down / show on scroll up)
- [x] 5. About section (drag/swipe horizontal panel switch: Development ↔ Beyond the Code, scroll-triggered parallax on all elements)
- [x] 6. Ambient gradient overlay (moving radial gradients accompanying particle background)
- [x] 7. Removed snap scroll — continuous free scroll
- [x] 8. Projects bento grid (basic)
- [x] 9. Skills field (basic)
- [x] 10. Resume CTA + Footer (basic)
- [x] 11. Project case study routes

---

## Remaining Work

- [ ] 12. Apply scroll-triggered motion system to ALL remaining sections
  - [ ] 12.1 Projects/BentoGrid: every card enters with `whileInView` (staggered scale + drift), parallax on decorative elements, hover animations enhanced
  - [ ] 12.2 Skills section: every icon enters with scroll-triggered stagger, parallax on category labels, subtle idle drift in Immersive mode
  - [ ] 12.3 Resume CTA: fade + drift entrance, parallax on decorative elements
  - [ ] 12.4 Footer: staggered entrance per link/element, parallax on personality line
  - [ ] 12.5 Project case study pages: scroll-triggered entrance per content block (hero shot, problem, architecture, etc.)

- [ ] 13. Responsive + multi-platform pass
  - [ ] 13.1 Test and fix all layouts at: 320px, 375px, 428px, 768px, 1024px, 1280px, 1440px, 1920px, 2560px (ultrawide)
  - [ ] 13.2 Ensure particle canvas scales correctly on all viewports (camera FOV / position adjustments)
  - [ ] 13.3 Touch gesture support: swipe panels, tap interactions, no hover-dependent content
  - [ ] 13.4 Landscape mobile: adjust hero heights, knockout text sizing, About panels
  - [ ] 13.5 Tablet: ensure bento grid, about panels, and nav all adapt gracefully
  - [ ] 13.6 Use relative units (vw, vh, clamp, %) over fixed px where possible
  - [ ] 13.7 Test reduced-motion: all parallax/scroll-triggers gracefully degrade

- [ ] 14. Immersive extras
  - [ ] 14.1 Magnetic hover on buttons/links (subtle attraction)
  - [ ] 14.2 Kinetic variable-weight typography on headings
  - [ ] 14.3 Per-cell WebGL demo in project cards (deferred)
  - [ ] 14.4 Audio-reactive easter egg (explicit click, no autoplay)

- [ ] 15. Performance + accessibility
  - [ ] 15.1 Visible focus states on all interactive elements
  - [ ] 15.2 Keyboard navigation through panels, tabs, cards
  - [ ] 15.3 WebGL canvas unmounted in Clean mode (not CSS-hidden)
  - [ ] 15.4 Lazy load images, preload particle source only in Immersive
  - [ ] 15.5 Lighthouse audit: target 90+ on Performance, Accessibility, Best Practices

- [ ] 16. Content pass (ongoing)
  - [ ] 16.1 Replace placeholder project screenshots with real media
  - [ ] 16.2 Fill per-project architecture/challenge content
  - [ ] 16.3 Add Journey/Hobbies photos + captions for Beyond the Code panel
  - [ ] 16.4 Finalize resume PDF

---

## Motion System Quick Reference (for every section)

```tsx
// 1. Section-level scroll tracking
const sectionRef = useRef(null);
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ["start end", "end start"],
});

// 2. Parallax transforms (decorative elements)
const yDecor = useTransform(scrollYProgress, [0, 1], [100, -80]);

// 3. Per-element entrance (whileInView)
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
/>

// 4. Staggered children
transition={{ delay: index * 0.08 }}

// 5. Responsive: use clamp() for sizes, relative units, test all breakpoints
```
