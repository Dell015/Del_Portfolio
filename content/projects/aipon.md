# Aipon — Complete Project Reference

> **Aipon** = AI + "ipon" (Filipino for "to save money")

**One-liner:** Pick anything you want to buy. Log your savings like a notebook (not a bank). Aipon shows you exactly which parts/components you can already afford, lets you save toward specific pieces, and predicts when you'll own the whole thing — based on your real deposit history and actual budget.

---

## Concept & Philosophy

- **Notebook, not a bank.** Aipon never touches real money — no bank linking, no payments. It's a manual ledger the user updates themselves.
- **Finance tool meets collectible-progress experience.** Serious budgeting mechanics presented with an engaging, motivating UI where parts "light up" as you save.
- **Grounded predictions.** Most "saving goal" apps ignore whether you can actually afford to save that much. Aipon grounds predictions in your real budget (income minus mandatory expenses).
- **Recursive by design.** Items are trees, not flat lists — a PC's GPU can eventually branch into its own sub-components (fans, VRM, chip), same pattern works for any item at any depth.

---

## Design System

### Color Palette

| Role    | Hex       | Description              |
| ------- | --------- | ------------------------ |
| Primary | `#304f27` | Dark green (brand color) |
| Accent  | `#e3b43c` | Golden yellow (CTAs, highlights) |

### Typography

- **Font:** Geist (via `next/font`) — Vercel's system font family
- **Mono:** Geist Mono (code/numbers)

### Visual Style

- Clean, understated, finance-tool tone (not gamey)
- Milestone animations: subtle CSS light-up/glow, no confetti or sound
- Parts diagram: real photos with clickable hotspot overlays
- Progress: partial fill/glow within parts (not binary on/off)

---

## Target Audience

Anyone saving for anything — not just tech enthusiasts. First item: PC (standardized, well-documented parts). Future: phone, car, motorcycle, laptop, custom user-created items.

---

## Business Model

- **Personal project first.** Built to eventually become a public product.
- **Monetization (undecided, revisit post-MVP):** premium items, ad-free tier, affiliate links to retailers for displayed parts — explored later once there's a working product and real users.
- **Cost to run:** $0 on free tiers (Vercel + Supabase + GitHub).

---

## Core Mechanics

### 1. Recursive Parts Tree

Items → Parts (tree via `parent_id`). MVP parts are all leaves, but modeled as a tree from day one so sub-component branching doesn't require a rewrite.

```
Item: "Custom PC Build"
 ├── GPU              (₱32,000)
 ├── CPU              (₱18,000)
 ├── RAM              (₱5,000)
 ├── Motherboard      (₱12,000)
 ├── Storage (SSD)    (₱4,500)
 ├── PSU              (₱5,500)
 ├── Case             (₱4,500)
 └── CPU Cooler       (₱3,500)
```

### 2. Three-Slot Concurrent Saving

- Users pick up to 3 parts to actively save toward simultaneously (like sinking funds / envelope budgeting).
- Deposits are split across active slots: **manual split** (default, user types per-slot amounts) or **even auto-split** (toggle).
- When a slot's part is fully funded → milestone fires → slot empties → next unfunded part auto-suggested.

### 3. Deposit Ledger

- Every deposit/withdrawal logged individually (date + amount + allocation to slots).
- Soft delete: wrong entries get a `deleted_at` timestamp (audit trail preserved, "undo" supported).
- Positive amounts = deposits, negative = withdrawals/expenses.

### 4. Prediction Engine (EWMA)

- Exponentially Weighted Moving Average over last 90 days of deposits.
- Decay factor α = 0.85 (recent deposits count more).
- Capped by budget planner data if available (predictions never exceed what user can actually afford).
- Minimum 5 deposits required before showing a prediction.
- Edge case: if rate ≤ 0, shows "savings are decreasing" instead of a fake date.

### 5. Budget Planner

- User inputs: monthly income + mandatory expenses (rent, bills, food, etc.)
- Output: what's actually left over to save → feeds into prediction engine as realistic cap.
- Strongest differentiator from other savings apps.

### 6. Multiple Goals & Focus

- Track multiple items simultaneously (independent progress).
- Mark one goal as "Focus" (UI highlight, doesn't lock out others).

### 7. Sort & Prioritize

- Toggle: ascending price, descending price, or manual order.
- Manual: drag-to-reorder via @dnd-kit.

---

## Tech Stack

| Layer | Choice | Purpose |
|---|---|---|
| Framework | **Next.js 16** (App Router, React 19) | Frontend + API routes |
| Styling | **Tailwind CSS 4** | Utility-first CSS |
| Client State | **Zustand** | UI state (slots, tabs, drag) |
| Server State | **TanStack Query (React Query)** | Caching, optimistic updates, background refetch |
| Backend/DB/Auth/Storage | **Supabase** | Postgres, Google/email auth, RLS, file storage |
| Hosting | **Vercel** | Auto-deploy from GitHub |
| Drag & Drop | **@dnd-kit/core + @dnd-kit/sortable** | Accessible reorder |
| Charts | **Recharts** | Savings & prediction graphs |
| Forms/Validation | **Zod 4 + React Hook Form** | Type-safe validation |
| Dates | **date-fns** | Prediction calculations, streaks |
| Language | **TypeScript 5** | End-to-end type safety |

### Architecture

```
Browser (Next.js frontend + Zustand + TanStack Query)
    │
    │  supabase-js client
    ▼
Supabase (Auth + Postgres w/ RLS + Storage)
```

No custom backend server. Frontend talks to Supabase directly. Row Level Security enforces per-user data isolation.

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `items` | Trackable items (global templates + user-created) |
| `parts` | Recursive tree (self-ref via `parent_id`), hotspot coords |
| `goals` | User's tracked item, currency, focus state |
| `goal_parts` | Per-part overrides: custom price, priority, slot assignment, funded_at |
| `deposits` | Ledger entries (soft-deletable) |
| `deposit_allocations` | How deposits are split across parts |
| `budgets` | One per user: monthly income |
| `budget_expenses` | Itemized mandatory expenses |

### Key Design Decisions

- `items.created_by = null` → global template; `= user_id` → user-created (visible only to them)
- Currency stored on `goal`, not item (same item template can be tracked in different currencies)
- `total_price` is the anchor (full item retail price); individual part prices don't need to sum exactly to it
- Hotspots stored as JSON `{ x, y, width, height }` (percentage-based, relative to image)
- RLS enabled on all user-owned tables

---

## Project Structure

```
aipon/
├── src/
│   ├── app/
│   │   ├── page.tsx              → Home: "What do you want to buy?"
│   │   ├── items/[id]/page.tsx   → Item detail + parts diagram + demo afford slider
│   │   ├── layout.tsx            → Root layout (header, footer, providers)
│   │   ├── providers.tsx         → QueryClientProvider
│   │   └── globals.css           → Tailwind + CSS variables
│   ├── components/
│   │   └── PartsDiagram.tsx      → Photo + clickable hotspot overlays
│   ├── hooks/
│   │   ├── useItems.ts           → TanStack Query: items CRUD
│   │   ├── useParts.ts           → TanStack Query: parts for an item
│   │   ├── useGoals.ts           → TanStack Query: goals CRUD
│   │   ├── useDeposits.ts        → TanStack Query: deposits + allocations
│   │   └── useBudget.ts          → TanStack Query: budget + expenses
│   ├── lib/
│   │   ├── supabase/client.ts    → Browser Supabase client (singleton)
│   │   ├── supabase/server.ts    → Server Supabase client (cookies)
│   │   ├── affordLogic.ts        → Pure: parts progress, sorting, slots, splits
│   │   ├── predictionLogic.ts    → Pure: EWMA prediction, budget leftover
│   │   └── validators.ts         → Zod schemas + TypeScript types
│   └── stores/
│       └── uiStore.ts            → Zustand: slot picker, split mode, active tab
├── supabase/
│   └── seed.sql                  → PC item + 8 parts seed data
├── public/
│   └── pc-diagram-placeholder.svg
├── docs/
│   ├── aipon-project-plan-v2.md
│   └── aipon-tech-stack-guide.md
└── package.json
```

---

## Current Progress (What's Done)

### ✅ Completed

1. **Project scaffolded** — Next.js 16 + all dependencies installed
2. **Database schema designed** — full SQL with RLS policies (in docs + seed.sql)
3. **Seed data** — PC item with 8 parts (GPU, CPU, RAM, Motherboard, SSD, PSU, Case, CPU Cooler)
4. **Supabase client setup** — browser (singleton) + server (cookies) clients
5. **Zod schemas + TypeScript types** — Item, Part, Goal, GoalPart, Deposit, DepositAllocation, Budget, BudgetExpense + form input schemas
6. **TanStack Query hooks** — useItems, useParts, useGoals, useDeposits, useDepositAllocations, useBudget
7. **Zustand UI store** — slot picker, split mode, active tab state
8. **Afford logic** (pure functions) — parts progress, sorting (price/manual), active slots, next candidates, even split, goal progress
9. **Prediction logic** (pure functions) — EWMA daily rate, completion projection, slot predictions, budget leftover
10. **Home page** — item cards grid with demo fallback
11. **Item detail page** — parts diagram + interactive "how much saved" slider (Step 2 demo proving afford logic)
12. **PartsDiagram component** — photo overlay with hotspot regions, progress fill, hover tooltips, funded state
13. **Layout** — header, footer, responsive, Geist font

### 🔲 Not Yet Built

- Auth (Google + email via Supabase)
- Real deposit logging (ledger UI + form)
- 3-slot mechanic UI (SlotManager, DepositForm with allocation)
- Drag-to-reorder priority list (@dnd-kit)
- Prediction chart (recharts)
- Budget Planner page
- Multiple goals + Focus toggle
- Milestones & streaks
- Additional items (phone, car, motorcycle, laptop)
- Data export/delete
- Privacy policy

---

## Build Roadmap (Remaining Steps)

| Step | What | Status |
|------|------|--------|
| 1 | Static data + parts diagram | ✅ Done |
| 2 | Afford logic demo (client-side, no persistence) | ✅ Done |
| 3 | Auth (Supabase Google + email) | 🔲 Next |
| 4 | Ledger (deposit/withdrawal logging, persisted) | 🔲 |
| 5 | Prediction engine integration + recharts | 🔲 |
| 6 | Sort, manual priority, 3-slot mechanic UI | 🔲 |
| 7 | Budget Planner page | 🔲 |
| 8 | Multiple goals + Focus | 🔲 |
| 9 | Milestones & streaks | 🔲 |
| 10 | Additional items (phone, car, motorcycle, laptop) | 🔲 |

---

## Deployment

- **Repo:** GitHub (private)
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Database:** Supabase (free tier Postgres)
- **Auth:** Supabase Auth (Google OAuth + email/password)
- **Storage:** Supabase Storage (part photos)
- **Cost:** $0 total

---

## Decisions Log

| Decision | Chosen | Why |
|---|---|---|
| Parts model | Tree (not flat list) | Supports future sub-component branching without schema rewrite |
| Deposit split | Manual (default) + even-split toggle | Gives control to strategic savers; simplicity for casual users |
| Prediction algo | EWMA (α=0.85, 90-day window) | Simple (~20 lines), responsive to behavior changes, no ML needed |
| Currency | Per-goal, not per-item | Same template usable across regions |
| Monetization | Deferred | Build first, explore if/when there are real users |
| Social features | Recommended against | Money comparison creates anxiety, not motivation |
| AR/3D/Sound | Not in MVP | Clean finance-tool tone; 3D deferred to post-MVP |
| Slot count | 3 concurrent | Mirrors real "sinking funds" technique; manageable, not overwhelming |
| Soft delete | Yes (deposits) | Audit trail + undo support without data loss |

---

## Open Questions (Non-blocking)

- Exact visual treatment of "light up" milestone (color fill? glow? badge?)
- Whether "Focus" goal gets special UI treatment beyond highlight/pin
- Specific monetization model (if any)
- Currency conversion between goals (MVP: display-only, no conversion)

---

## Environment Setup

```bash
# Clone and install
git clone <repo-url>
cd aipon
npm install

# Configure Supabase
cp .env.local.example .env.local
# Edit .env.local with your Supabase project URL + anon key

# Run seed SQL in Supabase SQL Editor (supabase/seed.sql)

# Dev server
npm run dev
# → http://localhost:3000
```

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
