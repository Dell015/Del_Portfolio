# QA report, randel portfolio

Scope: the whole site (home, all sections, `/projects/[slug]`, 404), Clean and Immersive modes, desktop and mobile, keyboard, performance, accessibility, security, SEO.
Tools: Lighthouse, axe-core, Playwright (Chromium), manual keyboard pass, `npm run lint`, `npm audit`, production build.

**Limit of this QA:** my sandbox has no real GPU (software WebGL). Immersive mode logic and visuals were checked, but real-world frame rate was **not** measurable. Test Immersive on your own machine and on a mid-range phone.

## Scores

| | Before | After |
|---|---|---|
| Lighthouse desktop performance | 92 | 99 |
| Lighthouse mobile performance | 47 | ~70 (sandbox-throttled; LCP dominated by simulated slow CPU) |
| axe-core serious/critical violations (home, Clean mode) | fixed during the session | 0 |
| Console errors across full flow | n/a | 0 |
| Broken anchors / internal links | n/a | 0 |

## Fixed

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | Critical | Next.js had a critical RCE advisory (`npm audit`: 1 critical, 7 high) | Bumped to `next@^16.4.0` and `eslint-config-next@^16.4.0`; build verified |
| 2 | High | Hero text invisible until JS hydrated (framer `initial: opacity 0`) | Entrance is now CSS (`.hero-rise`), text paints on first frame |
| 3 | High | Mobile LCP/TBT: 3D canvases loaded eagerly | `HeroParticleCanvas` and `HandParticleCanvas` loaded with `next/dynamic`, `ssr:false` |
| 4 | High | Nav links dead on `/projects/[slug]` (`#projects` resolved to the wrong page) | Hrefs are `/#section`; active state parses the hash |
| 5 | High | Scroll was free before clicking "Find out" in Immersive | Scroll locked until the sequence is started; also relocked when switching Clean→Immersive |
| 6 | High | Mouse wheel felt "clicky" in the sphere sequence | Wheel input eased toward a target (exponential), touchpads pass through |
| 7 | High | Going back from the sphere to the top snapped / reopened a stale project card every frame | Reverse sequence is animated; hover cleared when not interactive |
| 8 | Medium | Section headings never revealed (IntersectionObserver on a clipped, translated node) | `useInView` on the mask wrapper |
| 9 | Medium | Nav wheel overlapped the brand on mobile; dark text on red buttons | NavWheel removed (as you asked); button contrast fixed |
| 10 | Medium | Duplicate `<title>` on every project page | Title is the project name |
| 11 | Medium | No `<main>` landmark on project pages | `<main id="main" tabIndex={-1}>` |
| 12 | Medium | Default 404 | Custom `not-found.tsx` |
| 13 | Low | No security headers | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`; `poweredByHeader: false` |
| 14 | Low | No canonical URL | `alternates.canonical` in `layout.tsx` |
| 15 | Low | Missing sitemap / robots / OG image | Added `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` |
| 16 | Low | Fonts loaded from a CDN | Self-hosted via `next/font/local` |

## Still open (ordered by what I would do first)

| # | Severity | Issue | Why / what to do |
|---|---|---|---|
| A | **High (content)** | Project pages say "Screenshots coming soon" and "Architecture details coming soon." | A recruiter who clicks a project lands on a placeholder. Add real screenshots, or hide the empty sections until you have them. Details in [PROJECTS-REVIEW.md](PROJECTS-REVIEW.md) |
| B | **High (content)** | No project has a live URL or repo URL | The single biggest hireability gap. See [HIREABILITY-STRATEGY.md](HIREABILITY-STRATEGY.md) |
| C | Medium | Footer shows **two "Copy email" controls** (the contact form's fallback renders another) | Keep one |
| D | Medium | The hide-on-scroll nav stays focusable while hidden (keyboard users tab into an invisible bar) | Add `inert` / `tabIndex={-1}` / `visibility:hidden` while hidden |
| E | Low | Footer nav lacks Background and Contact, and uses bare `#` hrefs | Use `/#section` like the main nav |
| F | Low | 7 lint warnings: `LogoLoop` effect deps and `<img>`, a few unused variables | Cosmetic; clean up when convenient |
| G | Low | `npm audit` still lists ~5 highs, all in dev tooling (not shipped to visitors) | Do **not** run `npm audit fix --force`; update when upstream releases land |
| H | Low | Mobile LCP in Lighthouse is ~70 | Mostly simulated-CPU; real phones will do better, but measure with PageSpeed Insights after you deploy |
| I | Info | Immersive mode GPU smoothness unverified | Test on real hardware; keep Clean as the default |

## Things I checked that are fine

- Keyboard: skip link works, tab order follows visual order, focus rings visible, mobile menu opens/closes with Esc.
- Reduced motion: respected by the dot field, hand-reveal section and logo loop.
- Clean mode needs no WebGL at all, so recruiters on locked-down laptops see the full content.
- Contact: mailto/copy fallback works without a backend.
- No layout shift on the hero; portrait has explicit dimensions and `priority`.

## Things you need to do on your side after pulling these changes

1. `npm install` (picks up `next@16.4`).
2. Delete the obsolete files I removed in my copy: `src\components\navigation\` (whole folder), `src\components\skills\LineWaves.tsx`, `src\components\skills\LineWaves.css`.
3. Delete unused assets: `public\images\randel.png`, `public\creation-of-adam.jpg`, and the default Next.js `.svg` files in `public\`.
4. Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://yourname.dev`) in your host's environment so canonical/OG/sitemap point to the real domain.
5. Replace the default `README.md` (it is still the create-next-app one).
