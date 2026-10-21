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
- One continuous scroll-driven sequence on a shared canvas: hero portrait → About black hole → project sphere (`components/hero/HeroParticleCanvas.tsx`, big, careful edits). The sphere only forms in the real sequence.
- Sphere hover is computed in screen pixels from the window pointer (canvas is `pointer-events: none` so the page still scrolls). The card is HTML on top. Touch: tap opens the card, tap outside closes it, `TouchBall` rotates it.
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
- Sphere glow while the cursor is on a card was fixed twice and never verified live. Re-check it.
- Phone fling can't be capped. Section snapping on phones is an option, but it changes the feel, so ask first.
- Leftovers to delete: `components/mode/ModeToggle.tsx`, `public/moments/2026-ignite-ogis/`. Update `docs/planning/HANDOFF.md`.