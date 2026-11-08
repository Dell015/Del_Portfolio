@AGENTS.md

# Del_Portfolio: Randel Serafica's portfolio

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · framer-motion 12 · three / R3F.
Next.js here is NOT the one in your training data. Read `node_modules/next/dist/docs/` before using an API from memory.

## Memory (required)
- At the start of every session, call the memory server's `recall` tool for this project first.
- Before answering any question about the code, call `recall_code`.
- When we make a decision, choose an approach, fix a tricky bug, or learn where something lives, call `store_memory` right away. Don't wait until the end.
- Before finishing a task, save a short note of what changed and why.
- One idea per memory. Don't save what the code already shows. Never store secrets or keys.

## How to work with Randel
- Replies are short, plain and casual. Lead with the outcome. No recaps of steps.
- He often works late and is tired. Don't make him decode long answers.
- Start working in the first reply. Only ask when the answer changes what gets built. When he says "ask me questions", list ALL questions in ONE message.
- Take design initiative. He wants a committed, distinct look, never generic or "AI-looking" (template gradients, pill cards, filler copy).
- Find the root cause, explain it in one or two sentences, then fix it. Don't patch symptoms.
- He sends screenshots. If the screenshot and his words disagree about which element, state your reading in one line, do it, and name the alternative.
- Apply his factual corrections everywhere they appear, not only where he pointed.
- Be honest about what wasn't tested (real phone, real GPU, live email). Never claim "fixed" without checking.

## Learning mode (he is upskilling)
- After a non-trivial fix or feature, add 1–3 lines: the concept behind it and why this approach beat the alternative. Keep it short.
- Prefer the approach he can maintain and understand over a clever one. If you pick a pattern he may not know, name it.
- When there's a real trade-off, give two options with a one-line recommendation instead of silently choosing.

## Verification before "done"
1. `npx tsc --noEmit` and `npx eslint <changed paths>` clean.
2. Look at the result in a browser at desktop and ~390 px phone width. Screenshots, not assumptions.
3. After touching scroll, intro or navigation, re-test first load, reload and back-navigation from a case study.
4. Before pushing, run `npx next build`. A type error that passes in dev still fails on Vercel.
5. Tell him to restart `next dev` and hard-reload when UI changed.

## Commands
- Dev: `npx next dev -p 3100` (restart it if it dies). Build: `npx next build`.
- Don't use `pkill -f` (it kills your own shell). Delete leftover test routes and scratch files you create.

## Architecture map
- Scroll: a custom container (`components/SmoothScroll.tsx`, `div.h-screen`), not window scroll. Use `containerRef.scrollTop` / `scrollIntoView`. It remounts on every navigation, so state that must survive uses `window` flags (`__leftHome`, `__introLoadHandled`). Strict mode runs effects twice. The wheel is eased with a speed cap (`MAX_SCREENS_PER_SEC`); touch uses native momentum.
- One continuous scroll-driven sequence on a shared canvas: hero portrait → About black hole → project solar system (`components/hero/HeroParticleCanvas.tsx`, big, careful edits). The system only forms in the real sequence.
- Solar system: `components/projects/system/SolarSystem.tsx` (planets, sun, `SystemCamera` owns the camera for the whole canvas) + `SystemOverlay.tsx` (text column, orbit rail, part markers). Geometry in `lib/system/layout.ts`, part copy in `lib/content/planets.ts`. Picking is screen-pixel based from window listeners (canvas stays `pointer-events: none`). Keys: ←/→ parts, Shift+←/→ planets; touch: swipe sideways for parts. Selection is kept in sessionStorage `system-selection`. While the system shows (page parked on `#projects-sphere`) wheel, touch-drag and scroll keys are blocked in `HeroParticleCanvas`; the About / Skills buttons glide the page out with their own rAF scroll (native smooth scroll gets cancelled by wheel input) and keep input blocked ~0.8 s after arrival for trackpad momentum. A blocked scroll attempt lights the matching exit (About up / Skills down) with a short hint. Nav links (`navTransit`) are allowed to leave the lock.
- Resume (`components/resume/HandRevealSection.tsx`): one screen tall; the hands + card reveal plays on a timer once half the section is visible (it used to be a 400vh scroll scrub, which went black when the nav jumped there).
- Two home pages: `components/home/HomeView.tsx` picks the full experience or the Quick Look (`components/quicklook/`). The server HTML, reduced motion and anyone who picked "Quick look" get the Quick Look. It is its own page, not the full one with effects off: a live "design file" where a swarm of cursors (Randel / design / copy / code / motion / qa / a11y, all him) builds every element as it scrolls in: frames are dragged out with `Draw` (hides the `data-a` target until its rectangle is drawn), text is typed with `Typed` (pass `who` for a named caret). `quicklook/kit.tsx` is the build kit: `<Build>` gives a scope one 0→1 progress (scroll, or a timer for the hero); `Cursor`, `Typed`, `Select`, `Prop`, `Gap`, `Drop`, `Toggle`/`Appear` read it and write styles straight to the DOM (no re-renders) and point at elements by `data-a`. Final state = server HTML, so no-JS and reduced motion see the finished page. Moment photos come from `lib/content/discoverMomentPhotos.ts`, shared with the full Background.
- Nav: `components/Nav.tsx` is a "viewfinder", no bar: four screen corners with red crop marks (top-left name, top-right contact + PHT time, bottom-left section index, bottom-right scroll %). Phones keep the top two and open a full-screen index from "Menu". Anything pinned near a corner must leave room: the system's About/Skills buttons sit inside them, the About caption is centred. About (`components/about/About.tsx`) is an editorial spread (headline lit word by word, serif line, dot timeline, counting numbers) scrubbed by the pin progress `p`; the plain version passes a fixed 1.
- Switching views: `components/mode/ViewSwitch.tsx`, the big two-card block at the end of both home pages (saves the choice and jumps to the top). The first-visit screen (`ModeGate`) is still the other way in.
- SEO / site basics: `lib/siteUrl.ts` gives the absolute URL (NEXT_PUBLIC_SITE_URL, else Vercel's `VERCEL_PROJECT_PRODUCTION_URL`), used by metadata, sitemap and robots. Each case study sets its own canonical and has its own share image (`app/projects/[slug]/opengraph-image.tsx`). Icons: `app/favicon.ico`, `app/icon.svg`, `app/apple-icon.png` (the 8-bit R). Vercel Web Analytics loads only on Vercel (`process.env.VERCEL`), cookieless. `app/privacy/page.tsx` describes exactly what the contact form, analytics and browser storage keep: update it if any of those change.
- Case studies: `app/projects/[slug]/page.tsx`. Karela has a custom page (`components/projects/karela/`, scoped `.kz` CSS, resets via `:where()`); the other six projects use the plain template.
- Content lives in `lib/content/` (`site.ts`, `projects.ts`, `timeline.ts`, `skills.ts`). Background photos come from `public/moments/<slug>/` at build time (`#` in a filename = front photo; keep original proportions, no cropping).
- Contact: `app/api/contact/route.ts` (per-IP and global rate limits, honeypot, min fill time, Resend via `RESEND_API_KEY`). The form falls back to `mailto:` when the key is missing. The in-memory limiter is per serverless instance; add Cloudflare Turnstile if abused.
- First-visit mode (Clean vs Immersive) is in localStorage `site-mode-v2`. Stale keys can hide a new UI.

## Conventions
- Components in PascalCase files under `components/<area>/`. Section data goes in `lib/content/`, not inline.
- Tailwind utilities first. Scoped CSS only for big custom pages (Karela). Reuse `Reveal`, `SectionHeader`, `SpotlightCard`, `Parallax` from `components/motion/`.
- Anything animated must respect reduced motion and pause off screen. Particle canvases use fewer dots on phones.
- Wrap browser storage reads/writes in try/catch.
- Match the existing visual language (dark, red accent `#D11A2A`, mono eyebrow labels) or commit to a clearly intentional theme for that page.

## Content rules (do not break)
- Never say a project is shipped, live or launched (Karela is in development).
- The ERP internship is under NDA: no detail beyond what's on the resume.
- Don't explain where the name "Karela" comes from. Karela team: "5 members + adviser". Platform wording: "Mobile".
- Never read the Karela repo's `.env`. Never ask for or paste API keys in chat.
- Keep contact links present: GitHub, LinkedIn, Facebook (`facebook.com/randel.serafica.2024`), email.

## Git / deploy
- Don't commit or push unless asked. Deploy is Vercel from `main`; set `NEXT_PUBLIC_SITE_URL` and `RESEND_API_KEY` (Production + Preview) in Vercel env vars.
- A failed Vercel build shows its error at the BOTTOM of the log. A log copied early just stops at `next build`.

## Known open work
- Custom case studies for HIRED.PH (suggested first), Tag.Ai, Icarus, garahe, Seated, Aipon; real screenshots in place of placeholders.
- Karela "What's next" / Phase 2 text may be out of date. Ask him before changing it.
- Phone fling can't be capped. Section snapping on phones is an option, but it changes the feel, so ask first.
- Leftovers to delete: `components/mode/ModeToggle.tsx`, `public/moments/2026-ignite-ogis/`. Update `docs/planning/HANDOFF.md`.