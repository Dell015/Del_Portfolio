# Hireability and standing out in 2026

My honest opinion, then what to do about it.

## What I think

You are a stronger candidate than your public footprint shows. Competition results, team lead roles, a thesis, a real OJT, and architecture thinking beyond your year are all real. Right now a recruiter cannot see most of it, and cannot verify any of it in 30 seconds.

The market you are entering is not forgiving to juniors. Entry-level hiring has tightened and employers are leaning on proof of work over credentials ([Frontend Mentor](https://frontendmentor.io/articles/how-to-get-programming-job-2026), [Simeon on Security](https://simeononsecurity.com/software-development-career-playbook/getting-started-in-software-development/building-a-developer-portfolio/), [Entry-level jobs in 2026](https://simeononsecurity.com/software-development-career-playbook/getting-a-job-as-a-developer/entry-level-software-developer-jobs/)). "Proof of work" means something a stranger can open, use, and read the code of. Several write-ups also stress that AI is absorbing a share of routine entry-level work ([Junior Developer Survival Guide](https://thoughtgears.substack.com/p/the-junior-developer-survival-guide)), so the tutorial-style project is worth less than it used to be ([3 Portfolio Projects That Actually Impress](https://arslandg.substack.com/p/3-portfolio-projects-that-actually)).

**The gap, in one line:** you have seven spec documents and zero things a stranger can click. Closing that is worth more than any amount of site polish.

### Scorecard (my judgment)

| Area | Now | Why |
|---|---|---|
| Portfolio site | Strong | Fast, accessible, clear, readable by non-technical people |
| Product thinking | Strong | Specific users, local context |
| Leadership / initiative | Strong | Founder roles, competitions, 3-5 person teams |
| Verifiable shipped work | **Weak** | No live URLs, no public repos, no demos |
| Code visibility | **Weak** | GitHub is not yet a showcase (check profile README, pinned repos, commit history) |
| Resume | **Weak** | Outdated and includes references' emails; ERP work not described |
| Network / outreach | Unknown | Not evidenced; usually the highest-leverage lever |
| Depth in one area | Medium | Broad stack, not yet "the person who knows X" |

## The AI question (be upfront about it)

You build with AI help, and your own story is about moving from vibecoding to understanding. Do not hide this; turn it into a strength.

- Write a short, honest **"How I use AI"** note (site or GitHub profile): what you let it do, what you always do yourself (design, review, tests, debugging), and one example where it was wrong and you caught it.
- Be able to **explain any line** in your repos. Interviewers in 2026 routinely ask "walk me through this" precisely to separate understanding from generation. Icarus is literally your answer to that; use it.
- Add **tests** to the flagship project. Tests are the cheapest visible signal that you understand the behaviour, not just the code.

## What to do, in priority order

### 1. Make something a stranger can use (highest impact)
- Pick **Karela** and **Aipon**. Deploy each to a real URL (Vercel for web; Expo EAS preview / an APK or a recorded demo for mobile).
- Even a rough, narrow version beats a perfect spec. Ship one flow.
- For every project, add a **30-60 second screen recording** (GIF or MP4) to the project page and the repo README. This is the cheapest high-value asset you can make.

### 2. Make your GitHub a second portfolio
- Public repos for the finished/partial work (strip secrets; use `.env.example`).
- A **README per repo**: pitch, screenshot/GIF, how to run, stack (used vs planned), what is done, what is next.
- A **profile README** (`Dell015/Dell015`): who you are, three pinned repos, how to reach you.
- Commit steadily. A green graph of real work reads better than a burst.
- Repo hygiene: no `node_modules`, no committed keys, clear commit messages.

### 3. Pick a specialization to be "known for"
Generalist juniors are the most interchangeable. You have raw material for three directions. Choose one to lead with and let the rest support it:

| Direction | Evidence you already have | What to add |
|---|---|---|
| **AI engineering / evals** | Icarus (LangGraph, Socratic agents, cost routing), Karela's Gemini coach | Publish one write-up on evaluating free-text answers; add a small eval set and results |
| **Geospatial / mobile** | Karela (PostGIS, offline sync, Expo) | Deploy it; write about offline-first sync on bad networks |
| **Product-minded full-stack** | HIRED.PH, Seated, competitions | Case study with metrics from user tests |

My recommendation: lead with **product-minded full-stack, with AI engineering as the edge**. It fits your competition record and your best story.

### 4. Use the write-up as proof
One good technical post beats ten repos nobody reads. Write 2-3 short posts (800-1,200 words) on things only you can say:
- "I stopped vibecoding. Here is how I built a tool that checks I understand my own code" (Icarus)
- "Designing offline-first for prepaid data and spotty 4G in Cagayan Valley" (Karela/HIRED.PH)
- "Why the ghost pacer shouldn't just replay your best run" (Karela)
Post on dev.to or your own site, link from LinkedIn and the portfolio.

### 5. Get in front of people, not just job boards
- **Referrals and direct outreach convert far better than cold applications**; most junior roles are filled before they are widely seen. Message engineers and hiring managers (not generic HR) with a 3-4 line note and one link to the thing you built.
- Join local and regional communities (PH dev groups, GDG, startup events, university alumni). Your competition placements get you in the door; follow up with the judges and mentors you met.
- Ask your **OJT supervisor** for a reference or a LinkedIn recommendation (mind the NDA).
- Contribute **one or two small open-source PRs** (docs, bug fixes, "good first issue") to tools you actually use (Expo, Supabase, Next.js ecosystem). One merged PR is a verifiable third-party code review.

### 6. Tiered application strategy
- **Tier A (reach):** startups and product teams where your founder background matters. Apply with a personal note.
- **Tier B (target):** PH tech companies, BPO tech/IT arms, and remote-friendly juniors roles.
- **Tier C (safety):** outsourcing and agency roles, which hire juniors most reliably and give you production exposure.
- Send 5-10 tailored applications per week rather than 50 generic ones. Track them in a sheet (company, date, contact, status, follow-up date).

### 7. Fix the resume
- One page, PDF, ATS-friendly (no columns, no images, no icons).
- Top: name, email, GitHub, LinkedIn, **portfolio URL**, city. Phone only if you are comfortable publishing it.
- Then **Projects** (3 max) with one line of impact each, **Experience** (OJT: role, stack, what you did, no client data), **Competitions**, **Education**, **Skills**.
- Use outcomes, not duties: "Led a 4-person team to 1st Runner Up at IgnITE 2025" beats "Responsible for team coordination."
- **Remove the references' emails.** Put "References on request."
- Keep the resume in the repo as `public/resume.pdf` only after you have updated it; the site's resume button should point to the new file.

### 8. LinkedIn and profile hygiene
- Headline: what you do + who for, e.g. "Full-stack developer · AI & mobile · Thesis lead · PSC 11 Regional Finalist."
- Use the same photo as the portfolio. Add Featured: portfolio, best repo, best write-up.
- Fill in Projects with links, competitions as Honors & Awards, OJT as experience.
- Turn on "Open to work" for recruiters (visible to recruiters only if you prefer).

### 9. Interview preparation
- Prepare three stories in STAR form: leading a team under a deadline (HIRED.PH), a hard technical problem (Karela's ghost pacer or spatial consensus), and a time you were wrong (vibecoding to understanding).
- Be ready to whiteboard or live-code fundamentals: arrays/strings/hashmaps, async/await and the event loop, REST design, SQL joins and indexes, React rendering. Do 2-3 easy/medium problems a week.
- Know your repos cold; assume someone will open one and point at a file.
- Prepare "why this company" answers and 2-3 questions for them.
- Practice explaining each project to a non-technical person in 30 seconds (the site's "plain" lines are good for this).

### 10. Money and expectations (Philippines / remote)
Salary data varies a lot by source; treat these as ranges to calibrate, not promises: [HireTalent.ph salary guide](https://hiretalent.ph/filipino-software-developer-salaries), [iSCALE](https://iscale-solutions.com/average-salary-of-software-developers/), [Second Talent rate card](https://www.secondtalent.com/developer-rate-card/philippines/), [ITSourceCode full-stack guide](https://itsourcecode.com/blogs/full-stack-developer-salary-philippines-2026/). Note many of these are written for employers, so they may skew toward what companies hope to pay.
- Local junior roles and remote/offshore junior roles differ widely; remote USD roles pay several times local rates but are more competitive and expect stronger English communication and self-direction.
- Do not name a number first; ask for the budgeted range. Know your floor.
- Early on, a good team, mentorship and production exposure are worth more than a few thousand pesos.

## What not to do
- Do not claim projects are live, shipped or have users. Say "in development" or "competition prototype."
- Do not list tech you cannot discuss.
- Do not add more projects before the first two are deployed.
- Do not publish the OJT/ERP specifics.
- Do not make Immersive mode the default. Recruiters on slow laptops will bounce; keep Clean as default and let the particles be a bonus.

## What makes you memorable (use this)
Most juniors look the same: a to-do app, a weather app, a tutorial clone. You can say:
> I'm a CS student in Isabela who led teams to a regional startup final and 1st Runner Up, and I'm building offline-first, AI-assisted products for Filipino users. I stopped vibecoding and built a tool that makes me prove I understand my code.

That is a story. Give it a link to click.
