# Projects review

All seven projects are incomplete and none is deployed. On the site they are described as "in development" / "competition build" and never as shipped or live. Keep it that way; it is the honest framing and it protects you in interviews.

Source material reviewed: `content/projects.md`, the six long briefs in `content/projects/`, `aboutrandel.md`, `experiences.md`, and the rendered case-study pages.

## The honest overall read

**Strengths**
- Real product thinking. Every project starts from a specific user (non-degree Filipino workers, barkadas, vehicle owners, students) and a local constraint (offline-first, GCash/Maya, low-end Android). Most juniors can't show this.
- Range: React Native + Supabase/PostGIS, Next.js, Angular + FastAPI + LangGraph, R3F/Three.js, pgvector, PayMongo, Claude and Gemini APIs.
- Competition record is real and verifiable: PSC 11 Regional Finalist and IgnITE 1st Runner Up (HIRED.PH), a thesis defense, and a team lead role on three of them.
- The Icarus origin story (stopped vibecoding, built a tool to force understanding) is your best narrative. See the strategy doc.

**Weaknesses**
- **Nothing is runnable by a stranger.** No live URL, no public repo, no screenshot on any project. To a reviewer, a 100k-character spec is indistinguishable from a plan. Documents are not proof of work.
- **Breadth over depth.** Seven unfinished projects reads as "starts things." One finished, deployed thing reads as "finishes things." Hiring managers pay for the second.
- **The briefs are specs, not evidence.** They are long, polished and in places generated-sounding. The site cannot tell a reader which parts you personally built and which are planned.
- Several "tech stack" lists are aspirational (planned, not used). A sharp interviewer will ask "show me where you use pgvector." Be ready, or label the stack as planned.

## Per project

| Project | Role | Status on site | Strongest angle | Biggest gap | Verdict |
|---|---|---|---|---|---|
| **Karela** | Lead dev / architect, 5-person thesis | Thesis build, closest to launch | Adaptive "ghost" pacing, PostGIS spatial consensus, offline-first SQLite → Supabase sync, Gemini coach. Technically the deepest. | No demo. Needs a screen recording of one run, a map with a clustered report, and the repo. | **Flagship. Finish and demo this one first.** |
| **HIRED.PH** | Founding CEO / lead dev | Competition prototype, PSC 11 Regional Finalist | The only project with external validation (two competitions). Offline-first, skills-first matching. | No link, no screenshots. The docs disagree on the stack (see below). | **Best credential. Needs a visual.** |
| **Icarus** | Solo architect | MVP stage, aiming at PSC 11 | Socratic multi-agent auditor (LangGraph), batch-audit gate, Haiku/Sonnet cost routing. Strong story and a hot topic (AI + understanding). | "Answer evaluation" is unsolved and is the heart of it. No demo, no eval results. | **Best for AI roles. Build a thin vertical slice and publish eval numbers.** |
| **Seated** | Lead dev, 3-person team | Competition build, IGNITE OGIS 2026 | Clear business model (partner restaurants, OSM Overpass discovery). | Status ("ongoing") and what you built vs teammates are unclear. | Mention only with a clear scope line. |
| **garahe** | Solo | In development | Nice domain (vehicle history, ties to your car interest), Next.js + FastAPI + R3F. | "Architecture designed, development starting" is the weakest status. | Keep, but do not lead with it. |
| **Tag.Ai** | Solo | In development | Fun, culturally specific, Supabase Realtime session design, PayMongo. | Unclear whether anything runs; adult-leaning product (drinking game) may not suit every employer. | Fine as a secondary card. |
| **Aipon** | Solo | In development | Recursive item trees + budget-grounded predictions. **Smallest scope, so most finishable.** | Brief says scaffolded only. | **Best candidate to actually ship in 2-3 weeks.** |

## Inconsistencies to fix in the content

1. **HIRED.PH stack.** The content says Next.js + PostgreSQL, the card says "Web + Mobile." Confirm what it really is (Flutter? PWA?) and make the site say the same thing everywhere.
2. **Year/graduation.** `aboutrandel.md` says 4th year, "expected graduation 2026" and the thesis is "submitted 2026"; the Icarus brief says "3rd-year." It is October 2026 now. State your real graduation date (or "graduating <month year>") on the site; a vague year looks evasive.
3. **Team sizes.** HIRED.PH is 3 (PSC) and 4 (IgnITE). That is correct and fine, but say "3-4" once, clearly, with the explanation.
4. **Thesis status.** "Ongoing defense." Update when it is done; "passed thesis defense" is a strong line.
5. **Seated status.** "Ongoing" with no outcome yet. Update after the competition.
6. **Placeholder text in project pages.** "Screenshots coming soon" and "Architecture details coming soon." should not be visible. Either fill them or hide the section. (Open item A in the QA report.)
7. **Version claims in briefs.** e.g. `expo SDK 51+`, `gemini-1.5-flash`, `Next.js 14+` in garahe vs `Next.js 16` in Aipon. These are old model/version names; the briefs read as dated. Refresh before anyone reads them.

## What each project page should contain (checklist)

Use this on every project. A page that has all seven is better than a page with 5,000 words.

- [ ] One-sentence pitch in plain language (you have this)
- [ ] **Status badge that is honest** (you have this)
- [ ] 2-4 real screenshots or a 20-60 second screen recording
- [ ] "What I built" vs "what the team built," in two lines
- [ ] One hard technical problem and how you solved or are solving it (a paragraph, not a spec)
- [ ] Stack, labelled **used** vs **planned**
- [ ] Repo link (even if work-in-progress) and, if possible, a live demo link
- [ ] What you would do next

## Recommended focus (tiered)

- **Tier 1, finish and deploy:** Karela (thesis demo), plus **Aipon** (smallest, finishable).
- **Tier 2, thin slice:** Icarus (one flow end to end, plus an evaluation write-up), HIRED.PH (screenshots + a hosted demo of the matching flow).
- **Tier 3, keep as-is:** Seated, garahe, Tag.Ai. On the site, they appear after Tier 1/2 and are clearly labelled "concept / early build."

Consider showing **three** projects prominently and tucking the others behind "More." Seven equal cards dilute the best three.

## OJT / ERP work

Under NDA, so it correctly does not appear. In interviews you can describe the *shape* of the work without naming the client or data: your role, the stack, the scale, and what you learned. Before putting it on the resume, check the NDA wording or ask your supervisor what you may say. I still need the company/title/dates from you (see the action plan).
