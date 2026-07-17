# Karela 🏃‍♂️🇵🇭
### *A Better You, One Quest at a Time.*

> *"An adaptive fitness platform where personal endurance modeling powers real-world civic intelligence."*

![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)
![Version](https://img.shields.io/badge/Version-3.1-blue)
![Stack](https://img.shields.io/badge/Stack-React_Native_%7C_Expo_%7C_Supabase_%7C_SQLite-orange)
![Platform](https://img.shields.io/badge/Platform-iOS_%7C_Android-lightgrey)
![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)
![Pilot](https://img.shields.io/badge/Pilot_City-Tuguegarao%2C_Cagayan-green)

Karela is a **hybrid fitness and civic intelligence platform** that combines **adaptive running algorithms** with **crowdsourced urban sensing** to simultaneously improve personal exercise adherence and community maintenance responsiveness. It turns the movement you already do — your morning commute, your evening walk, your neighborhood cleanup — into something that counts. It tracks your physical activity, adapts to your body and habits through a personalized AI coach named **Ani**, rewards your consistency through an RPG progression system, and connects your daily effort to real civic impact in your community.

This is not a gamified jogging app. Karela's thesis is:

> **"Using predictive physical modeling and decentralized crowdsourced verification to improve exercise adherence and urban maintenance reporting."**

---

## Table of Contents

1. [What Is Karela?](#1-what-is-karela)
2. [The Problem It Solves](#2-the-problem-it-solves)
3. [Who Is Karela For?](#3-who-is-karela-for)
4. [Why Not Just Use Strava?](#4-why-not-just-use-strava)
5. [User Research & Validation](#5-user-research--validation)
6. [Core Philosophy](#6-core-philosophy)
7. [How Karela Works](#7-how-karela-works)
8. [System Architecture](#8-system-architecture)
9. [Tech Stack](#9-tech-stack)
10. [The Running Engine — Adaptive Ghost System](#10-the-running-engine--adaptive-ghost-system)
    - [Spatial Interpolation](#101-spatial-interpolation)
    - [Effort Decay Function](#102-effort-decay-function)
    - [Reinforcement-Style Ghost Calibration](#103-reinforcement-style-ghost-calibration)
11. [Performance Aggregation Logic](#11-performance-aggregation-logic)
12. [The Civic Engine — Distributed Urban Sensing](#12-the-civic-engine--distributed-urban-sensing)
    - [Civic Reporting System](#121-civic-reporting-system)
    - [Spatial Consensus Algorithm](#122-spatial-consensus-algorithm)
    - [Temporal Decay Logic](#123-temporal-decay-logic)
13. [User Roles](#13-user-roles)
14. [The Resonance System — Fusion Layer](#14-the-resonance-system--fusion-layer)
15. [Route-Based Civic Integration](#15-route-based-civic-integration)
16. [Ani — Your AI Coach](#16-ani--your-ai-coach)
17. [RPG Mechanics](#17-rpg-mechanics)
18. [Sensor Fusion & Anti-Cheat](#18-sensor-fusion--anti-cheat)
19. [Onboarding & The First 7 Days](#19-onboarding--the-first-7-days)
20. [Social Infrastructure](#20-social-infrastructure)
21. [The Bayanihan Protocol](#21-the-bayanihan-protocol)
22. [Reward Architecture](#22-reward-architecture)
23. [Data Privacy & RA 10173 Compliance](#23-data-privacy--ra-10173-compliance)
24. [Business Model](#24-business-model)
    - [Monetization Streams](#monetization-streams)
    - [Unit Economics](#unit-economics)
    - [Philippine Market Context](#philippine-market-context)
25. [Go-To-Market Strategy](#25-go-to-market-strategy)
26. [Competitive Moat & Defensibility](#26-competitive-moat--defensibility)
27. [Notification Architecture](#27-notification-architecture)
28. [Accessibility](#28-accessibility)
29. [Database Schema](#29-database-schema)
30. [Civic Contribution Score](#30-civic-contribution-score)
31. [KPIs & Success Metrics](#31-kpis--success-metrics)
32. [MVP Definition & Success Criteria](#32-mvp-definition--success-criteria)
33. [Thesis-Worthy Components](#33-thesis-worthy-components)
34. [Research Title & Framework](#34-research-title--framework)
35. [Ethics & Responsible Design](#35-ethics--responsible-design)
36. [Known Open Questions](#36-known-open-questions)
37. [Long-Term Vision](#37-long-term-vision)
38. [Core Technical Domains](#38-core-technical-domains)
39. [Roadmap](#39-roadmap)
40. [Glossary](#40-glossary)
41. [The Team](#41-the-team)

---

## 1. What Is Karela?

Karela operates on two parallel tracks that are deeply interconnected:

| Track | Purpose |
|---|---|
| **Fitness Intelligence** | Adaptive ghost pacing system that models and predicts individual fatigue to improve exercise adherence |
| **Civic Intelligence** | Crowdsourced spatial verification network that collects, validates, and decays urban maintenance reports |

These two tracks are fused through what Karela calls the **Resonance System** — a layer that uses a user's current physical state to dynamically modulate their civic contribution load. The result is a platform where personal endurance modeling directly powers real-world community responsiveness.

Most fitness apps are built for athletes. They celebrate the person who ran a sub-4-minute kilometer. They ignore the student who walked forty-five minutes across campus every day for a year.

**Karela is built for that student.**

It is simultaneously built for the neighbor who helped clear drainage before a typhoon, the volunteer who photographed a collapsed road so the barangay could respond faster, and the guild of 80 users whose collective 2,000 kilometers of weekly movement claims a city landmark and makes it theirs on the map.

At its core, Karela rests on a single conviction: **consistency beats intensity**. A user who walks 30 minutes every day for a year contributes more to their health and their community than one who runs a marathon once and disappears. The entire system — Ani's coaching, the streak multiplier, the Ghost System, the Bayanihan Protocol — is built to make that kind of sustained, ordinary, everyday movement feel like the heroic act it actually is.

**Target Users:** Recreational and habitual runners, urban walkers, community volunteers, and local government units (LGUs) seeking data-driven maintenance prioritization.

---

## 2. The Problem It Solves

The Philippines has a specific and urgent health and civic challenge that no existing app is designed to address.

**On the health side:** The country is experiencing a rapid rise in lifestyle-related disease — diabetes, hypertension, and cardiovascular illness — driven in large part by sedentary behavior. But the primary barrier to physical activity for most Filipinos is not laziness. It is *meaninglessness*. People walk significant distances every day — to tricy stops, across campuses, between markets — and feel nothing for it because no system acknowledges it. The psychological infrastructure of motivation is absent: no feedback, no progress, no reward, no community.

**On the civic side:** The Philippines is among the most disaster-affected countries on Earth. The same communities that walk past flooded drainage channels and damaged roads every day are the ones most harmed when those issues go unreported. The Bayanihan spirit — the Filipino cultural value of communal unity and mutual aid — exists as a value but has no digital expression. Volunteer activity is uncoordinated, unverified, and invisible to local governments that need data to respond effectively.

**On the motivational side:** Global fitness apps solve for the wrong user. Strava is built for competitive athletes. Nike Run Club is a product of a shoe brand. Pacer is passive. None of them understand the commuter, the student org volunteer, the disaster preparation worker. None of them are designed for low-end Android devices, prepaid data, and inconsistent 4G connectivity. None of them generate verifiable civic data.

**The gap Karela fills:** A platform that meets everyday Filipino users where they already are — in motion, in community, with limited data and budget — and makes that motion matter for their health, their social life, and their city.

---

## 3. Who Is Karela For?

Karela is not for elite athletes. It is for everyday people whose movement is already happening but going unrecognized.

| Persona | Profile | Pain Point | Karela's Answer |
|---|---|---|---|
| 🏃 "The Resilient Commuter" (Juan) | 22–35 y/o, mid-range Android, prepaid data, Tuguegarao or Metro Manila | Walks 3–5km daily but feels like effort with no return | Converts the commute into XP, Gems, and civic pride. Ani notices the pattern and builds a quest around it. |
| 🎓 "The Civic Student" (Sita) | 18–22 y/o, campus Wi-Fi, active in school orgs | Wants to volunteer but no structured, rewarding platform exists | Guild leaderboards for social status; Vanguard role for recognition; Bayanihan Protocol for real missions |
| 🏛️ "The LGU Coordinator" (Mang Ben) | 35–55 y/o, DRRMO or Barangay official | No digital system to coordinate verified volunteer activity during emergencies | Real-time volunteer heatmap, verified task data, exportable civic reports |
| 💪 "The Self-Improver" (Rina) | 18–30 y/o, aware that she should move more, tried apps and quit | Generic app goals feel irrelevant to her body, schedule, and city | Ani builds a plan specific to her height, weight, preferred time, and neighborhood. The goals feel like hers. |
| 🏘️ "The Barangay Hero" (Tatay Romy) | 45–60 y/o, less tech-savvy, motivated by community | No platform that honors civic contribution the same way fitness apps honor athletic performance | Civic XP is tracked separately and valued equally. A Debris Clearer after a typhoon earns recognition, not just a runner. |

**The beachhead market** — the initial target for Karela's launch — is **university students and young professionals in Tuguegarao City, Cagayan Valley** who are physically active in their daily commute and socially motivated by community recognition. This group is dense, reachable through campus channels, and has the highest likelihood of forming the Guilds and Squads that make the social layer come alive from day one.

---

## 4. Why Not Just Use Strava?

The honest answer is: Strava, Nike Run Club, and Pacer are excellent apps for the users they were built for. Karela is built for a different user entirely.

| Question | Strava / Nike Run Club / Pacer | Karela |
|---|---|---|
| Who is the target user? | Competitive runners, cyclists, athletes | Everyday commuters, students, civic volunteers |
| What movement counts? | Intentional athletic sessions | All movement — commutes, walks, errands |
| Does it work offline? | Limited — requires data for most features | Full offline operation with seamless sync |
| Is it optimized for low-end Android? | No — assumes modern hardware and consistent data | Yes — SQLite-first, low RAM footprint, batch sync |
| Does it know your body? | Basic profile only | Ani adapts to your height, weight, history, and habits |
| Does it give personalized quests? | No — static challenges, global leaderboards | Yes — Ani generates goals specific to you and your city |
| Does it reward consistency over performance? | No — rewards fastest times and longest distances | Yes — the streak multiplier rewards daily habit, not peak output |
| Does it have a social layer for non-athletes? | Competitive only (KOMs, segment rankings) | Squads for accountability, Guilds for community, no pressure to be fastest |
| Does it integrate with civic life? | No | Full Bayanihan Protocol — disaster preparation, recovery missions, LGU data |
| Does it generate data for local governments? | No | Yes — Civic Contribution Score, Zone Civic Index, volunteer heatmaps |
| Does it work for people who can't run? | Poorly | Yes — Civic Quests, Vanguard reviews, and Community Hero mode require no running at all |
| Does peso-denominated pricing exist? | No | Yes — designed for Philippine purchasing power |

**The core difference in one sentence:** Strava celebrates the person who ran the fastest. Karela celebrates the person who showed up every day.

---

## 5. User Research & Validation

### Pain Point Observations

Research for Karela drew from observations and informal conversations with university students, daily commuters, and civic volunteers in Tuguegarao and online communities relevant to Filipino health and community life.

**On daily movement going unrecognized:**
- A consistent pattern emerged among non-athlete users: significant daily walking (campus traversal, tricy commutes, market errands) that felt psychologically invisible because no system acknowledged it. Users who had tried fitness apps reported abandoning them because the apps made them feel behind rather than ahead — comparing their commute pace to a runner's training pace.
- Several students described wanting to be more active but finding generic app goals ("Run 5km today") disconnected from their actual life and schedule.

**On the motivational failure of generic apps:**
- The most common reason cited for app abandonment was not lack of effort but *lack of relevance*. Goals that felt designed for someone else in a different city with different constraints.
- The concept of a coach that actually knows your body — your height, your weight, how long you've been exercising, what time you prefer to move — resonated strongly with users who had tried and quit generic apps.

**On civic motivation:**
- Among students active in school organizations, a consistent desire existed to contribute to community events and disaster response — but no structured, rewarding platform existed to channel that desire. Informal volunteer work was done, but felt invisible and uncounted.
- Barangay officials and DRRMO staff expressed that the biggest gap in disaster response coordination was the absence of real-time, verified volunteer data. They rely on phone calls and informal networks during emergencies.

**On social motivation:**
- Among 18–25 year old users, social recognition within a peer group was cited as a stronger motivator than individual achievement. Leaderboards that pit them against strangers are ignored; a system where their specific squad or guild can see their contribution is compelling.

### Validation Hypothesis

The core thesis hypothesis, to be tested in the Phase 1 pilot:

> **H1:** Users in the Karela gamification system will maintain physical activity habits at significantly higher rates than baseline (30-day retention ≥ 20%) compared to users of non-gamified step-counting apps.

> **H2:** Users who complete at least one Civic Quest during an emergency window will return to complete a second Civic Quest at a rate ≥ 50%, demonstrating that gamified civic engagement creates habitual civic behavior rather than one-time participation.

**Measurable success criteria for Phase 1:**
- Day 7 retention ≥ 40% (complete the 7-Day Arc)
- Day 30 retention ≥ 20% (reach or approach a 30-day streak)
- 25% of active users complete at least one Civic Quest per month
- Post-session survey: ≥ 65% report "Ani's suggestions felt relevant to me personally"

---

## 6. Core Philosophy

Most fitness apps optimize for peak performance. Karela optimizes for **sustained participation**.

Most civic apps ask users to stop what they are doing. Karela **integrates contribution into motion**.

The key insight driving both systems is the same: **behavior is not static**. A runner's performance fluctuates. A city's infrastructure degrades and recovers. Static systems — static personal bests, static civic maps — fail to model these realities. Karela is built around dynamic, decay-aware, and adaptive representations of both human effort and urban condition.

---

## 7. How Karela Works

The simplest summary: **Karela turns the movement you already do into a game you can win, a community you belong to, and a city you help build.**

Here is the full loop:

```
[User opens Karela]
        ↓
[Ani greets user — context-aware, time-of-day, weather-based]
        ↓
[Ani assigns or suggests a personalized quest]
  (based on body profile, streak status, weather, nearby civic needs)
        ↓
[User begins movement — GPS + accelerometer sensor fusion]
        ↓
[Ghost System activates — live pacing against personal best]
        ↓
[Sector Bonuses earned in real-time — beating Ghost = Gems]
        ↓
[Mission completed]
        ↓
    ┌───┴──────────────────────┐
[Physical Quest]        [Civic Quest]
    ↓                         ↓
[XP + Gems awarded]    [PoI submitted → Vanguard review]
[Streak updated]       [Civic XP + Gems on approval]
[Ghost route updated]  [C Score feeds LGU dashboard]
    └───────────┬─────────────┘
                ↓
[Squad & Guild contribution logged]
        ↓
[Territory Quests updated — Guild map ownership refreshed]
        ↓
[Ani delivers post-mission coaching note]
        ↓
[Streak multiplier increases toward next tier]
```

Every session feeds back into the next. Ani uses the completed session data to calibrate the next quest. The Ghost gets updated. The Guild territory edge gets sharper. The streak multiplier climbs. The loop is designed so that returning tomorrow always feels more valuable than stopping today.

---

## 8. System Architecture

Karela uses a **Local-First, Cloud-Sync** architecture — a deliberate design for the Philippine market where mobile data is expensive, 4G coverage is inconsistent in peri-urban areas, and users frequently operate on prepaid data promos.

### High-Level Platform Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        KARELA PLATFORM                          │
│                                                                 │
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │
│  │    RUNNING ENGINE       │   │      CIVIC ENGINE           │ │
│  │                         │   │                             │ │
│  │  - GPS Spatial Interp.  │   │  - Report Intake (photo,    │ │
│  │  - Effort Decay Model   │   │    GPS, timestamp)          │ │
│  │  - Ghost Calibration    │   │  - Spatial Clustering       │ │
│  │  - Rolling Aggregation  │   │  - Temporal Decay           │ │
│  │  - Pacing Feedback      │   │  - Consensus Verification   │ │
│  └───────────┬─────────────┘   └──────────────┬──────────────┘ │
│              │                                 │                │
│              └──────────────┬──────────────────┘                │
│                             │                                   │
│              ┌──────────────▼──────────────┐                    │
│              │      RESONANCE SYSTEM       │                    │
│              │  (Fusion / Adaptive Layer)  │                    │
│              │                             │                    │
│              │  Stamina State → Civic Load │                    │
│              │  Route → Civic Node Overlay │                    │
│              │  Fatigue → Task Suppression │                    │
│              └─────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

### The Dual-Engine Stack

```
┌─────────────────────────────────────────────────────────┐
│                     USER DEVICE                          │
│                                                         │
│  ┌─────────────────┐      ┌──────────────────────────┐  │
│  │  SQLite (Local) │      │   React Native App UI    │  │
│  │                 │      │                          │  │
│  │ • Raw GPS logs  │◄────►│ • RPG HUD & Map          │  │
│  │ • Step counts   │      │ • Ghost distance meter   │  │
│  │ • Ghost routes  │      │ • Quest feed             │  │
│  │ • Pending PoI   │      │ • Ani dialogue           │  │
│  │ • Offline quests│      └──────────────────────────┘  │
│  └────────┬────────┘                                     │
│           │ Sync on connectivity restored                │
└───────────┼─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (CLOUD)                        │
│                                                         │
│  PostgreSQL: User profiles, XP/Level, Guild state       │
│  Supabase Storage: PoI photos (encrypted, RLS-gated)    │
│  Supabase Auth: Session management (OAuth2 + JWT)       │
│  Edge Functions: Sync reconciliation, fraud detection   │
│  Realtime: Live Guild/Squad state via CDC channels      │
│  PostGIS: Spatial queries for civic node clustering     │
└─────────────────────────────────────────────────────────┘
```

### Offline Sync & Conflict Resolution (Timestamp-Sequence Reconciliation)

When a user completes a run or mission offline, SQLite logs every event with a high-precision ISO 8601 timestamp and a UUID. When connectivity is restored:

1. The client sends its local event sequence to a Supabase Edge Function.
2. The function compares timestamps against the PostgreSQL state.
3. **Mission completions: local wins** — a user who completed a quest offline is never penalized for poor connectivity.
4. **XP/Gem balances: server recalculates** from the event log — not from the client total — preventing local manipulation.
5. **Streak continuity: local timestamp honored** — if the device shows completion before midnight, the streak is preserved regardless of when the sync arrives.
6. **Idempotency: all events carry a UUID** — duplicate sync attempts are silently discarded.

---

## 9. Tech Stack

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

**Why Supabase over Firebase?**
Supabase's PostgreSQL backend unlocks PostGIS — the spatial extension that handles the DBSCAN-inspired civic clustering natively via `ST_DWithin()` queries, eliminating the need for manual epsilon-radius logic in application code. Row-Level Security (RLS) policies replace Firebase Security Rules with standard SQL, making access control auditable and version-controlled. The relational schema is also a better fit for Karela's structured civic data (missions, poi_submissions, vanguard_reviews) than Firestore's document model. Supabase Realtime's Postgres CDC channels replace Firestore's `onSnapshot` listeners with no behavioral difference for the client.

**Why Gemini Flash for Ani?**
Ani's coaching is a high-frequency operation — she interacts with the user at session start, mid-run, and session end, and generates personalized quest suggestions daily. This requires a model that is fast, cost-efficient, and capable of conversational coherence across multiple interactions. Gemini Flash's low latency and cost-per-token make it the right choice for this use case. For Ani's deeper behavioral analysis (weekly recap generation, personalized fitness plan revision), a higher-capability model call is triggered at lower frequency and higher token budget.

---

## 10. The Running Engine — Adaptive Ghost System

### Problem Statement

Existing fitness apps use **static Personal Best (PB) Ghosts** — a replay of the user's best run. This design has a critical flaw: peak runs represent exceptional conditions, not sustainable effort. Over time, users race against a version of themselves they can rarely match, leading to discouragement and dropout.

Karela replaces the static PB Ghost with a **Dynamic Effort Model** — a ghost that represents the user's sustainable threshold, not their ceiling.

---

### 10.1 Spatial Interpolation

**Purpose:** Clean and normalize raw GPS data before any modeling occurs.

GPS signals in urban environments are frequently unreliable. Signal bounce off buildings (urban canyon effect), indoor transitions, and tunnels create positional noise that, if uncorrected, breaks ghost pacing logic.

**What it does:**
- Smooths positional data using interpolation across GPS waypoints
- Fills gaps in route continuity caused by signal loss
- Prevents ghost jumps or teleports that break pacing reference
- Ensures distance-per-segment calculations are spatially accurate

**Output:** A clean, continuous spatial path that downstream models can trust.

---

### 10.2 Effort Decay Function

**Purpose:** Model individual-specific fatigue patterns from historical run data.

This is one of Karela's core algorithmic innovations. Rather than treating fatigue as a universal constant, Karela builds a **per-user Effort Decay Curve** from their historical runs.

**What the model captures:**
- The point in time or distance where the user's pace consistently drops
- How quickly pace deteriorates after the initial fatigue onset
- Whether decay is terrain-triggered (e.g., hills, straight flat roads), time-triggered, or effort-triggered
- Recovery patterns between effort bursts

**Conceptual form of the decay function:**

```
P(t) = P_baseline × e^(−λ × max(0, t − t_fatigue))
```

Where:
- `P(t)` = predicted pace at time `t`
- `P_baseline` = sustainable baseline pace derived from rolling history
- `λ` = individual decay rate (learned from historical runs)
- `t_fatigue` = onset time of fatigue (learned per terrain/conditions)

**Example:**
A user consistently slows 15 minutes into straight, flat road runs. Karela identifies this as a pacing inefficiency (overexertion in the first segment) rather than a fitness ceiling. The ghost is then calibrated to run slightly slower in the first 15 minutes to extend the user's strong-pace window.

---

### 10.3 Reinforcement-Style Ghost Calibration

**Purpose:** Continuously update the ghost based on each new run's outcome.

The ghost is not fixed between runs. After every session, Karela evaluates:

- Did the user beat or miss pace checkpoints?
- At what point did decay begin compared to the model prediction?
- What was the user's weekly recovery state?
- Did recent runs indicate fatigue accumulation or performance gains?

The ghost adjusts accordingly — nudging slightly forward if the user consistently beats it, or pulling back if they are consistently failing checkpoints.

**Ghost Goal:**
> Stay slightly ahead of the user's historical **failure point**, not their peak performance.

This is the key behavioral distinction. A good adaptive ghost provides a challenge the user can realistically overcome with sustained effort — not an aspirational ceiling that demoralizes.

---

## 11. Performance Aggregation Logic

**Purpose:** Build a stable, anomaly-resistant pacing profile for the ghost.

Single-run personal bests are brittle. One exceptional day inflates the ghost; one bad day (injury, weather, sleep deprivation) corrupts the model.

**Karela's aggregation approach:**

1. Collect raw data from all runs over a rolling **4-week window**
2. Group by week and compute **weekly average pacing profiles**
3. Average those weekly profiles into a **composite adaptive PB**
4. Use this composite as the ghost's baseline pacing reference

**Benefits:**
- Resistant to single-run anomalies
- Naturally reflects recovery and fatigue cycles
- Adapts to gradual performance improvement without overreacting
- Prevents overtraining by not chasing anomalous peaks

**Planned enhancements:**
- **Weighted recency scoring:** More recent weeks carry higher weight in the composite
- **Terrain classification:** Separate profiles per terrain type (flat, hilly, trail)
- **Weather influence factor:** Adjust expectations for heat, humidity, rain
- **Fatigue confidence score:** A meta-score indicating how reliable the current ghost baseline is
- **Recovery-state detection:** Identify post-rest performance bumps vs. anomaly runs

---

## 12. The Civic Engine — Distributed Urban Sensing

### Problem Statement

Initial designs for Karela's civic side asked runners to stop and clean or report issues during runs. This was immediately identified as a fatal UX flaw — runners do not want to interrupt their flow state for maintenance tasks.

**Pivot:** The user becomes a **distributed sensor node**, not a janitor.

Karela's civic engine treats the collective movement of runners across a city as a **human sensor array** capable of continuously monitoring and verifying urban conditions without burdening any individual user.

---

### 12.1 Civic Reporting System

**User actions during a run (intentionally low-friction):**
- Quick photo capture
- Single-tap issue categorization (trash, flooding, drain blockage, damaged infrastructure, unsafe area)
- Passive GPS + timestamp + device orientation metadata attached automatically

**Report payload:**
- GPS coordinates (lat/lng)
- Timestamp
- Device orientation (for image context)
- Image evidence
- Issue category tag
- User role context (Scout / Vanguard)

Reports are intentionally minimal to capture. The heavy verification work happens in the backend spatial algorithm, not on the user.

---

### 12.2 Spatial Consensus Algorithm

**Purpose:** Eliminate fake, duplicate, and spam reports without requiring manual moderation.

**Problem:** If civic reports earn XP, users will game the system with false reports.

**Solution:** Multi-user spatial verification using a **DBSCAN-inspired clustering algorithm**, executed server-side via PostGIS `ST_DWithin()` queries on the Supabase PostgreSQL instance.

**How it works:**

1. User A submits a report at coordinate `(lat, lng)` → creates a **Pending Civic Node**
2. The system defines a **spatial radius threshold** around that coordinate
3. If Users B and C independently report the same category of issue within the radius threshold and within a **temporal window**, the node is promoted to a **Verified Civic Quest**
4. Nodes that receive no corroboration within the temporal window expire automatically

**Key parameters:**
- `ε` (epsilon): spatial radius for cluster membership (e.g., 15–30 meters)
- `minPts`: minimum number of independent reports to form a verified cluster (e.g., 3 reports)
- `T_window`: temporal window within which corroborating reports must arrive

**What this prevents:**
- Fake report farming (single user cannot self-verify)
- Duplicate XP exploitation (same report from one user counts once)
- Isolated false positives (single outlier never reaches verification threshold)

---

### 12.3 Temporal Decay Logic

**Purpose:** Keep the civic map accurate and time-relevant.

Urban conditions are not static. A flooded drain is fixed within days. A pile of trash is cleared within a week. A verified civic node that persists for months without reconfirmation is likely stale.

**How it works:**

Every verified civic node is assigned a **confidence score** that decays over time:

```
C(t) = C_0 × e^(−μ × (t − t_verified))
```

Where:
- `C(t)` = confidence score at time `t`
- `C_0` = initial confidence at verification (1.0)
- `μ` = decay rate (tunable per issue category — structural damage decays slower than trash)
- `t_verified` = timestamp of initial verification

**Reconfirmation resets the decay:** If a runner passes and taps "Still There," the confidence score resets to `C_0`.

**Node lifecycle:**

```
Pending → Verified → Aging → Expired
                 ↑         |
                 └─────────┘ (reconfirmed)
```

**Benefits:**
- Prevents stale data from polluting the civic map
- Creates passive incentive for runners to reconfirm existing nodes
- Enables LGUs to trust the freshness of received data
- Scales cleanly to dense urban environments

---

## 13. User Roles

Karela does not assign civic tasks uniformly. The Resonance System (see Section 14) uses fatigue state to determine which role mode is contextually appropriate.

### Scout (Passive Contributor)

Intended for high-intensity runners in active workout mode.

**Civic actions:**
- One-tap issue flag
- Quick photo snapshot
- "Still There / Cleared" reconfirmation tap while passing a node

The Scout's contribution is volume and coverage. They act as sensor nodes across large distances without stopping.

### Vanguard (Active Contributor)

Intended for walkers, cooldown phases, or low-intensity sessions.

**Civic actions:**
- Detailed issue verification
- Actual minor cleanup (litter pickup)
- Extended photo documentation
- Community participation tasks (multi-step quests)

The system assigns Vanguard tasks contextually — a user transitioning from a hard run into a cooldown walk may be prompted with a nearby Vanguard task since their physical load has dropped.

**Becoming a Vanguard:**

| Requirement | Specification |
|---|---|
| Minimum Level | Level 15 (~90–120 days of consistent use) |
| Civic XP Threshold | 500 Civic XP from personal Bayanihan completions |
| Clean Record | Zero Black Marks in past 90 days |
| Application | Automatic eligibility notification — voluntary acceptance, no form required |
| Regional Cap | Max 1 Vanguard per 50 active users in a zone |

**Anti-Collusion Governance:**
- Blind assignment — Vanguards never review submissions from their own Guild or Squad.
- Geographic separation — submissions assigned to Vanguards in a different barangay wherever possible.
- 2/3 split triggers a 4th Vanguard as tiebreaker.
- Fraud Ring Detection — if 3 socially-connected Vanguards all approve the same submission, it is auto-flagged for admin review.
- Vanguards with Review Accuracy Score below 70% are temporarily suspended.

**Anti-Fraud QR Specification:**
- Dynamic Rotating QR — regenerates every 15 minutes with a time-bound, single-use token.
- Geofence Confirmation — GPS must be within 50m of the Quest Node coordinate at moment of scan.
- Single-Use Token — duplicate scans (screen sharing, photos) are rejected server-side.

---

## 14. The Resonance System — Fusion Layer

The Resonance System is **Karela's defining innovation**. It is the layer that makes Karela more than the sum of its two engines.

**Core concept:** The running algorithm and the civic algorithm are not independent. They share a bidirectional influence relationship mediated by the user's current physical state.

**Fusion logic:**

| User State | Resonance Response |
|---|---|
| High stamina, early run | May route ghost near civic verification zones |
| Mid-run, stable pace | Passive reconfirmation prompts ("Still there?") |
| High fatigue detected | Civic interaction requests suppressed entirely |
| Cooldown phase | Vanguard task suggestions surface nearby |
| Post-run recovery walk | Full Vanguard mode enabled |

**Why this matters:**

Civic contribution becomes **adaptive** rather than forced. The system never asks a runner at their physical limit to stop and photograph a drain. It reserves that request for the moment when the user is already slowing down and has cognitive and physical bandwidth to spare.

This fusion is what elevates Karela from a "fitness app with a report button" to a genuine behavioral optimization system.

**Fusion logic model:**

```
civic_load(t) = f(stamina_score(t), route_proximity(t), role(t))

where:
  stamina_score(t) = 1 − normalized_fatigue_index(t)
  role(t)          = Scout if stamina_score > threshold, else Vanguard
  civic_load(t)    = 0 if stamina_score < suppression_threshold
```

**Research claim:** A stamina-aware civic interaction system produces higher civic participation rates without reducing exercise performance metrics, compared to a system that presents civic prompts uniformly regardless of user physical state.

---

## 15. Route-Based Civic Integration

The ghost route is not purely fitness-optimized. When the Resonance System determines that the user has sufficient capacity, the ghost path can be subtly adjusted to:

- Pass through **active civic nodes** for passive reconfirmation
- Route through **verified issue clusters** for coordinated community verification
- Suggest **cooldown detours** that overlap with Vanguard tasks

**Examples in practice:**

- Running past a node → "Still there?" tap appears; user can respond without stopping
- Ghost enters cooldown phase near a high-confidence node → Vanguard cleanup prompt appears
- Route options presented at junction → one option flagged as passing through a civic priority zone

**Design constraint:** Civic routing must never materially harm the fitness experience. Ghost deviations for civic purposes should be within acceptable distance and pace margins.

---

## 16. Ani — Your AI Coach

Ani is Karela's personalized AI coach and the feature that most fundamentally separates Karela from every other fitness app available to Filipino users.

### What Makes Ani Different

Every major fitness app has some form of coaching. What they all share is that the coaching is generic — the same 5km suggestion for a 55kg student and a 90kg office worker, the same "rest day" recommendation regardless of whether you slept 4 hours or 8, the same push notification regardless of whether it's typhoon season or dry season in Cagayan Valley.

Ani knows who you are. Not in a surveillance sense — in a coaching sense. She knows your body profile, your history with the app, your preferred time to move, the weather in your specific city, and whether your streak is at risk. Every message she sends and every quest she generates is built from that context.

### Ani's Data Model

At account creation and during the onboarding assessment, Ani builds a user profile:

```
ani_profile (stored in Supabase PostgreSQL users table, referenced on every Ani call)
├── body_profile
│   ├── height_cm          FLOAT
│   ├── weight_kg          FLOAT
│   ├── age                INTEGER
│   ├── biological_sex     TEXT      'male' | 'female' | 'prefer_not_to_say'
│   └── fitness_baseline   TEXT      'sedentary' | 'lightly_active' | 'moderately_active'
├── behavioral_profile
│   ├── preferred_time     TEXT      'morning' | 'afternoon' | 'evening'
│   ├── avg_daily_steps    INTEGER   Rolling 7-day average from SQLite
│   ├── streak_current     INTEGER
│   ├── longest_streak     INTEGER
│   ├── completion_rate    FLOAT     Missions completed / missions assigned, last 30 days
│   └── civic_engagement   FLOAT     Civic quests / total quests, last 30 days
├── context_profile
│   ├── city               TEXT      Tuguegarao, Manila, etc.
│   ├── current_weather    JSONB     Fetched from OpenWeatherMap at session start
│   ├── bayanihan_tier     INTEGER   Current safety tier (0–4)
│   └── guild_territory    TEXT[]    Landmarks the user's Guild is contesting
└── progression_profile
    ├── level              INTEGER
    ├── xp_current         INTEGER
    ├── gems               INTEGER
    └── recent_hotspots    JSONB     Areas with frequent GPS activity
```

### What Ani Does

**1. Personalized Quest Generation**

Ani does not assign the same quest to every user. She generates missions based on body profile and history:

- A sedentary user at fitness baseline is never assigned a 5km run on Day 1. Ani starts with a 500m walk and scales based on completion history.
- A user who has logged 10km walks consistently for 14 days will receive quests that push toward 12km or introduce a time challenge.
- A user with a high civic engagement rate gets Civic Quests surfaced earlier and more frequently.
- Quest distance targets are calibrated to the user's rolling average — always set at 110% of comfortable current output, never at a generic fixed standard.

**2. Body-Aware Coaching Messages**

Ani's post-session messages reference actual body data:

- *"At your current weight and pace, today's 2.3km walk burned approximately 180 kcal. You've now hit this target 6 days in a row — your body is adapting. Let's add 200m tomorrow."*
- *"Your resting step rate suggests you might be carrying fatigue. Today's quest is a light 800m — consistency matters more than distance right now."*

Ani does not pretend to be a medical professional. She uses language like "approximately" and "suggests" for estimates, and her coaching messages include a one-time disclosure that her recommendations are for general wellness and not a substitute for medical advice.

**3. Context-Aware Greetings and Motivation**

At session start, Ani generates a message using time of day, weather, streak status, and city context:

- *"Good morning, Rina! It's 7:30 AM in Tuguegarao — light winds, 26°C. Perfect for your morning route. Your 11-day streak is one of your best. Let's make it 12."*
- *"Hey Juan — it's been a rough few days weather-wise. Your streak is still alive with 4 hours left. Even a 10-minute walk around the block counts today. I've got a simple one queued."*

**4. Weekly Fitness Plan**

Every Sunday, Ani generates a 7-day personalized plan: daily distance targets, rest day recommendation, one challenge day, and one civic quest. The plan is adjusted mid-week if the user's completion rate drops significantly or if a Bayanihan Protocol event is active.

**5. Post-Mission Recap**

After every completed session, Ani delivers a 2–3 sentence recap:
- What was achieved (distance, XP, Gems)
- One observation about performance vs. recent history
- One prompt toward tomorrow's quest

### Ani's Limitations (Honest Design)

Ani is a language model running on general wellness knowledge, not a licensed nutritionist, physiotherapist, or doctor. She is explicit about this. She does not:
- Prescribe caloric deficits or weight loss targets
- Diagnose injury or recommend treatment
- Override a user's stated medical conditions

If a user mentions an injury or medical condition during setup, Ani acknowledges it and defaults to low-impact quest suggestions, always recommending consultation with a health professional for specific guidance.

---

## 17. RPG Mechanics

### XP, Leveling & The Momentum Multiplier

Every user needs exactly **1,000 XP to level up** — at every level. The UI displays progress as `XP % 1000`. This makes progression clear and infinitely scalable without power creep.

The Streak Multiplier rewards consistency over intensity:

| Streak Window | XP Multiplier |
|---|---|
| Day 1–3 | 1.0x (baseline) |
| Day 4–6 | 1.2x |
| Day 7–13 | 1.5x |
| Day 14–29 | 2.0x |
| Day 30+ | **3.0x (Consistency Cap)** |

Breaking a streak resets the multiplier to 1.0x immediately — creating a meaningful psychological incentive to maintain the habit. The deliberate design choice here is that a 3.0x cap exists: no user can ever gain more than 3× base XP rate, which prevents the game from becoming about maximizing multipliers rather than moving.

### The Ghost System (Asynchronous Specter)

The Ghost is a data-shadow of the user's personal best on a given route, used for real-time pacing comparison. It is the primary self-improvement mechanic — you are not competing against strangers; you are competing against the best version of yourself.

**Route matching** is dynamic — not pre-mapped. A route is identified by a bounding box hash with ±50m tolerance. Two runs are considered the same route if their bounding boxes overlap by at least 70%.

**Ghost data model:**
```
ghost_routes table (SQLite)
├── route_id         → Bounding box hash (TEXT PRIMARY KEY)
├── best_time_seconds
├── best_distance_m
├── waypoints_json   → [{lat, lng, elapsed_seconds}] sampled every 5 seconds
├── achieved_at      → ISO 8601 timestamp
└── synced_to_cloud  → 0 or 1 (top 10 routes synced to Supabase)
```

**Fallback hierarchy (when no personal best exists):**

1. **Personal Ghost** — user's own best time (always preferred)
2. **Squad Ghost** — best time by any Squad member on this route (opt-in)
3. **Community Ghost** — median pace of all users in the same Level band (±3 levels) on similar route lengths
4. **Ani Pacer** — a generated "Beginner Ghost" based on the onboarding fitness assessment, targeting 10% above comfortable walking pace

**UI rendering:**
- 🟢 Green pulsing dot = user is **ahead** of Ghost
- 🔴 Red pulsing dot = user is **behind** Ghost
- Live HUD: *"Ghost is 42m behind you"* or *"You are 18m behind Ghost"*
- Every 500m segment = a **Sector**. Beating the Ghost in a sector awards **5 Gems**.

### The Dual Currency Economy

| Property | XP | Gems |
|---|---|---|
| Primary Source | Distance (1 XP / 10m) + mission bonus | Sector Bonuses (5), B2B scans (20), Vanguard reviews (10) |
| Multiplied By | Streak Multiplier (1.0x–3.0x) | Flat rate — not multiplied |
| Spendable? | Never | Yes |
| Primary Use | Leveling, Vanguard eligibility | Streak Freezes, Squad Shields, cosmetics |

**Gem sinks (preventing inflation):**

| Item | Cost | Effect |
|---|---|---|
| Streak Freeze | 80 Gems | Protects streak for 1 day |
| Squad Shield | 200 Gems | Pooled by Squad to protect a teammate's streak |
| Territory Defense Boost | 150 Gems | 1.2× Guild distance multiplier for 24 hours |
| Map Trail Cosmetics | 300–600 Gems | Permanent visual customizations |

**Seasonal cap:** Gems above 500 at season-end convert to non-spendable Legacy Tokens. This hard-caps the max advantage any user can accumulate, preventing a pay-to-win dynamic from emerging through the Scout Pass.

---

## 18. Sensor Fusion & Anti-Cheat

### Outdoor Mode — The Double Lock

Movement is recorded only when two independent signals agree:

1. **GPS Displacement** — net movement of at least 3 meters between consecutive 2-second samples
2. **Accelerometer Cadence** — rhythmic oscillation consistent with walking (1.5–3.5 Hz) or running (2.5–4.5 Hz)

GPS movement without accelerometer cadence (e.g., a car ride) is flagged. Accelerometer cadence without GPS displacement triggers an Indoor Mode prompt.

### Indoor Mode — Treadmill & Indoor Walking

- **Step Detection:** Accelerometer sampled at 50Hz. Peak-detection identifies each step via Z-axis acceleration signature (heel strike peak + toe-off secondary peak)
- **Stride Calibration:** 20-step calibration walk on first use. `Stride Length = GPS distance / step count`. Refined over time via moving average stored in SQLite.
- **Distance:** `Distance = Step Count × Stride Length`

### The Integrity Filter — Anti-Cheat

| Detected Pattern | Signal | Action |
|---|---|---|
| Phone shaking in place | G-force >4G, no net displacement, irregular frequency | Data discarded; no XP awarded |
| Vehicle movement | GPS speed >25 km/h sustained >30 seconds | Auto-pause; user prompted to confirm mode |
| GPS teleportation | GPS jumps >500m in a 2-second interval | Waypoint discarded; no XP for that interval |
| Stationary GPS jitter | Displacement <3m over 10s despite accelerometer inactivity | Data discarded; run paused after 60s |

**Battery optimization:** GPS sampling rate scales dynamically — 1-second intervals during active movement, 5-second intervals during low-cadence periods (slow walking), and suspended during stationary periods exceeding 60 seconds. This reduces battery drain by approximately 30–40% compared to constant-rate GPS logging.

---

## 19. Onboarding & The First 7 Days

The cold start problem is Karela's most critical UX challenge: a new user has no Ghost, no Squad, no Guild, and no streak. The First 7 Days protocol ensures every new user feels rewarded within their first **5 minutes**.

### First 5 Minutes Flow

1. **Ani greets the user** with a context-aware, time-of-day message: *"Good morning, Juan! Tuguegarao looks clear today — perfect for your first quest."*
2. **3-minute fitness calibration** — height, weight, fitness level, preferred activity time, primary motivation (Health / Community / Social). This data immediately personalizes Ani's first quest.
3. **Immediate first quest** — Ani assigns a 500m walk calibrated to the user's baseline. No tutorial video. It starts now.
4. **Permission grants** with plain-language justifications tied to specific features: *"Location is used to track your route and connect you with nearby Squads — never shared without your permission."*
5. **Welcome Bonus** — completing the 500m walk earns 100 XP + 20 Gems. The level bar jumps visibly. Ani comments on it personally.

### The 7-Day Guided Quest Arc

| Day | Quest | Ani's Goal |
|---|---|---|
| 1 | *First Step* — 500m walk | Prove the app works. Seeds the first Ghost. |
| 2 | *Neighborhood Scout* — 1km, map 3 landmarks | Introduce the map layer. Unlock Squad invites. |
| 3 | *The Daily Route* — repeat Day 1 route | Introduce Ghost concept. First Sector Bonus eligible. |
| 4 | *Community Eye* — photo a local issue (pothole, drain) | Introduce Bayanihan mechanic gently. +50 Gems. |
| 5 | *Squad Up* — invite 1 person or join a Squad | Unlock social layer. 'Founding Member' badge if new Squad. |
| 6 | *The Push* — beat Day 3 Ghost by any margin | Introduce competitive self-improvement. 1.2× preview. |
| 7 | *Week Warrior* — complete any 1km+ mission | Earn first streak milestone. **1.5× multiplier unlocked.** |

On Day 7, Ani delivers a personalized shareable summary card — organic marketing built into the onboarding loop. The card shows the user's 7-day stats, their first Ghost time, and their Civic contributions, formatted for sharing to Facebook, Instagram, and Viber.

---

## 20. Social Infrastructure

### Squads (3–12 Members) — The Inner Circle

Small accountability groups. The primary social unit of Karela.

**Formation:** Any Level 2+ user can create a Squad. Discovery is via geographic proximity (majority of members within 5km) or mutual friend suggestion.

**The Collective Shield — Karela's signature Bayanihan mechanic:**

When a Squad member's streak is at risk (less than 6 hours left in the day, no mission completed):

1. All Squad members receive: *"Juan's 14-day streak is at risk! Help him out?"*
2. Any member can contribute Gems toward a Shield (total cost: **200 Gems**, splittable among members).
3. The Shield freezes Juan's streak for 24 hours — at no cost to Juan's own Gem balance.
4. Protected member receives: *"Your Squad has your back! Maria, Carlo, and 2 others protected your streak."*

This mechanic is the most direct digital expression of Bayanihan in the platform. It transforms an individual metric (streak) into a community responsibility.

**Squad Vision:** Optional real-time location sharing (opt-in, revocable anytime) shows active Squad runners on the map.

### Guilds (50+ Members) — The Regional Force

Large regional organizations competing for landmark territory.

**Territory Quest Specification:**

| Property | Detail |
|---|---|
| Zone Definition | 250m radius circle around a landmark's GPS coordinate |
| Scoring Period | Monthly — resets 1st of each month at 00:00 local time |
| Scoring Metric | Total verified distance (km) by Guild members whose GPS tracks pass through the zone |
| Tie-Breaking | Higher member count → earlier first entry into zone |
| Ownership Display | Winning Guild's banner (color + name) renders on the map for the following month |
| Mid-Month Contest | A landmark can be challenged if a Guild logs 150% of the leader's distance in a single week |
| Inactive Forfeiture | Zero activity in the zone for 14 consecutive days → landmark becomes Unclaimed |

**Guild Badges & Permanent Buffs:**

| Badge | Threshold | Buff |
|---|---|---|
| Pioneer | First landmark claim | +2% XP for all members for 30 days |
| Century Walkers | 1,000 km total Guild distance | +5% Gem earning rate (permanent) |
| The Vanguard Guild | 10 Vanguard-level members | +10% PoI approval speed (permanent) |
| Bayanihan Heart | 50 verified Civic Quests | Exclusive Guild map theme |
| Iron Streak | Every member maintains a 7-day streak simultaneously | 500 Gems split equally among members |

---

## 21. The Bayanihan Protocol

The feature that fundamentally differentiates Karela from every fitness app in the global market. It transforms the platform from a personal health tool into **civic infrastructure** — a verified volunteer coordination system that generates real, exportable data for local governments during and after disaster events.

### The Safety Hard-Lock — Ani as the Ethical Gatekeeper

Karela must never be the reason a user puts themselves in danger. The Safety Tier system is non-negotiable and overrides all other app functions.

| Tier | Trigger | App Behavior |
|---|---|---|
| Tier 0: Normal | No weather advisory; no admin flag | All features active |
| Tier 1: Watch | Wind >40 km/h OR rainfall >10mm/hr | Outdoor missions flagged with caution. Ani suggests indoor alternatives. |
| Tier 2: Warning | PAGASA Signal 2–3 OR admin Pre-Disaster | Outdoor missions suspended. Only indoor Preparation Quests active. Ghost paused. Emergency banner. |
| Tier 3: Hard Lock | PAGASA Signal 4–5 OR admin Emergency Lock | **All movement rewards disabled.** GPS tracking suspended. Only Safety Check-in and Request Assistance visible. Gems awarded for staying safe. |
| Tier 4: Recovery | Admin marks zone Yellow or Green | Recovery Quests unlock in cleared zones only. PoI required for all civic missions. |

> **PAGASA Integration Note:** PAGASA does not currently provide a public REST API. Tier 2–4 escalation is a hybrid system: OpenWeatherMap handles Tier 0–1 automatically; a Karela Admin or verified LGU coordinator manually escalates to Tier 2–4 using official PAGASA bulletins. A PAGASA webhook partnership is a Phase 4 roadmap milestone.

### Quest Timeline — Before vs. After

**Phase A: Preparation Quests (24–72 hours before event)**

| Quest | Description | Proof Required |
|---|---|---|
| Clear the Drainage | Clean the gutter in front of your home or street | Before/After photo |
| The Supply Run | Help an elderly neighbor buy 3 days of water/canned goods | Receipt photo + neighbor confirmation QR |
| Home Fortify | Help 3 neighbors install window shutters | Group photo with visible shutters |
| Evacuation Route Scout | Walk and photograph the official barangay evacuation route | GPS-tagged photo trail |

**Phase B: Recovery Quests (post-event, cleared zones only)**

| Quest | Description | Proof Required |
|---|---|---|
| Debris Clearing | Clear fallen branches from a public sidewalk | Before/After GPS-tagged photo |
| Information Scout | Report passability of a specific bridge/road | Photo + GPS (feeds LGU dashboard) |
| Relief Hub Support | Help sort goods at an evacuation center | Node Master QR at arrival + departure |
| Wellness Check | Visit 3 vulnerable neighbors to confirm safety | In-app photo with each neighbor |
| Water Source Report | Report status of a community water source | GPS-tagged photo (feeds LGU water map) |

### Proof of Impact — Multi-Factor Verification

1. **In-App Camera Only** — gallery uploads are blocked to prevent submission of old photos.
2. **Before & After Split-Screen** — dual-capture enforced for cleanup and fortification quests.
3. **Metadata Fingerprint** — every photo tagged with exact GPS, altitude, device ID, and a **server-generated timestamp** (not device clock).
4. **Vanguard Blind Audit** — 3 independent Vanguards from outside the submitter's Guild must all approve before XP and Gems are released.
5. **Node Master QR (major missions)** — dynamic QR rotating every 15 minutes; scanned at arrival and departure to verify presence and duration.

---

## 22. Reward Architecture

**Design principle:** Immediate feedback with delayed validation.

Karela's reward system is structured to balance user motivation against anti-exploit integrity.

**Immediate (on report submission):**
- Small XP granted immediately
- "Report captured. Verifying…" confirmation
- Keeps the user engaged without waiting

**Delayed (on consensus verification):**
- Larger XP reward unlocked after spatial consensus is reached
- "Quest confirmed. +500 XP." notification
- Creates a genuine sense of community impact

**Anti-cheat systems:**
- Image hashing for duplicate photo detection
- Spatial deduplication (same location, same user, same day = one report)
- Consensus requirement prevents solo farming
- Verification windows prevent old reports from being recycled

**Effect:** The reward loop reinforces both persistence (keep running, keep reporting) and integrity (your report only pays off if it's real).

---

## 23. Data Privacy & RA 10173 Compliance

Karela is designed to comply with the **Philippine Data Privacy Act of 2012 (Republic Act 10173)** and its Implementing Rules and Regulations.

### Data Minimization

| Data Type | How Karela Minimizes Collection |
|---|---|
| Raw GPS Coordinates | Processed on-device only. Only mission check-in coordinates (start, end, zone entry) sent to Supabase — not the full trail. |
| Accelerometer Data | Never stored or transmitted. Discarded after real-time step counting and anti-cheat detection. |
| PoI Photos | Stored in Supabase Storage with Row-Level Security policies. Only the owner and assigned Vanguards can access a specific photo. |
| Location History | Leaderboards show total distances and Level only — never location data. |
| Device Identifiers | Used only for Ghost restoration and fraud ring detection. Never shared with B2B partners. |
| Body Profile (height, weight) | Stored in PostgreSQL under the user's account. Never shared with B2B partners. Used exclusively by Ani. |

### User Privacy Controls

- **Privacy Zones:** Up to 5 "Blur Zones" (100m radius) around any location. GPS trails inside these zones are never stored — not even in SQLite.
- **Location Sharing:** Squad Vision is opt-in, off by default, revocable at any time.
- **Data Deletion:** Full account deletion within 72 hours of request, per RA 10173. Supabase cascading deletes ensure all related records (missions, poi_submissions, ghost_routes sync) are purged.
- **Consent:** All permissions granted with plain-language justifications; revocable at OS level without account penalty.
- **Ani's data use:** Users are explicitly informed during onboarding that body profile data (height, weight, fitness level) is used exclusively to personalize Ani's coaching and is never shared with third parties or used for advertising.

### B2B Partner Data Policy

Partners **receive:** aggregate foot traffic counts, voucher redemption counts, time-of-day visit distribution.

Partners **never receive:** individual user names, IDs, GPS trails, movement history, Level, Squad membership, body profile, or any personally identifiable information.

**NPC Registration:** Karela will register with the National Privacy Commission as a personal information controller prior to public launch, as required by RA 10173.

---

## 24. Business Model

### Monetization Streams

**Stream 1 — Local Hero (B2B Quest Nodes)**

SMEs pay a monthly subscription to become a gamified destination on the Karela map.

| Tier | Monthly Fee | Features |
|---|---|---|
| Starter Node | ₱500/mo | Single map pin, 1 QR code, monthly aggregate foot traffic report |
| Active Node | ₱1,500/mo | Highlighted pin with logo, weekly reports, 1 featured Double XP promo/month |
| Anchor Node | ₱3,500/mo | Premium placement, real-time dashboard, unlimited promos, priority in Ani's mission suggestions |

**Stream 2 — The Scout Pass (Seasonal Subscription)**

90-day seasonal battle pass at **₱149/season**.

Benefits: exclusive Ani skins, rare map trail cosmetics, +20% Gems from Sector Bonuses, early access to new quest types, season badge. All cosmetics earned are **permanent** — users keep their content when the season ends. Only the +20% Gem rate expires.

**Stream 3 — LGU / NGO White-Label (B2G)**

Licensing the volunteer coordination infrastructure to Local Government Units and NGOs.

Pricing: **₱15,000–₱50,000/year** depending on LGU population size.

This is the primary thesis for institutional sustainability — once an LGU coordinates a disaster response through Karela, it becomes civic infrastructure that is very difficult to replace.

---

### Unit Economics

**Cost breakdown per active user per month (estimated):**

| Cost Category | Estimated Monthly Cost (per MAU) |
|---|---|
| Supabase PostgreSQL (reads/writes) | ~₱2–6 (scales with activity; Supabase free tier covers early MAU) |
| Supabase Storage (PoI photos) | ~₱1–3 (only for civic users) |
| Gemini Flash API (Ani coaching) | ~₱2–6 (5–10 Ani interactions/day at 500–1,000 tokens/call) |
| OpenWeatherMap API | ~₱0.50 (shared call per city, amortized) |
| Expo push notifications | Free tier covers first 1,000 MAU |
| **Total estimated cost per MAU** | **~₱6–16/month** |

**Revenue per paying user:**

| Tier | Monthly Revenue | Margin at 1,000 MAU |
|---|---|---|
| Free user | ₱0 | -(₱6–16) |
| Scout Pass (₱149 / 3 months) | ~₱50/month amortized | +₱34–44/month |
| B2B Node (₱1,500/mo, shared across visits) | ~₱1.50 per user visit | Additive |

**Break-even analysis:**

At 5% conversion from free to Scout Pass, a base of 1,000 MAU yields 50 paying users. Scout Pass revenue: ₱2,500/month. Infrastructure cost for 1,000 MAU: ₱6,000–16,000/month. Scout Pass alone does not cover costs at this scale.

**The B2B and B2G tiers are the sustainable model.** Five Anchor Node B2B partners (₱3,500/mo each) generate ₱17,500/month — covering the full infrastructure cost of 1,000 MAU. One LGU white-label contract (₱15,000/year = ₱1,250/month minimum) adds further stability. The consumer Scout Pass is a margin layer, not the foundation.

**Path to profitability:**
- Phase 1 target: 5 B2B partners in Tuguegarao + 500 MAU → break-even or slight positive
- Phase 2 target: 30 B2B partners across 3 cities + 5,000 MAU + 1 LGU contract → ₱50,000+ MRR
- Phase 3 target: 100+ B2B partners + 3 LGU contracts + 20,000 MAU → sustainable growth unit economics

**Conversion rate assumption:** Philippine mobile app free-to-paid conversion is estimated at 2–4% for lifestyle apps. Karela's Scout Pass at ₱149/season (~₱50/month) is deliberately priced below the threshold where price becomes a barrier for a working student — comparable to a single milk tea purchase.

---

### Philippine Market Context

**The low-end Android reality.** The majority of Filipino smartphone users operate on mid-range Android devices with 2–3GB RAM, 32GB storage, and prepaid data plans of ₱99–₱299 per week. Karela's SQLite-first architecture, batch sync, and minimal UI render budget are direct responses to this — not afterthoughts.

**The prepaid data constraint.** Many Filipino users operate on timed data promos (e.g., "All-net 1GB for 24 hours") rather than unlimited plans. Karela's offline-first design means users lose no functionality when their promo expires mid-run. Data is consumed only on sync, not during active movement.

**The social media integration opportunity.** Filipinos rank among the highest global users of Facebook, TikTok, and Viber. The Day 7 summary card, Guild territory announcements, and milestone Feathers are all designed to be shareable to these platforms — driving organic acquisition through peer visibility.

**The disaster-preparedness gap.** The Philippines experiences an average of 20 typhoons per year, with Cagayan Valley among the most frequently affected regions. There is no existing consumer app that prepares communities for typhoons while also being a daily health platform. Karela's Bayanihan Protocol occupies this space uniquely.

---

## 25. Go-To-Market Strategy

### Beachhead Market

The initial launch targets **Tuguegarao City, Cagayan** — a mid-sized regional center with a large university population (Cagayan State University, University of Cagayan Valley), a strong community identity, a history of typhoon impact, and a reachable local government partner network.

Tuguegarao is chosen over Metro Manila for the launch because:
- Lower competition for user attention and media coverage
- Tighter community network effects (Guilds forming between people who know each other)
- Direct access to the LGU and barangay network for Bayanihan Protocol pilots
- The Ibanag and Cagayano cultural context maps directly onto the Bayanihan mechanic

### Channels

**Individual acquisition:**
- Direct outreach to Cagayan State University and University of Cagayan Valley student organizations (JPIA, engineering councils, civic orgs)
- Tuguegarao Facebook community groups (Mga Taga-Tuguegarao, local buy-sell groups for community reach)
- Local influencer activation — micro-influencers (1,000–10,000 followers) in Cagayan fitness, lifestyle, and civic content. Authentic, not paid-advertisement tone.
- Physical presence: flyers at popular walking routes (Peniel Beach, CSU campus perimeter), QR codes at tricy stops linking to the app

**Institutional acquisition:**
- Barangay captain outreach — Tuguegarao has 68 barangays; 5–10 early adopter barangay captains as "Karela Barangay Champions" provides both users and civic credibility
- CDRRMO (City Disaster Risk Reduction and Management Office) partnership for Bayanihan Protocol pilot — a single letter of support or MOU dramatically strengthens the thesis and the competition submission
- B2B sales to local SMEs along high-foot-traffic walking routes (coffee shops, convenience stores, pharmacies near CSU) — 5 Quest Nodes at launch creates a destination economy within the app from day one

**Launch event:**
A "Karela Citywide Quest" — a one-day event where registered users complete a series of walking missions across Tuguegarao landmarks simultaneously. The collective Guild distances are tallied live. The top Guild gets their banner on every landmark in Tuguegarao for the first month. This event is designed to generate local media coverage, social media sharing, and first-day Guild formation.

---

## 26. Competitive Moat & Defensibility

**What stops Strava, Google, or a well-funded EdTech from building this in six months?**

The honest answer is that the individual mechanics — GPS tracking, gamification, quests — are not technically unique. The moat is built from three sources:

**1. The hyper-local territory network effect.**
Once a Guild claims Tuguegarao Plaza, the city park, and the CSU oval, every new user in Tuguegarao opens the map and sees their neighbors' banners. This creates social pressure to join, form a Guild, and participate — which locks in the local user base before any competitor can enter. A global app launching in Tuguegarao has no landmarks claimed, no Guilds formed, and no social anchor. The territory system creates a local network effect that cannot be replicated with money alone — it requires time and local users.

**2. The civic data moat.**
Over time, Karela accumulates a verified dataset of civic volunteer activity, mapped to geographic coordinates, timestamps, and before/after photo evidence. This dataset is uniquely valuable to LGUs, NGOs, and disaster response agencies. No competitor has it. The longer Karela operates, the richer this dataset becomes, and the more dependent institutional partners become on it.

**3. Institutional lock-in.**
An LGU that coordinates one disaster response through Karela's Admin Panel and Bayanihan Protocol has invested in the workflow, trained staff on it, and produced reports using it. Switching to a different platform means starting over — with no historical civic data and no trained users. Institutional inertia is a real and durable competitive advantage.

**4. Ani's behavioral model.**
Ani's personalization improves with every session. A user who has logged 6 months of movement data with Ani has built a coaching relationship that no competitor can replicate on day one of a competing app. The longer a user stays, the harder it becomes to leave.

---

## 27. Notification Architecture

| Notification | Trigger | Timing | Example |
|---|---|---|---|
| Daily Mission Reminder | No app open by preferred activity time | Within 30 min of preferred time | *"Hey Juan, your 14-day streak is waiting. Just 10 minutes is all it takes."* |
| Streak at Risk | <3 hours left in day, no mission done | 3 hours before midnight | *"Emergency! Your streak ends in 3 hours. A quick 5-minute walk counts."* |
| Squad Shield Alert | Squad member's streak is at risk | Same as streak-at-risk | *"Maria's 21-day streak is at risk. Your Squad can save it with a Shield."* |
| Streak Freeze Reminder | User has unused freezes and streak is at risk | 2 hours before midnight | *"You have 2 Streak Freezes saved. Use one now?"* |
| Territory Alert | Rival Guild within 80% of your territory distance | Checked hourly | *"Cagayan Runners Guild is closing in on your territory at Tuguegarao Plaza."* |
| Bayanihan Protocol | Emergency Mode activated | Immediate, high-priority | *"IMPORTANT: Bayanihan Protocol is now active for Cagayan Valley."* |
| Weekly Summary | Every Sunday, 6:00 PM | Fixed schedule | Ani: *"Your Week in Review — X km walked, X quests completed, Day X streak."* |
| Ani Weekly Plan | Every Sunday, 7:00 PM | Fixed schedule | *"Here's your plan for the week ahead, tailored just for you."* |

**Fatigue Prevention:**
- Quiet Hours window (default 10 PM – 7 AM) — only emergency alerts pass through.
- Squad activity notifications are batched (max once per day).
- Low-engagement users auto-downgrade to 1 daily summary only.
- Users who have not opened the app in 7+ days receive only one re-engagement message per week, not daily.

---

## 28. Accessibility

### Physical Accessibility

Non-running users can participate fully through:
- Civic Intelligence Quests (photographing/reporting local issues from any position)
- Vanguard review work (entirely sedentary)
- Community Wellness Checks and Relief Hub Support
- Indoor Mobility Quests (step-count based targets, not distance)

**Roadmap — Phase 3:** A dedicated "Community Hero" mode for users with limited mobility, replacing all distance-based XP with task-based flat XP per civic action. This ensures that a wheelchair user, an elderly neighbor, or a person with a temporary injury can contribute to their Guild and earn Feathers without a single meter of walking.

### Visual Accessibility

- Ghost system red/green color coding is **supplemented by shape** (circle = ahead, triangle = behind) — no information is conveyed by color alone.
- OS-level text size settings are respected throughout.
- High-contrast map theme available for low-vision users.

### Language & Literacy

- **Launch:** English primary interface.
- **Phase 2:** Filipino (Tagalog) localization.
- **Phase 3:** Ibanag localization for the Tuguegarao pilot market, in partnership with Cagayan State University's language faculty.
- Core actions (Start Run, Complete Quest, Check In Safe) are accessible via large icon-based buttons — no reading required for primary functions.

---

## 29. Database Schema

### Supabase PostgreSQL Tables (Cloud)

<details>
<summary><strong>users</strong></summary>

```sql
CREATE TABLE users (
  uid                   UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name          TEXT,
  level                 INTEGER DEFAULT 1,
  xp_total              INTEGER DEFAULT 0,
  xp_current_level      INTEGER GENERATED ALWAYS AS (xp_total % 1000) STORED,
  gems                  INTEGER DEFAULT 0,
  streak_current        INTEGER DEFAULT 0,
  streak_longest        INTEGER DEFAULT 0,
  streak_freeze_count   INTEGER DEFAULT 0,
  squad_id              UUID REFERENCES squads(squad_id),
  guild_id              UUID REFERENCES guilds(guild_id),
  is_vanguard           BOOLEAN DEFAULT FALSE,
  vanguard_accuracy     FLOAT DEFAULT 0,
  civic_xp              INTEGER DEFAULT 0,
  privacy_zones         JSONB DEFAULT '[]',
  notification_prefs    JSONB DEFAULT '{}',
  preferred_time        TEXT CHECK (preferred_time IN ('morning','afternoon','evening')),
  scout_pass_active     BOOLEAN DEFAULT FALSE,
  scout_pass_season     TEXT,
  -- Ani Profile
  height_cm             FLOAT,
  weight_kg             FLOAT,
  age                   INTEGER,
  biological_sex        TEXT,
  fitness_baseline      TEXT CHECK (fitness_baseline IN ('sedentary','lightly_active','moderately_active')),
  avg_daily_steps       INTEGER DEFAULT 0,
  completion_rate       FLOAT DEFAULT 0,
  civic_engagement      FLOAT DEFAULT 0
);

-- Row-Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own row" ON users FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can update own row" ON users FOR UPDATE USING (auth.uid() = uid);
```
</details>

<details>
<summary><strong>missions</strong></summary>

```sql
CREATE TABLE missions (
  mission_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                  TEXT CHECK (type IN ('run','civic','preparation','recovery')),
  title                 TEXT,
  assigned_to_uid       UUID REFERENCES users(uid),
  assigned_by           TEXT CHECK (assigned_by IN ('ani','admin','guild')),
  status                TEXT CHECK (status IN ('active','completed','expired','pending_verification')),
  xp_reward             INTEGER,
  gem_reward            INTEGER,
  requires_poi          BOOLEAN DEFAULT FALSE,
  poi_submission_id     UUID,
  completed_at          TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ,
  -- Ani-generated fields
  distance_target_m     INTEGER,
  difficulty            TEXT CHECK (difficulty IN ('easy','moderate','challenge')),
  rationale             TEXT
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own missions" ON missions FOR SELECT USING (auth.uid() = assigned_to_uid);
```
</details>

<details>
<summary><strong>civic_nodes</strong></summary>

```sql
-- Requires PostGIS extension: CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE civic_nodes (
  node_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location              GEOGRAPHY(POINT, 4326) NOT NULL,
  category              TEXT,
  status                TEXT CHECK (status IN ('pending','verified','aging','expired')),
  confidence_score      FLOAT DEFAULT 1.0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  verified_at           TIMESTAMPTZ,
  decay_rate            FLOAT DEFAULT 0.1,
  report_count          INTEGER DEFAULT 1
);

-- Spatial index for ST_DWithin queries
CREATE INDEX civic_nodes_location_idx ON civic_nodes USING GIST (location);
```
</details>

<details>
<summary><strong>squads / guilds / poi_submissions</strong></summary>

```sql
CREATE TABLE squads (
  squad_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT,
  is_private            BOOLEAN DEFAULT FALSE,
  member_uids           UUID[],
  gem_pool              INTEGER DEFAULT 0,
  area_tag              TEXT
);

CREATE TABLE guilds (
  guild_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT,
  banner_color          TEXT,
  member_uids           UUID[],
  total_distance_km     FLOAT DEFAULT 0,
  territories_owned     TEXT[],
  badges                TEXT[],
  gem_reserve           INTEGER DEFAULT 0
);

CREATE TABLE poi_submissions (
  submission_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id            UUID REFERENCES missions(mission_id),
  submitted_by_uid      UUID REFERENCES users(uid),
  photo_urls            TEXT[],
  location              GEOGRAPHY(POINT, 4326),
  server_timestamp      TIMESTAMPTZ DEFAULT now(),
  vanguard_reviews      JSONB DEFAULT '[]',
  status                TEXT CHECK (status IN ('pending','approved','rejected','flagged'))
);

ALTER TABLE poi_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can insert" ON poi_submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by_uid);
CREATE POLICY "Vanguards can read assigned" ON poi_submissions FOR SELECT USING (
  auth.uid() = submitted_by_uid OR
  EXISTS (SELECT 1 FROM users WHERE uid = auth.uid() AND is_vanguard = TRUE)
);
```
</details>

### SQLite Tables (On-Device)

<details>
<summary><strong>run_sessions / gps_waypoints / ghost_routes / pending_missions</strong></summary>

```sql
-- run_sessions --
CREATE TABLE run_sessions (
  session_id        TEXT PRIMARY KEY,
  mission_id        TEXT,
  status            TEXT,
  started_at        TEXT,
  ended_at          TEXT,
  total_distance_m  REAL,
  total_steps       INTEGER,
  mode              TEXT,
  ghost_route_id    TEXT,
  xp_earned_raw     INTEGER,
  gems_earned       INTEGER,
  sync_status       TEXT DEFAULT 'pending'
);

-- gps_waypoints --
CREATE TABLE gps_waypoints (
  waypoint_id       INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id        TEXT REFERENCES run_sessions(session_id),
  latitude          REAL,
  longitude         REAL,
  altitude_m        REAL,
  accuracy_m        REAL,
  recorded_at       TEXT,
  is_privacy_zone   INTEGER DEFAULT 0
);

-- ghost_routes --
CREATE TABLE ghost_routes (
  route_id          TEXT PRIMARY KEY,
  best_time_seconds INTEGER,
  best_distance_m   REAL,
  waypoints_json    TEXT,
  achieved_at       TEXT,
  synced_to_cloud   INTEGER DEFAULT 0
);

-- pending_missions --
CREATE TABLE pending_missions (
  mission_id        TEXT PRIMARY KEY,
  type              TEXT,
  title             TEXT,
  xp_reward         INTEGER,
  gem_reward        INTEGER,
  requires_poi      INTEGER DEFAULT 0,
  expires_at        TEXT,
  cached_at         TEXT
);
```
</details>

---

## 30. Civic Contribution Score

The **Civic Contribution Score (C)** is the primary measurable thesis metric — a per-user, per-mission score that aggregates into LGU-level impact reports.

### Formula

```
C = (XP_mission × S) + (V × CivicXP_base × B)
```

| Variable | Description |
|---|---|
| `XP_mission` | XP from distance component (1 XP / 10m — normalizes pace, not speed) |
| `S` | Streak Multiplier (1.0x–3.0x) — rewards consistent contributors over one-time volunteers |
| `V` | Verification Status: 0 = unverified, 0.5 = partial (2/3 Vanguards), 1.0 = fully verified |
| `CivicXP_base` | Fixed base per mission type (Debris Clearing = 200, Info Scout = 150, etc.) |
| `B` | Bayanihan Buff: 1.0x baseline, up to 1.5x during Emergency Mode |

**Why this formula is defensible:**
- The slow-walker problem is resolved — XP_mission is distance-only, not time-based. A user who walks slowly contributes the same civic credit per meter as a runner.
- The binary V problem is resolved — partial verification gives 50% civic credit, not zero. A 2/3 Vanguard approval still counts.
- The streak multiplier on civic missions is intentional — a 30-day consistent user is demonstrably a more reliable civic contributor than a one-time volunteer who shows up for a single event.

### Aggregate LGU Metrics

| Metric | Description |
|---|---|
| Zone Civic Index (ZCI) | Sum of all C scores for missions in a barangay zone — shows LGU where volunteer activity was concentrated |
| Disaster Response Velocity (DRV) | Average time from Emergency Mode activation to first verified Recovery Quest in a zone |
| Community Coverage Rate (CCR) | % of registered users in a zone who completed at least 1 Civic Quest during an emergency window |

These metrics are exportable from the LGU Admin Panel as CSV or PDF reports, designed to be used in DRRMO post-disaster assessments and barangay performance reviews.

---

## 31. KPIs & Success Metrics

| KPI | Phase 1 Target | Phase 3 Target |
|---|---|---|
| Day 7 Retention | 40% complete the 7-day arc | 55%+ |
| Day 30 Retention | 20% reach a 30-day streak | 30%+ |
| Daily Active Users (DAU) | 500 in Tuguegarao | 10,000 multi-city |
| Ghost Usage Rate | 60% of run sessions load a Ghost | 70%+ |
| Squad Formation Rate | 30% join/create a Squad within 14 days | 50%+ |
| Civic Quest Participation | 25% of active users complete 1 civic quest/month | 40%+ |
| PoI Approval Rate | 70% pass Vanguard review | 80%+ |
| Ani Relevance Score | 65% rate Ani's suggestions as "relevant to me" | 75%+ |
| B2B Quest Node Partners | 5 partners in Tuguegarao by Phase 1 end | 50 nodes across 3 cities |
| Average Session Length | 18 minutes | 22 minutes |
| LGU Partnerships | 1 MOU signed by Phase 3 | 3 LGU contracts |

---

## 32. MVP Definition & Success Criteria

### MVP Scope

The MVP is a single-city deployment focused entirely on proving the core loop: **does the gamification change behavior, and does Ani feel personal?**

- GPS + accelerometer sensor fusion (outdoor and indoor modes)
- Ghost System with personal and Ani Pacer fallback (no Squad/Community Ghost in MVP)
- XP, Gems, streak multiplier
- 7-Day onboarding arc
- Ani coaching (body profile + quest generation + post-session recap)
- Basic Squad formation (no Collective Shield in MVP)
- No Guild or Territory Quests in MVP
- 3 Civic Quest types (Community Eye, Debris Clearing, Info Scout)
- Basic Vanguard review (no anti-collusion detection in MVP)
- B2B Quest Node QR scanning (5 partner nodes)
- No Scout Pass in MVP — free to use for all validation users

### Definition of Done

The MVP is complete when a user can: create a profile with body data, receive a personalized quest from Ani, complete a GPS-tracked session, see their Ghost, earn XP and Gems, maintain a streak, and submit a Civic Quest for Vanguard review — all without connectivity after the initial sync.

### Success Criteria

| Metric | Target | Method |
|---|---|---|
| Day 7 retention | ≥ 40% | Session tracking |
| Ani relevance | ≥ 65% "felt personal to me" | Post-session in-app survey |
| Ghost usage | ≥ 60% of sessions load Ghost data | SQLite log |
| Civic quest completion | ≥ 25% complete at least 1 in 30 days | Mission tracking |
| Session length | Average ≥ 15 minutes | SQLite session duration |

Validation target: 50–100 users from the Tuguegarao beachhead, recruited through CSU and university channels, running the MVP for 30 days with pre/post survey on physical activity habits.

---

## 33. Thesis-Worthy Components

This section documents the components of Karela specifically relevant to academic research, PSC presentation, and thesis defense. Each item identifies the specific algorithm, formula, analytic method, or experimental design element and its role in the system.

---

### 33.1 Primary Research Question

> **"Does a dynamically decay-adjusted Ghost avatar produce statistically higher exercise adherence than a static personal-best Ghost?"**

**Study Design:**

| Group | Ghost Type | Description |
|---|---|---|
| Control | Static PB Ghost | Traditional replay of user's best run |
| Experimental | Adaptive Decay-Adjusted Ghost | Ghost calibrated to the user's failure point, not peak |

**Primary Dependent Variables (Metrics):**

| Metric | Measurement Method |
|---|---|
| Run completion rate | Percentage of sessions where user completes target distance/time |
| Average session duration | Mean run time per session across study period |
| Weekly exercise adherence | Number of sessions completed per week vs. planned |
| Dropout rate | Percentage of users who cease activity over study period |
| Pacing stability | Standard deviation of pace per kilometer across sessions |

---

### 33.2 Effort Decay Function — Algorithmic Contribution

**Thesis relevance:** Novel algorithmic contribution. Distinguishes Karela's ghost system from all prior art in adaptive pacing.

**Proposed model:**

```
P(t) = P_baseline × e^(−λ × max(0, t − t_fatigue))
```

| Parameter | Definition | How It's Learned |
|---|---|---|
| `P_baseline` | Sustainable pace from rolling aggregation | 4-week weighted average |
| `λ` | Individual decay rate (steepness of fatigue onset) | Regression on historical runs |
| `t_fatigue` | Fatigue onset time | Identified from pace-drop inflection points |

**Research contribution:** This function personalizes the ghost's expected pacing behavior to each user's fatigue signature, rather than assuming a universal fatigue model.

---

### 33.3 Rolling Aggregation Model — Statistical Method

**Thesis relevance:** Validates the ghost baseline as statistically robust against single-run anomalies.

**Method:**
- Rolling 4-week window of run data
- Compute weekly mean pacing profiles
- Average weekly profiles into a composite baseline
- Weight by recency (proposed: exponential decay weighting on weeks)

**Weighted composite formula:**

```
P_composite = Σ (w_i × P_week_i) / Σ w_i

where w_i = e^(−α × (W_current − W_i))
```

| Parameter | Definition |
|---|---|
| `P_week_i` | Mean pace profile for week `i` |
| `w_i` | Recency weight for week `i` |
| `α` | Recency decay rate (tunable hyperparameter) |
| `W_current` | Current week number |

**Thesis claim:** This aggregation method produces a more stable and representative pacing baseline than single-run PB, as measured by variance across week-to-week ghost targets.

---

### 33.4 Spatial Consensus Algorithm — Algorithmic Contribution

**Thesis relevance:** Novel application of density-based spatial clustering to civic verification — directly addresses the fake report problem in crowdsourced systems.

**Algorithm basis:** DBSCAN (Density-Based Spatial Clustering of Applications with Noise), executed via PostGIS `ST_DWithin()` on Supabase PostgreSQL.

**Adapted for Karela:**

```
cluster = DBSCAN(ε, minPts, T_window)

where:
  ε        = spatial radius threshold (meters)
  minPts   = minimum independent corroborating reports
  T_window = maximum time between first and last report in cluster
```

**Node state machine:**

```
Unverified Report → Pending Civic Node → Verified Civic Quest → Aging → Expired
                                              ↑                         |
                                              └─── Reconfirmed ─────────┘
```

**Research contribution:** Extends DBSCAN with a temporal constraint and a domain-specific reconfirmation mechanism, creating a spatiotemporal verification system tailored to moving human reporters.

---

### 33.5 Temporal Decay Logic — Mathematical Model

**Thesis relevance:** Provides a principled model for handling information staleness in crowdsourced systems.

**Confidence decay formula:**

```
C(t) = C_0 × e^(−μ × (t − t_verified))
```

| Parameter | Definition |
|---|---|
| `C(t)` | Confidence score at time `t` |
| `C_0` | Initial confidence at verification (normalized to 1.0) |
| `μ` | Decay rate (per issue category — e.g., structural damage < litter) |
| `t_verified` | Timestamp of initial consensus verification |

**Variable decay rates by category (proposed):**

| Issue Type | Decay Rate `μ` | Reasoning |
|---|---|---|
| Litter / trash | High | Cleared within days |
| Flooding / drain | Medium | Seasonal, variable |
| Damaged infrastructure | Low | Persists weeks/months |
| Unsafe area report | Medium-low | Contextual persistence |

**Research contribution:** Category-aware decay rates allow the civic map to remain calibrated to real-world resolution timelines rather than applying a one-size-fits-all staleness model.

---

### 33.6 Reinforcement-Style Ghost Calibration — Behavioral Algorithm

**Thesis relevance:** Frames ghost adaptation in terms of reinforcement learning concepts (reward/penalty feedback loops), connecting the system to a well-established ML paradigm.

**Calibration signal sources:**

| Input | Positive Signal | Negative Signal |
|---|---|---|
| Checkpoint completion | User beat ghost checkpoint | User fell behind checkpoint |
| Session completion | User completed target | User quit early |
| Decay onset timing | Decay occurred later than predicted | Decay occurred earlier than predicted |
| Weekly trend | Improving weekly average | Declining weekly average |

**Adjustment logic (conceptual):**

```
ghost_target(t+1) = ghost_target(t) + η × (performance_delta)

where:
  η              = learning rate (controls sensitivity of adjustment)
  performance_delta = observed outcome − predicted outcome
```

**Research contribution:** Positions the ghost as a closed-loop adaptive controller rather than a static replay system — a distinction with both behavioral and computational significance.

---

### 33.7 The Resonance System — System-Level Contribution

**Thesis relevance:** The Resonance System is the highest-level contribution of the thesis — a demonstration that a fitness system and a civic system can be fused through shared physiological state modeling.

**Fusion logic model:**

```
civic_load(t) = f(stamina_score(t), route_proximity(t), role(t))

where:
  stamina_score(t) = 1 − normalized_fatigue_index(t)
  role(t)          = Scout if stamina_score > threshold, else Vanguard
  civic_load(t)    = 0 if stamina_score < suppression_threshold
```

**Research claim:** A stamina-aware civic interaction system produces higher civic participation rates without reducing exercise performance metrics, compared to a system that presents civic prompts uniformly regardless of user physical state.

---

### 33.8 Summary Table — Thesis Component Inventory

| Component | Type | Algorithm / Method | Thesis Claim |
|---|---|---|---|
| Effort Decay Function | Algorithm | Exponential decay, personalized regression | Adaptive ghost improves adherence over static PB |
| Rolling Aggregation | Statistical Method | Weighted 4-week rolling average | More stable ghost baseline vs. single-run PB |
| Spatial Consensus | Algorithm | DBSCAN-inspired spatiotemporal clustering (PostGIS) | Prevents fake reports without manual moderation |
| Temporal Decay | Mathematical Model | Exponential confidence decay (category-aware) | Keeps civic map accurate over time |
| Ghost Calibration | Behavioral Algorithm | RL-style delta feedback loop | Ghost self-corrects per-user across sessions |
| Resonance System | System Architecture | Stamina-gated civic load function | Integrates civic contribution without harming exercise |
| Experimental Study | Research Design | Control/experimental, longitudinal adherence metrics | Validates adaptive ghost vs. static PB hypothesis |

---

## 34. Research Title & Framework

### 34.1 Proposed Research Title

**Primary Title:**
> **Karela: A Dual-Engine Mobile Platform Integrating Adaptive Athletic Performance Modeling and Geospatial Crowdsourced Civic Engagement for Sustained Behavioral Change**

**Alternative Titles (shorter, panel-friendly):**
> - *"Synthetic Best Run: Adaptive Ghost Pacing and Spatiotemporal Civic Crowdsourcing in a Dual-Purpose Mobile Application"*
> - *"From Stride to Street: Fusing Predictive Endurance Modeling with Geospatial Hazard Reporting in a Gamified Civic Fitness Platform"*

---

### 34.2 Research Framework

#### Study Type
Mixed-methods, longitudinal experimental study with a quantitative primary strand and a qualitative secondary strand.

---

#### Research Questions

**RQ1 (Fitness Engine):**
Does an AI-generated Synthetic Best Run — a ghost pacing avatar calibrated to an individual's fatigue decay curve rather than their static personal best — produce statistically higher exercise adherence, session completion rates, and pacing consistency compared to a static PB ghost?

**RQ2 (Civic Engine):**
Does a geospatial crowdsourcing system that scales Civic Quest complexity from individual reports to collaborative multi-user verification tasks — triggered by localized report density — produce higher civic participation rates and lower false-report rates compared to a flat single-submission reporting system?

**RQ3 (Resonance System):**
Does a stamina-aware Resonance System — which suppresses civic interaction prompts during high-fatigue states and surfaces them during low-intensity phases — produce higher combined fitness-civic engagement without degrading exercise performance metrics, compared to a system that presents civic prompts uniformly?

---

#### Conceptual Framework

The framework rests on three theoretical pillars:

**1. Self-Determination Theory (SDT) — Deci & Ryan**
SDT posits that sustained motivation requires competence, autonomy, and relatedness. The Synthetic Best Run directly addresses *competence* — by targeting the user's sustainable threshold rather than their peak, it ensures the challenge remains achievable. The Resonance System addresses *autonomy* — civic tasks are never forced during high-effort states. The Squad and Guild systems address *relatedness* — civic and fitness effort are socially visible and rewarded.

**2. Crowdsourced Spatiotemporal Verification — DBSCAN adaptation**
The civic engine draws from density-based spatial clustering literature (Ester et al., 1996) and extends it with a temporal constraint window and a domain-specific reconfirmation mechanism. This positions the civic system within the broader field of participatory sensing and volunteered geographic information (VGI), while addressing VGI's primary weakness: data veracity.

**3. Adaptive Pacing & Fatigue Modeling**
The Synthetic Best Run is grounded in exercise science literature on critical power and pacing strategy (Foster et al., 2004; Abbiss & Laursen, 2008), which demonstrates that athletes who pace relative to their sustainable threshold — rather than their peak — show superior completion rates and lower dropout. Karela operationalizes this in a consumer mobile context for non-elite users.

---

#### Independent Variables

| Variable | Engine | Description |
|---|---|---|
| Ghost type | Fitness | Static PB ghost vs. Synthetic Best Run (adaptive decay-adjusted) |
| Civic prompt timing | Civic | Uniform prompts vs. stamina-gated (Resonance System) |
| Report density threshold | Civic | Single-submission vs. density-scaled collaborative quest triggering |

#### Dependent Variables

| Variable | Engine | Measurement |
|---|---|---|
| Exercise adherence rate | Fitness | Sessions completed / sessions assigned, 30-day window |
| Session completion rate | Fitness | % of sessions where target distance/time is reached |
| Pacing stability | Fitness | Standard deviation of pace per km across sessions |
| Dropout rate | Fitness | % of users with zero sessions in the final 2 weeks of the study |
| Civic participation rate | Civic | % of active users completing ≥1 Civic Quest per month |
| False report rate | Civic | % of submitted reports rejected by Vanguard consensus |
| Report-to-verification latency | Civic | Median time from first report submission to Verified status |
| Ani relevance score | Both | % of users rating Ani's suggestions as "relevant to me personally" |

#### Control Variables

Geography (all participants in Tuguegarao City), device type (mid-range Android, 2–4GB RAM), connectivity conditions (prepaid data environment), and baseline physical activity level (measured via onboarding fitness assessment).

---

#### Study Design

**Phase 1 — Baseline (Week 1–2):**
All participants use the app with a static PB ghost and no Resonance System (civic prompts appear uniformly). This establishes individual baseline adherence and pacing profiles.

**Phase 2 — Experimental Intervention (Week 3–6):**
Participants are randomly assigned to one of two conditions:
- Control group: static PB ghost, uniform civic prompts
- Experimental group: Synthetic Best Run ghost, Resonance-gated civic prompts

**Phase 3 — Washout & Qualitative (Week 7–8):**
Both groups revert to free use. Semi-structured interviews (n=20, purposive sample across both groups) explore subjective experience of the ghost system, Ani's relevance, and civic motivation.

---

#### Analysis Plan

**Quantitative:** Independent samples t-tests or Mann-Whitney U tests (depending on normality) for primary DVs between groups. Effect size reported as Cohen's d. Significance threshold α = 0.05.

**Qualitative:** Thematic analysis of interview transcripts using open and axial coding, with themes mapped against SDT constructs (competence, autonomy, relatedness).

**Mixed integration:** Quantitative results explain *whether* the system works; qualitative results explain *why*, and surface edge cases not captured by the metrics (e.g., users who engaged civically but not athletically, or vice versa).

---

#### Ethical Considerations

- Informed consent required from all participants prior to enrollment, with explicit disclosure of data collected (GPS, step count, body profile).
- Body profile data (height, weight) used exclusively for Ani modeling; never shared externally.
- Right to withdraw at any time without penalty to streak or XP.
- All data anonymized before quantitative analysis.
- Compliance with RA 10173 (Philippine Data Privacy Act).
- IRB/ethics clearance sought from Cagayan State University prior to Phase 1.

---

#### Expected Contributions

**To mobile health informatics:** A validated methodology for adaptive pacing in consumer fitness applications using per-user fatigue decay modeling, applicable beyond the Philippine context.

**To participatory sensing / VGI research:** A DBSCAN-adapted spatiotemporal verification model that addresses false-report inflation in gamified civic systems — a known weakness in prior crowdsourced reporting literature.

**To behavioral technology design:** Empirical evidence (or refutation) of the hypothesis that stamina-aware civic prompt timing (the Resonance System) can sustain dual-track engagement without degrading either track's performance metrics.

**To Philippine civic technology:** A replicable, open-methodology framework for LGU-integrated volunteer coordination that generates exportable, verified civic impact data — usable for DRRMO assessments and barangay performance reviews.

---

## 35. Ethics & Responsible Design

### Safety Primacy

The Bayanihan Protocol's Hard-Lock is not a feature that can be disabled by users or overridden by gamification incentives. No streak reward, no quest bonus, and no Guild pressure will ever push a user outside during a PAGASA Signal 4–5. The Tier 3 lock disables all movement rewards entirely — and Gems are awarded specifically for staying safe and checking in. The design intent is explicit: the app must never be the reason someone is outside in dangerous conditions.

### Anti-Obsession Design

Streak mechanics are psychologically powerful and can become unhealthy. Karela's mitigations:
- The 3.0× streak multiplier is a cap, not an escalating reward. There is no incentive to exercise more than a healthy amount.
- Streak Freezes exist precisely to reduce anxiety around missing a single day. The system is explicitly designed to acknowledge that life happens.
- Ani's weekly plan includes a recommended rest day. She will not assign movement on a day she has designated for recovery.
- Quiet Hours (default 10 PM – 7 AM) prevent the app from disturbing sleep.

### Vanguard Power & Accountability

Vanguards have the power to approve or reject civic quest submissions, which directly affects other users' XP and Gem earnings. This power must not be abused. The anti-collusion governance (blind assignment, geographic separation, accuracy tracking, fraud ring detection) is designed to prevent Vanguard networks from forming informal approval rings. Vanguards who fall below 70% accuracy are suspended — protecting the integrity of the civic data that LGUs depend on.

### Inclusivity of Non-Athletic Users

The decision to make Civic XP a fully independent progression track from physical XP was made deliberately to ensure that users who cannot run — due to disability, age, injury, or circumstance — are not second-class citizens in the app. A Vanguard who reviews 50 submissions per month contributes as much to the platform as a runner who logs 200km. The system is designed to honor both forms of effort equally.

---

## 36. Known Open Questions

1. **PAGASA API access.** Tier 2–4 escalation currently relies on manual admin input. A direct PAGASA data feed would make the safety system fully automated. This requires a partnership conversation that is beyond the current development scope.

2. **Ani's accuracy for non-standard body types.** Caloric estimates and pace recommendations for users significantly above or below average height/weight ranges may be less accurate. A wider calibration dataset and explicit uncertainty communication in Ani's messages are the planned mitigations.

3. **Vanguard cold start.** Vanguards require Level 15, which takes 90–120 days of consistent use. The MVP has no Vanguards at launch. Civic Quest verification in the MVP will rely on a small, manually vetted cohort of trusted early users acting as provisional Vanguards until organic eligibility is reached.

4. **Guild formation cold start.** Guilds require 50+ members. At 500 MAU in Phase 1, only 10 Guilds can form at maximum — and only if users are perfectly distributed. Territory Quests may not be fully competitive in Phase 1. The design works with smaller proto-Guilds (20+ members) for the pilot and scales the formal 50-member threshold for Phase 2.

5. **B2B partner sales cycle.** Convincing Tuguegarao SMEs to pay ₱500–₱3,500/month for a platform with 500 users requires demonstrating foot traffic data before foot traffic exists. The launch strategy addresses this with 5 pro-bono partner nodes at launch in exchange for testimonial rights.

6. **LGU procurement complexity.** Government contracts in the Philippines involve lengthy procurement processes (RA 9184). The B2G revenue stream is realistic for Phase 3 but requires beginning the conversation in Phase 1 and allowing 12–18 months for the first contract to close.

7. **Battery impact on low-end devices.** GPS + accelerometer fusion on devices with 2–3GB RAM and older chipsets may cause significant battery drain. The dynamic GPS sampling rate is the primary mitigation, but real-world testing on target devices (Samsung A-series, Realme, Xiaomi Redmi) is required before Phase 1 launch.

8. **Supabase RLS policy complexity.** Migrating from Firebase's Security Rules to PostgreSQL Row-Level Security requires careful policy design, particularly for Vanguard access to poi_submissions from other users. All RLS policies must be audited prior to launch to prevent unauthorized data exposure.

---

## 37. Long-Term Vision

Karela's long-term trajectory is to become three things simultaneously:

1. **A fitness platform** — adaptive, personalized, and adherence-optimized for habitual runners and beginners alike
2. **A civic intelligence network** — a real-time, human-powered sensor array for urban maintenance monitoring
3. **An urban data layer** — a structured, time-stamped, spatially indexed record of civic conditions across a city

**Value to Local Government Units (LGUs):**

- Heatmaps of neglected infrastructure zones
- Recurring hotspot detection across weeks and months
- Maintenance prioritization based on verified report frequency
- Community participation metrics as a governance feedback signal

**Potential partnership angle:** Karela data as a service to city planning offices, urban maintenance contractors, and community organizations — a "human-powered urban sensing through fitness behavior" model.

---

## 38. Core Technical Domains

Karela sits at the intersection of three technical domains:

**Fitness Intelligence**
- Predictive fatigue modeling
- Adaptive pacing via reinforcement-style calibration
- GPS spatial interpolation
- Rolling statistical aggregation

**Civic Intelligence**
- Density-based spatial clustering (DBSCAN adaptation via PostGIS)
- Temporal decay modeling
- Crowdsourced spatiotemporal verification
- Geospatial consensus algorithms

**Fusion / Behavioral Intelligence**
- Stamina-aware civic load modulation (Resonance System)
- Role-based adaptive task assignment
- Human behavioral optimization across fitness and civic domains

---

## 39. Roadmap

- [x] System Specification v3.1 (this document)
- [ ] **Phase 1 — Foundation** *(Month 1–3)*
  - Sensor fusion (GPS + accelerometer, outdoor and indoor modes)
  - Ghost System with personal + Ani Pacer fallback
  - Ani coaching (body profile, quest generation, post-session recap, weekly plan)
  - SQLite offline logging + Supabase sync (TSR model)
  - Supabase Auth + RLS policy setup
  - XP / Streak / Gem system
  - First 7-Day onboarding arc
  - Basic Squad formation
  - 3 Civic Quest types + provisional Vanguard cohort
  - 5 B2B Quest Node partners in Tuguegarao
  - **Gate:** 500 DAU; 40% Day-7 retention; 65% Ani relevance score
- [ ] **Phase 2 — Social Release** *(Month 4–6)*
  - Collective Shield mechanic
  - Guild formation + Territory Quests
  - Squad Ghost + Community Ghost in fallback hierarchy
  - Squad Vision (opt-in live location sharing)
  - Full notification architecture with fatigue prevention
  - Scout Pass Season 1 launch
  - Tagalog localization
  - **Gate:** 30% of users in a Squad; 5 active Guilds; 10 landmarks claimed; 10 B2B partners
- [ ] **Phase 3 — The Impact** *(Month 7–9)*
  - Bayanihan Protocol (all 5 tiers)
  - Full PoI verification (camera lock, metadata fingerprint, Vanguard blind audit)
  - Full anti-collusion Vanguard governance
  - Admin Panel for LGU coordinators
  - LGU exportable reports (ZCI, DRV, CCR)
  - Community Hero accessibility mode
  - **Gate:** 1 LGU MOU signed; 25% civic quest participation; 5 B2B partners paying
- [ ] **Phase 4 — Scale** *(Month 10–12)*
  - Multi-city expansion (Cauayan, Santiago City)
  - Ibanag localization (CSU partnership)
  - PAGASA webhook partnership negotiation
  - LGU White-Label product launch
  - Scout Pass Season 2
  - **Gate:** 3 LGU partners; ₱50k MRR; 10,000 DAU across Cagayan Valley

---

## 40. Glossary

| Term | Definition |
|---|---|
| **Adaptive Ghost** | A pacing avatar that updates after every run based on the user's fatigue patterns and performance history |
| **Ani** | Karela's personalized AI coach, powered by Gemini Flash; generates quests, provides post-session recaps, and delivers context-aware coaching |
| **Bayanihan Protocol** | Karela's disaster-response feature; a tiered safety and civic mission system activated during weather emergencies |
| **Civic Node** | A spatial record representing a reported urban issue, existing in Pending or Verified state |
| **Civic Contribution Score (C)** | A per-user, per-mission score aggregating physical and civic effort into an LGU-reportable metric |
| **Community Coverage Rate (CCR)** | % of registered users in a zone who completed at least 1 Civic Quest during an emergency window |
| **Confidence Score** | A decaying numeric value representing how current and trustworthy a civic node's data is |
| **Collective Shield** | A Squad mechanic where members pool Gems to protect a teammate's streak |
| **DBSCAN** | Density-Based Spatial Clustering of Applications with Noise — the algorithmic basis for Karela's spatial consensus system, executed via PostGIS |
| **Disaster Response Velocity (DRV)** | Average time from Emergency Mode activation to first verified Recovery Quest in a zone |
| **Effort Decay Curve** | A per-user mathematical model of how running pace degrades over time or distance |
| **Failure Point** | The point in a run where the user's pace historically drops below their sustainable threshold |
| **Fatigue Onset (`t_fatigue`)** | The time or distance at which fatigue-driven pace decay begins for a given user on a given terrain type |
| **Ghost** | The pacing avatar the user races against during a run |
| **Guild** | A regional group of 50+ users that competes for landmark territory on the city map |
| **Pending Civic Node** | A reported issue that has not yet received sufficient corroboration for verification |
| **PB Ghost** | Personal Best Ghost — a traditional fitness app feature replaying the user's fastest run |
| **PostGIS** | PostgreSQL spatial extension used for ST_DWithin() queries in the civic consensus algorithm |
| **Proof of Impact (PoI)** | Multi-factor photo verification system for civic quest submissions |
| **Resonance System** | Karela's fusion layer; uses stamina state to modulate civic contribution load |
| **Row-Level Security (RLS)** | Supabase/PostgreSQL access control mechanism replacing Firebase Security Rules |
| **Scout** | High-intensity user role; passive civic sensor with minimal interaction requirements |
| **Scout Pass** | Karela's 90-day seasonal subscription; grants cosmetics and Gem bonuses |
| **Spatial Consensus** | The requirement that multiple independent users report the same issue within a spatial radius before it is verified |
| **Squad** | A small accountability group of 3–12 users with shared streak support and optional live location sharing |
| **Streak Multiplier** | An XP bonus (1.0x–3.0x) that grows with consecutive days of activity |
| **Supabase** | The open-source Firebase alternative powering Karela's cloud backend, using PostgreSQL + PostGIS, Auth, Storage, Realtime, and Edge Functions |
| **Synthetic Best Run** | The research term for Karela's adaptive ghost — a generated optimal pacing model based on the user's historical fatigue signature, not their peak run |
| **Temporal Decay** | The process by which a civic node's confidence score decreases over time without reconfirmation |
| **Territory Quest** | A monthly Guild competition to claim ownership of city landmarks via cumulative distance |
| **Vanguard** | Trusted high-level user (Level 15+) with the ability to review and approve civic quest submissions; also a low-intensity runner role with active civic contribution |
| **Verified Civic Quest** | A civic node that has reached the multi-user spatial consensus threshold |
| **Zone Civic Index (ZCI)** | Sum of all Civic Contribution Scores for missions in a barangay zone |

---

## 41. The Team

**Randel Serafica:**
*Lead Developer & Architect*

**Trishia Rirao:**
*UI Designer & Pitch Presentor*

**Steven Sanidad:**
*UX Designer & Quality Assurance*

**Qarisha Collado:**
*UI/UX Designer & Research*

**Cyduanne Biraquit:**
*Database & 3D Modelling*

**Sander Sedano:**
*Team Mentor/Adviser*

Built for the Philippine startup ecosystem as a thesis submission and personal portfolio project demonstrating full-stack mobile engineering with a real social impact thesis. Pilot site: Tuguegarao City, Cagayan Valley, Philippines.

---

> **Karela** — *Building a resilient Philippines, one step at a time.* 🇵🇭

---

*© 2026 Randel Serafica. All rights reserved.*
