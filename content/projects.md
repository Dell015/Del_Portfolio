# Projects — Content Source

Fill out each project below. I'll pull from this to populate the portfolio cards and case study pages.

---

## How to fill this out

For each project, fill in what you can. Leave `TODO` for anything you don't have yet.
Screenshots go in `/content/projects/screenshots/` — name them `karela-1.png`, `hired-ph-1.png`, etc.

---

## Karela

| Field | Value |
|---|---|
| **Platform** | Mobile (iOS + Android) |
| **One-line pitch** | Turns the movement you already do into fitness progress and real civic impact. |
| **Full description** | Hybrid fitness + civic intelligence platform combining adaptive running algorithms with crowdsourced urban sensing. Tracks physical activity, adapts via an AI coach named Ani, rewards consistency through an RPG progression system, and connects daily effort to real civic impact in the community. Built as a thesis project for Philippine deployment. |
| **Your role** | Lead Developer & Architect |
| **Team size** | 5 members + 1 adviser |
| **Team** | Randel Serafica (Lead Dev & Architect), Trishia Rirao (UI Designer & Pitch Presenter), Steven Sanidad (UX Designer & QA), Qarisha Collado (UI/UX Designer & Research), Cyduanne Biraquit (Database & 3D Modelling), Sander Sedano (Mentor/Adviser) |
| **Timeline** | Active development — Version 3.1, thesis submission 2026 |
| **Status** | Active Development (thesis defense ongoing) |
| **Pilot city** | Tuguegarao City, Cagayan Valley, Philippines |
| **Live URL** | TODO |
| **Repo URL** | TODO |
| **Screenshots** | TODO — _[Add to /content/projects/screenshots/karela-*.png]_ |

### Tech Stack (Detailed)

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend & Dev | React Native + Expo | SDK 51+ | Unified cross-platform codebase with hot-reloading and sensor testing |
| Local Database | expo-sqlite | v14+ | Offline mission caching, run telemetry, high-frequency data logging |
| Cloud Backend | Supabase (PostgreSQL + PostGIS) | Latest | Relational source of truth for user profiles, RPG stats, Guild sync, and geospatial civic queries |
| Authentication | Supabase Auth | OAuth2 + JWT | Secure Google/Email login; magic link support; persistent local session management |
| Media Storage | Supabase Storage | Latest | Encrypted repository for Proof of Impact photos, access controlled via Row-Level Security |
| Realtime | Supabase Realtime | Latest | Live Guild/Squad updates via Postgres Change Data Capture channels |
| Server Logic | Supabase Edge Functions | Deno runtime | Sync reconciliation, fraud detection, civic consensus scoring |
| Maps & Geo | react-native-maps | v1.10+ | Apple Maps (iOS) and Google Maps (Android) for battery-efficient rendering |
| Weather API | OpenWeatherMap | v3.0 One Call | Environmental context for Ani's mission engine and safety tier system |
| AI Coaching | Gemini Flash | gemini-1.5-flash | Lightweight LLM for personalized Ani coaching, quest generation, and behavioral adaptation |
| State Management | Zustand | v4+ | Lightweight global state for session and RPG data |
| Navigation | React Navigation | v6+ | Stack + Tab navigation with deep linking |
| Push Notifications | Expo Notifications | SDK 51+ | Streak alerts, Squad events, Bayanihan Protocol alerts |

### Architecture Decisions

**Why Supabase over Firebase?**
Supabase's PostgreSQL backend unlocks PostGIS — the spatial extension that handles DBSCAN-inspired civic clustering natively via `ST_DWithin()` queries, eliminating manual epsilon-radius logic in application code. Row-Level Security (RLS) policies replace Firebase Security Rules with standard SQL, making access control auditable and version-controlled. The relational schema is a better fit for Karela's structured civic data (missions, poi_submissions, vanguard_reviews) than Firestore's document model.

**Why Gemini Flash for Ani?**
High-frequency operation — Ani interacts at session start, mid-run, and session end, plus daily personalized quest generation. Requires fast, cost-efficient model with conversational coherence. Gemini Flash's low latency and cost-per-token fit this use case. Weekly deeper analysis (recaps, plan revision) uses higher-capability model at lower frequency.

**Offline-first with SQLite:**
expo-sqlite handles high-frequency run telemetry locally. Syncs to Supabase when connectivity allows. This architecture supports low-end Android devices, prepaid data plans, and inconsistent 4G — the reality of the Philippine market.

**Spatial Consensus Algorithm:**
Uses PostGIS `ST_DWithin()` for DBSCAN-inspired clustering to verify civic reports. Multiple independent users must report the same issue within a spatial radius before it's verified. Temporal decay ensures outdated reports age out naturally.

### Biggest Challenge

The core engineering challenge is the **Adaptive Ghost System** — building a pacing avatar that isn't just a replay of the user's best run (which leads to discouragement), but a "Synthetic Best Run" that models the user's fatigue patterns using effort decay curves and spatial interpolation. The ghost must adapt after every run based on the user's personal fatigue signature.

Additionally: designing the **Resonance System** — the fusion layer that dynamically modulates civic contribution load based on the user's current physical state. This is novel — no existing app combines fitness modeling with civic intelligence this way.

### What You Learned / Next Steps

**Roadmap:**
- Phase 1 (Month 1–3): Sensor fusion, Ghost System, Ani coaching, SQLite offline + Supabase sync, XP/Streak system, basic Squads, 3 Civic Quest types
- Phase 2 (Month 4–6): Guild formation, Territory Quests, Squad Ghost, Scout Pass Season 1, Tagalog localization
- Phase 3 (Month 7–9): Full Bayanihan Protocol, Proof of Impact verification, LGU admin panel, Community Hero accessibility mode
- Phase 4 (Month 10–12): Multi-city expansion (Cauayan, Santiago City), Ibanag localization, PAGASA partnership, LGU White-Label product

**Success gates:** Phase 1 requires 500 DAU + 40% Day-7 retention. Phase 4 targets 10,000 DAU across Cagayan Valley.

---

## HIRED.PH

| Field | Value |
|---|---|
| **Platform** | Web + Mobile |
| **One-line pitch** | A skills-first job platform that gets people hired without degrees, resumes, or even internet access. |
| **Full description** | Inclusive, skills-first job platform for skilled non-degree-holding Filipinos (blue-collar workers, undergraduates). Eliminates the need for college degrees, polished resumes, and even internet access as hiring barriers. Designed for the Philippine market where traditional hiring infrastructure excludes the majority of the skilled workforce. |
| **Your role** | Lead Developer / Founding CEO |
| **Team size** | 3–4 members (3 for PSC, 4 for IgnITE) |
| **Timeline** | 2025 (competition year) |
| **Status** | Competition prototype — advanced to regional level |
| **Competition history** | Philippine Startup Challenge 11 (Regional Finalist), IgnITE Start-Up Competition (1st Runner Up) |
| **Live URL** | TODO |
| **Repo URL** | TODO |
| **Screenshots** | TODO — _[Add to /content/projects/screenshots/hired-ph-*.png]_ |

### Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework, PWA-capable, SEO-friendly |
| PostgreSQL | Relational database for job/skill matching |
| Offline-first architecture | Users without stable internet can still access job matching |

### Architecture Decisions

**Offline-first design:**
The core architectural decision is making the platform work without internet access. In the Philippines, many potential users (construction workers, drivers, service workers) don't have consistent internet. The app must function with intermittent or no connectivity — syncing when available, caching job matches locally.

**Skills-first matching:**
Traditional job platforms filter by degree, resume quality, and keywords. HIRED.PH inverts this — matching based on verified skills, not credentials. This is both a product decision and a technical one (different matching algorithms, different data models).

### Biggest Challenge

Building a job platform that works for people who may not have: a degree, a resume, consistent internet, or experience with digital hiring platforms. Every design and technical decision must account for these constraints without patronizing the user.

### What You Learned / Next Steps

- Competed twice with this project, iterating between competitions
- Learned to pitch technical products to non-technical judges
- Led different team sizes (3 and 4) across two competitions
- Next steps: TODO (post-competition plans)

---

## Tag.Ai

| Field | Value |
|---|---|
| **Platform** | Web (PWA) |
| **One-line pitch** | A social drinking game that gets people off their phones and into real conversation. |
| **Full description** | Social drinking game webapp built around the philosophy of one phone, passed around the table, eye contact enforced. Curated card library, wildcard system, coin economy, customizable decks, escalation engine — every session unique. Designed for Filipino barkadas (friend groups) ages 18–30. |
| **Your role** | Solo Developer |
| **Team size** | 1 (solo) |
| **Timeline** | TODO |
| **Status** | In development |
| **Target market** | Filipino barkadas (friend groups), couples, coworkers, strangers at events |
| **Live URL** | TODO |
| **Repo URL** | TODO |
| **Screenshots** | TODO — _[Add to /content/projects/screenshots/tagai-*.png]_ |

### Tech Stack (Detailed)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js | React framework, PWA-capable, SEO-friendly landing page |
| Styling | Tailwind CSS | Utility-first styling for fast UI iteration |
| Animation | Framer Motion | Card flip, swipe, drag-to-trash animations (makes the game feel alive) |
| Backend & DB | Supabase | Authentication, PostgreSQL database, real-time subscriptions |
| Realtime | Supabase Realtime Channels | Player joins/leaves, card draws, heat changes, coin spending — all synced live |
| Payments | PayMongo | Philippine payment gateway: GCash, Maya, credit/debit, over-the-counter |
| Hosting | Vercel | Next.js deployment, global CDN, automatic scaling |

### Architecture Decisions

**One phone, passed around:**
The core design philosophy drives the technical architecture. It's NOT a multiplayer mobile app where everyone stares at their own screen. It's one device passed physically between players. This simplifies networking (one active session per device at a time) but requires careful UX for turn management and real-time state sync when a session has multiple watchers.

**Supabase Realtime for session events:**
Each game session = one Supabase Realtime channel. Events include: `card_drawn`, `card_skipped`, `card_hearted`, `card_trashed`, `heat_updated`, `coin_spent`, `player_joined`, `player_removed`, `wild_card_triggered`, `game_paused/resumed`, `session_ended`. This enables late joiners, mid-game player changes, and host controls without page refreshes.

**Coin economy as engagement mechanic:**
Players chip in coins to fund sessions. Coins are purchasable (via PayMongo — GCash, Maya, etc.) or earned through gameplay. This creates a micro-transaction model that's culturally appropriate for the Filipino market (small amounts, mobile payment friendly).

**Escalation engine:**
Cards aren't random — they follow an intensity curve. Session starts light, escalates over time. Heat level (1–5) determines which card pool gets drawn from. This prevents the common drinking game problem where the game feels the same at minute 5 as at minute 90.

### Biggest Challenge

Designing a card library that's engaging across wildly different group dynamics — barkadas, couples, coworkers, strangers. The same questions need comfort filters (host toggles off topics the group wants to avoid) and players can privately flag topics they don't want (visible to host only, protecting privacy). Balancing fun with respect at scale is harder than the technical work.

### What You Learned / Next Steps

- Building a product where the goal is to get people OFF their phones — counterintuitive design challenge
- Designed an escalation system and economy from scratch
- Next steps: MVP build order defined (auth → card library → session flow → coin economy → deck builder → social features)

---

## Icarus

| Field | Value |
|---|---|
| **Platform** | Web (responsive, mobile-friendly for answering questions) |
| **One-line pitch** | Proves you actually understand the work you submitted — code, thesis, pitch deck, or otherwise. |
| **Full description** | A Universal Integrity & Logic Auditor. Challenges users to prove they genuinely understand work they submit — a codebase, thesis, business plan, pitch deck, or any document representing their thinking. Uses Socratic questioning, a Gate mechanic that locks progress until flaws are fixed, and produces a verifiable Defense Transcript. Not an AI detector — a mentor that closes the gap between what you submitted and what you actually understand. |
| **Your role** | Solo Developer / Architect |
| **Team size** | 1 (solo) |
| **Timeline** | Pre-MVP development (concept + architecture complete, MVP in progress) |
| **Status** | In development — targeting Philippine Startup Challenge 11 submission |
| **Target market** | Filipino CS students, bootcamp graduates, thesis writers, startup founders |
| **Live URL** | TODO |
| **Repo URL** | TODO |
| **Screenshots** | TODO — _[Add to /content/projects/screenshots/icarus-*.png]_ |

### Tech Stack (Detailed)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Angular (TypeScript) + Signals UI | Reactive state management, complex audit state machine, built-in DI |
| Backend | FastAPI (Python) | Async logic engine, universal file parser, audit state machine, Delta Analyzer |
| AI Layer | Claude API (Anthropic) + LangGraph | Multi-agent Socratic auditing system (Scan Agent, Question Agent, Evaluation Agent, Red Herring Agent) |
| Database | PostgreSQL via Supabase | Audit sessions, question histories, user answers, Feather/Wax records |
| Semantic Search | pgvector | Pattern-based memory across audits — tracks conceptual gaps over time |
| Auth | Supabase Auth | User management, session tokens |
| Cost Routing | Claude Haiku (routine) / Claude Sonnet (evaluation) | Haiku for question generation; Sonnet for answer evaluation and Red Herring design |

### Architecture Decisions

**Why Angular over React?**
Stronger TypeScript integration, built-in dependency injection, opinionated structure suits a complex audit state machine. The Icarus UI manages multiple states (active → lockdown → unlocked → next flight) that benefit from Angular's structured approach.

**Why LangGraph over single-prompt?**
The audit flow is inherently cyclical (question → evaluate → gate check → question again). LangGraph's multi-agent system enables specialized behavior per audit phase: separate agents for scanning, questioning, evaluating, and planting red herrings. Conditional edge routing matches the Gate mechanic perfectly. CrewAI and AutoGen were considered but offer less control over conditional branching and cycle detection.

**Why pgvector for history?**
Semantic similarity search enables pattern-based memory across audits. Icarus tracks which concepts a user struggles with over time and targets those gaps. Keyword matching alone would miss conceptual relationships.

**Batch-Audit Gate mechanic:**
This is the core differentiator. When Icarus finds a flaw, it locks the audit. You can't proceed until you: fix the source material, submit the update, have Icarus verify the fix, AND successfully defend your understanding of what you changed and why. This can't be replicated with a ChatGPT prompt — it's a system mechanic, not a conversation.

**Cost routing (Haiku/Sonnet):**
Scan Agent and Question Agent use Claude Haiku (cost-efficient). Evaluation Agent and Red Herring Agent use Claude Sonnet (requires higher reasoning quality). This optimizes cost while maintaining evaluation integrity.

### Biggest Challenge

**Answer evaluation** — the hardest unsolved problem. When a user types a free-text explanation, there's no ground truth. The answer might be correct but expressed in non-standard vocabulary (especially for Filipino users who code-switch or write in non-native English). The Evaluation Agent must distinguish between: genuinely correct, partially correct, fluent but wrong, and honest "I don't know." The evaluation rubric is calibrated on semantic accuracy, not linguistic polish.

**Language bias mitigation:**
Filipino users often write in slightly non-standard English. Evaluation rubrics must not penalize correct understanding expressed in non-standard forms. Answers scoring below coherence threshold get a rephrasing prompt before Wax is assigned.

### What You Learned / Next Steps

- Built Icarus as a direct response to personal experience — stopping vibecoding and learning to genuinely understand generated code
- Designed a full multi-agent AI system architecture from scratch
- Next steps: MVP validation with 10–15 users (pre/post comprehension testing), then Philippine Startup Challenge 11 submission
- Post-MVP: cross-session memory, institutional pilot (bootcamp/university cohort), certified Defense Transcripts

**Personal motivation (from Icarus doc):**
> "Randel started Icarus as a direct response to his own experience: the moment he decided to stop vibecoding — generating code he couldn't explain — and start actually learning what he was building."

---

## garahe

| Field | Value |
|---|---|
| **Platform** | Web (responsive, mobile-friendly) |
| **One-line pitch** | Your entire vehicle history — repairs, costs, decisions — in one place, and smarter the longer you use it. |
| **Full description** | Private, web-based vehicle companion. Your knowledge about your vehicle lives in one place, belongs entirely to you, and gets smarter the longer you use it. Built for people who forget service history, lose receipts, switch mechanics, or can't tell if they can really afford their next vehicle. Three phases: lean core (day 1), 3D interactive layer (visual + intuitive), AI diagnostic layer (conversational). |
| **Your role** | Solo Developer |
| **Team size** | 1 (solo) |
| **Timeline** | In planning / early development |
| **Status** | Architecture designed, build roadmap defined, development starting |
| **Target market** | Every vehicle owner (cars, motorcycles, trucks) — especially those who forget maintenance, lose receipts, or switch mechanics |
| **Live URL** | TODO |
| **Repo URL** | TODO |
| **Screenshots** | TODO — _[Add to /content/projects/screenshots/garahe-*.png]_ |

### Tech Stack (Detailed)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14+ (App Router) with TypeScript | Routing, SSR, static generation, API routes. Most documented/AI-assisted framework. |
| Styling | Tailwind CSS | Utility-first CSS for fast iteration |
| 3D Viewer | Three.js via React Three Fiber | Phase 2: interactive 3D vehicle model with clickable component hotspots |
| State Management | Zustand | Shared state across components (selected vehicle, 3D viewer highlights, chat) |
| Backend | Python 3.11+ with FastAPI | Async REST API, business logic layer between frontend and database |
| ORM | SQLAlchemy + Alembic | Database interaction via Python objects, version-controlled schema migrations |
| Validation | Pydantic v2 | Data validation at API boundaries |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) | Managed Postgres, auth (no custom auth implementation), file storage for receipts/photos |
| AI Integration | Anthropic API (Claude) | Phase 3: conversational diagnostic chatbot powered by user's own vehicle history |
| Frontend Hosting | Vercel | Zero-config Next.js deployment, preview deployments per PR |
| Backend Hosting | Railway | Simple Python/FastAPI deployment, managed scaling |

### Architecture Decisions

**Component-based data structure:**
The most important technical decision. Every vehicle has predefined components (engine oil, brake pads, tires, battery, etc.). Every service log entry attaches to specific components. This is what makes: odometer-based reminders accurate, the status dashboard meaningful, the 3D viewer's hotspots possible, and the AI chatbot genuinely useful rather than generic. The data model is designed from day 1 to support Phase 2 (3D) and Phase 3 (AI) without schema rewrites.

**Three-phase architecture:**
Phase 1 (core) works standalone — no 3D, no AI. Phase 2 (3D viewer via Three.js/React Three Fiber) is a visual interface into the same data. Phase 3 (AI via Claude) uses the structured component history as prompt context. Each phase builds on the previous without requiring rewrites.

**FastAPI over Express:**
Python's ecosystem for AI integration (Anthropic SDK, prompt building, structured response parsing) is cleaner than TypeScript. Native async support for concurrent requests. Automatic OpenAPI documentation. Type annotations give TypeScript-level safety in Python.

**Trust Layer (sharing without surrendering data):**
- Mechanic access: one-time 6-digit code, configurable expiry, no account needed — just a browser
- Buyer access: Verified History Report as shareable link or PDF export
- Ownership transfer: vehicle moves to buyer's Garage, previous owner's personal data wiped, maintenance history preserved
- Solves real trust problems between strangers without permanent shared networks

**Supabase for auth specifically:**
Authentication security is dangerous to implement incorrectly. Supabase Auth is battle-tested + free at early scale. Row-Level Security ensures a user can only ever see their own vehicles — even if a backend bug queries wrong data, Postgres refuses to return it.

### Biggest Challenge

Designing a data model that supports three fundamentally different interfaces (timeline, 3D viewer, AI chatbot) without any rewrites between phases. The component-based structure must be flexible enough for any vehicle type while rigid enough to make reminders, status dashboards, and AI diagnostics reliable.

Also: building a product where the value compounds over time (the longer you use it, the more valuable your data becomes) while keeping the onboarding under 1 minute. Users won't log service history if setup is painful.

### What You Learned / Next Steps

**Build roadmap:**
- Phase 0: Environment setup (Next.js + FastAPI + Supabase deployed and talking to each other)
- Phase 1a: Database schema + vehicle CRUD
- Phase 1b: Timeline + component logging
- Phase 1c: Odometer-based reminders + status dashboard
- Phase 1d: Trust Layer (mechanic codes, buyer reports, ownership transfer)
- Phase 2: Three.js 3D viewer with clickable hotspots and real-time status coloring
- Phase 3: Claude-powered AI chatbot using vehicle's own component history as context

**Personal connection:**
- garahe was inspired by Randel's interest in automotive (cars and big bikes)
- Designed for the Filipino vehicle owner market

---

## Other Projects?

_[Any other projects you want on the portfolio? Add them here with the same format.]_

- **Seated** — currently being developed for IGNITE OGIS Start-Up Competition 2026 (no doc available yet)

---

## Summary: Technical Range Across Projects

| Project | Frontend | Backend | Database | AI | Platform |
|---|---|---|---|---|---|
| Karela | React Native + Expo | Supabase Edge Functions (Deno) | PostgreSQL + PostGIS + SQLite | Gemini Flash | Mobile |
| HIRED.PH | Next.js | (integrated) | PostgreSQL | — | Web + Mobile |
| Tag.Ai | Next.js + Framer Motion | Supabase Realtime | PostgreSQL | — | Web (PWA) |
| Icarus | Angular + TypeScript | FastAPI (Python) | PostgreSQL + pgvector | Claude API + LangGraph | Web |
| garahe | Next.js + Three.js (R3F) | FastAPI (Python) | PostgreSQL (Supabase) | Claude API | Web |

**Consistent patterns:**
- PostgreSQL across every project (Supabase as managed host)
- TypeScript on every frontend
- Offline-first thinking (Karela, HIRED.PH)
- Filipino market focus (all projects)
- Solo or lead developer on every project
- Products designed to compound in value over time (garahe, Icarus)
