# Randel Serafica — Portfolio

Personal portfolio for Randel Serafica: full-stack developer, startup founder, CS student in Cauayan, Isabela, PH.

Built with **Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, framer-motion**, and **three.js / React Three Fiber** for the optional Immersive mode.

## Run it

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
```

```bash
npm run build && npm start   # production build
npm run lint
```

## Two modes

- **Clean** (default): fast, readable, no WebGL. This is what recruiters see.
- **Immersive** (toggle in the nav): the particle hero, project sphere and hand-reveal resume section. Needs a reasonably capable GPU.

## Where to edit content

| What | File |
|---|---|
| Name, bio, links, availability, contact | `src/lib/content/site.ts` |
| Projects (cards and case-study pages) | `src/lib/content/projects.ts` |
| Skills | `src/lib/content/skills.ts` |
| Portrait | `public/images/randel.webp` |

## Environment variables

See `.env.example`. The site builds and runs without any of them.

- `NEXT_PUBLIC_SITE_URL` — your deployed URL (sitemap, canonical, Open Graph)
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — enables the live contact form; without a key the footer shows a `mailto:` fallback

## Structure

```
src/
  app/            routes: home, /projects/[slug], 404, sitemap, robots, OG image, /api/contact
  components/     UI by section: hero, about, projects, resume, skills, footer, background
    motion/       shared animation primitives (Reveal, Parallax, SpotlightCard, ...)
    effects/      DotField, DarkVeil
    mode/         Clean/Immersive provider and toggle
  lib/
    content/      all site copy and project data
    hooks/        scroll, visibility, device capability, virtual scroll
    particles/    point sampling and curl-noise helpers
    store/        zustand stores (mode, sphere hover)
public/           images used by the site
content/          source briefs for each project (reference only, not imported by code)
docs/
  review/         QA report, projects review, hireability strategy, action plan
  planning/       archived early planning notes
.kiro/steering/   Kiro steering files
```

## Deploy

Deploy to Vercel. Set `NEXT_PUBLIC_SITE_URL` (and the Resend variables if you want the contact form) in the project's environment settings.
