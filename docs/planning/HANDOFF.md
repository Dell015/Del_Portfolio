# Handoff for the next Claude chat (written 2026-10-13, Manila time)

Read this first. Then read `docs/planning/about-hero-redesign-decisions.md` and `docs/planning/about-transitions-decisions.md`.

## Who and what
- Randel Serafica, CS student, Cauayan, Isabela (BS CS, USLT, 2027). Portfolio: Next.js 16, React 19, TypeScript, Tailwind v4, framer-motion, three / react-three-fiber / postprocessing, zustand.
- Local project: `C:\Users\Randel\CODE SHI\VSCODE IDE\Del_Portfolio`. Reference folder: `C:\Users\Randel\karela` (his Karela project, used as experience evidence).
- All 7 projects (Karela, HIRED.PH, Tag.Ai, Icarus, garahe, Seated, Aipon) are unfinished and not deployed. Never say shipped or live. The OJT enterprise ERP work is under NDA: no company or confidential detail.
- His standing preference: when he says "ask me questions", list ALL the questions needed in one message so nothing is guessed. Keep replies short and plain. He is often tired and works late.

## What was built this session (all committed to the device)
Pinned About scene, entered from the hero:
1. Hero dust spirals into a black hole as About rises (no sliding black screen).
2. Pinned section (PIN_PAGES 2.4): glass terminal window types out scroll-linked (whoami, about.md, how-i-work.md, history, numbers, then the prompt "want to see the source?"). The projects list is hidden in the pinned view.
3. Ending: window slides off left, camera centers the hole, hole compresses to a point, then the old sphere explosion fires from that point and plays by itself (sequence starts at the EXPLODE phase; gather and condense are skipped because the hole stands in for them), then the projects sphere. Enter or tap on the prompt scrolls to the collapse and the burst triggers by itself.
4. Clean mode still shows the static terminal About (no particles). Clean/Immersive toggle will later be replaced by a first-visit choice ("want to take a quick look?" vs "want to have some fun?"): saved in the redesign doc, DO NOT build until asked. Remind him of it if he says he does not know what to do.
5. Other done items: hover freezes project nodes; smooth wheel scroll; hero side panels with contact/GitHub/LinkedIn and "skip to contact"; copy edits (5 people on his biggest team, "3 layers I own", "how-i-work" line); no `randel@cauayan` label.

## Key files (under src/)
- `components/about/About.tsx`: StaticAbout, PinnedAbout, typed blocks (BLOCKS, BlockView, PinnedBlock, PinnedPrompt), scroll measure and thresholds (remapPin, ss ramps), ignite/reset calls.
- `components/blackhole/BlackHoleScene.tsx`, `layouts.ts`: hole shaders, Rig camera (center pan), collapse; portrait only on the dev lab page (`portrait` prop).
- `lib/swirl.ts`: hero dust to hole swirl (uniforms, swirlState, bloomValue for the burst from a point).
- `lib/hooks/useVirtualScroll.ts`: sphere sequence; `igniteSequence`, `resetSequence`, `setSequencePinned`, `HOLE_START_PX`.
- `components/hero/HeroParticleCanvas.tsx` (main particles: swirl and `uBloom`), `BackdropParticles.tsx`, `components/SmoothScroll.tsx` (virtual pages, `registerScrollPin`).
- `lib/content/site.ts`: stats, facts, contact, projects text.

## Known open items
- Real-GPU performance unmeasured (hero canvas plus black hole canvas = two WebGL contexts; the test sandbox uses software rendering, very slow, so animation timing could only be checked frame by frame).
- After the burst there is a hold of about 0.8 scroll pages before the projects labels; he has not commented on how it feels.
- Possible gap: a moment of empty screen right when the hole vanishes (no spark added).
- Mobile: layout checked by screenshot only.
- QA backlog: placeholders on project pages, duplicate "Copy email", hidden nav focusable, footer links incomplete.
- User-side: delete obsolete files, `npm install`, set NEXT_PUBLIC_SITE_URL.

## NEXT TASK: rebuild his resume
Goal: a one-page, plain, ATS-safe text PDF (no columns, icons, photo, tables), built only from facts he confirms; unfinished projects described as built / in development. Intended to pass bots and reach a human.
- The original resume (`Randel_Serafica.pdf`) is NOT available in the container any more. Ask him to re-attach it, or look in his connected folders on the device (`device_list_dir` on the Del_Portfolio and karela folders, or ask for the path). Earlier critique (from the previous chat) said: 3 on the old resume vs 3-5 on the portfolio for team size; needs targeted roles and measurable, honest bullets.
- Make it with the PDF skill or the Docs type (resume = a document; he wants a PDF he can send). Check the Artifact/docs tools available; deliver via SendUserFile (and write to his folder if linked).
- Ask these questions in ONE list (he was already sent this list; he has not answered yet):
  1. Roles targeted (internship, junior full-stack, frontend...) and location (PH, remote, abroad).
  2. ERP internship: company name or safe description, exact title, dates, term/hours.
  3. What he personally did there (safe terms, stack, tools, team size).
  4. Dates and organizers for PSC 11 regional finalist and IgnITE 1st runner-up.
  5. Is 5 the true largest team he led (old resume said 3)?
  6. What he built on HIRED.PH and in which stack (Flutter vs Next.js vs PWA?).
  7. Which 2-3 projects to list (suggest Karela, HIRED.PH, Seated); for each: problem, his part, tech.
  8. Karela: team size, role, demo link / APK / video.
  9. Graduation date, thesis title, GPA/honors.
  10. Skills to list as strong / leave off; AI-assisted workflow line (Supabase/Figma MCP)?
  11. Phone number on resume or not (portfolio has +63 956 762 0063); references line; summary line or not.
- Contact data (already public on the portfolio): email randelserafica1505@gmail.com, GitHub https://github.com/Dell015, LinkedIn https://www.linkedin.com/in/randel-serafica/.
- Then also clean `content/` briefs of em dashes if still present, and optionally add the AI-workflow skills group.

## Environment tips
- Container working copy is `/home/claude/site` (may be gone in a new chat: the device folder is the source of truth; stage files with `device_stage_files`, edit, then `device_commit_files`).
- Device write-back is flaky: after every commit, restage and `cmp` against the container copy; if different, commit again until identical. Byte counts equal to the old file mean it did not land.
- Build and test: `npx tsc --noEmit`, `npx eslint src`, `npx next build`, then `nohup npx next start -p 3100` (run the build and the server in SEPARATE shell calls; chaining them or `pkill -f` on the command line kills the shell, exit 144). Playwright is at `/opt/npm-tools/node_modules/playwright`; use `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. The hero reveal takes about 40 s in software rendering after clicking "Find out" before scroll behaviors are live.
- After code changes tell him: save open tabs, restart the dev server, hard-reload (Ctrl+Shift+R).
