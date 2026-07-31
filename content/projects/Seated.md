# 🪑 SEATED — Full Startup Brief
### *Disconnected by Design: Redesigning How People Connect Around a Meal*
*Startup Competition Reference Document — Version 4.0*
*(v4.0: reflects the actual built product as of July 2025 — Expo/React Native + FastAPI + Supabase stack fully implemented; Explore Mode uses Apple Maps + OpenStreetMap Overpass API; Presence Mode uses accelerometer/gyroscope sensor detection + app backgrounding; no CCTV AI or NFC in MVP; QR-based check-in with server-signed dynamic tokens.)*

---

## 0. WHY THIS VERSION EXISTS

Version 3.1 was the planning document. This is version 4.0 — the document that describes **what was actually built and how it works today**.

Key differences from v3.1:
- **Map provider:** Apple Maps (via `react-native-maps`) instead of Google Maps — works in Expo Go without an API key, zero cost.
- **Discovery data:** OpenStreetMap Overpass API for nearby places (restaurants, cafes, kiosks, food stalls, street vendors, bars, bakeries) — free, no API key required. Seated partner restaurants come from the Supabase database.
- **Check-in method:** Dynamic QR codes (HMAC-signed, rotating every 10 minutes) — not NFC. NFC requires a custom dev client build; QR works in Expo Go for demos.
- **Presence Mode detection:** Accelerometer + gyroscope sensors (phone face-down detection) plus app backgrounding (phone locked) — not OS-level notification silencing. No native module needed.
- **No CCTV AI in MVP:** The YOLOv8 occupancy detection is deferred. Real-time table status is managed manually by staff through the app.
- **No payment processing in MVP:** PayMongo integration deferred. No-show fees are tracked but not charged.
- **Pre-ordering added:** Users can place food orders after claiming a table, before arriving.
- **Mood/occasion filter chips:** Explore Mode includes filters like Quiet Dinner, Celebration, Study Café, Solo-Friendly, Late-Night, Family, Outdoor, Group Dining.

Everything else from the v3.1 vision — the three-feature structure, the theme argument, the business model — remains intact. This document describes the product as it exists.

---

## 1. THE PROBLEM: THIS IS NOT ABOUT CHAIRS

The problem hasn't changed from v3.1, but the product now has a working answer to it.

A college student has a 30-minute lunch break. She skips her first choice because the line outside tells her it's full. She walks to the next place — full. She finally gets a seat, but it's wedged at a communal table between two strangers, elbow to elbow, phone out because there's nothing else to do.

**The problem is:** once you have a seat, you get no say in what happens to you while you're in it — who you're next to, how much noise you're exposed to, whether your phone or the person across from you gets your attention, and whether the place you walked toward was something you found or something a trending list found for you.

### What This Costs Restaurants

A local carinderya three blocks away has 12 empty seats during peak hour and no way to signal that to anyone nearby. Meanwhile the same five viral spots absorb all foot traffic because that's what shows up on everyone's feed. Smaller, genuinely good places stay invisible — not because they're worse, but because nobody's discovery process ever routes through them.

Seated makes these places visible through two mechanisms:
1. **Database-listed partners** (orange pins on the map) — onboarded directly
2. **OpenStreetMap data** (teal pins) — every food establishment indexed by OSM appears automatically, giving visibility to places that would never pay for advertising

---

## 2. THE SOLUTION: SEATED (AS BUILT)

**Seated** is a real-time seat and dining platform built around three connected mechanisms:

1. **Exposure Control** — you decide how much contact with strangers you want before you commit to a place
2. **Presence Mode** — when you sit down with people you know, being present with them is the default state, not something you have to enforce on yourself
3. **Explore Mode** — a discovery map built on neutral geographic data and partner restaurants, not on what's trending or influencer-endorsed

Underneath all three, the seat-certainty infrastructure runs: real-time table availability, QR check-in, 5-minute claim expiry, staff table management.

**One line:** *Seated doesn't just get you a seat. It lets you decide what happens once you're in it.*

### Full User Journey (as implemented)

```
Auth (Login/Signup)
  → Exposure Control (first-time, persisted)
    → Home (Browse categories, picks, trending, featured)
      → Restaurant Detail → Claim Table (5-min hold)
        → Pre-Order (optional food order)
          → QR Scan (check-in at table)
            → Presence Mode (phone face-down session)
              → Session Complete 🎉 (+50 Seated Points)
```

Alternative entry: Explore tab → Map with pins → Tap restaurant → Detail → same flow

---

## 3. FEATURE 1 — EXPOSURE CONTROL (IMPLEMENTED)

### How it works in the app

Exposure Control is the **first screen after login** for new users. It presents three large, selectable cards:

- **🧘 Solo** — "A table for one. Your pace, your space."
- **👥 Open to Sharing** — "A communal seat. No obligation to interact."
- **🔒 With My Group** — "A private table, locked for the people you choose."

**Implementation details:**
- Built in `ExposureControlScreen.tsx` (5.4KB)
- Persisted via `ExposureProvider` context (`services/exposure.tsx`) using AsyncStorage
- Selection persists across sessions — user doesn't re-choose every launch
- Changeable anytime from the Home screen header or Settings
- The mode is displayed as a subtle indicator on the Home screen
- Selection immediately navigates to Home with that mode applied

**Visual design:**
- Full-screen, vertically stacked cards
- Cards: cream background (`#FFFDF4`) with `1.5px #141517` border, 16px radius
- Selected state: orange (`#FF6A00`) border + light orange tint
- Tap = choose = navigate (no separate "Continue" button)
- Caption below: "You can change this anytime." (muted text)

### Why this answers the theme

*"Questions what should be connected, why, and to what extent"* — Exposure Control is that question asked literally, per person, per visit: should this person be connected to strangers, why (their stated preference), to what extent (solo counter vs. anonymous shared slot vs. private locked table).

### Destigmatizing solo dining

Solo mode doesn't mark a person as "waiting for someone." It's framed as a deliberate, supported, restorative choice — not a gap to be filled.


---

## 4. FEATURE 2 — PRESENCE MODE (IMPLEMENTED)

### How it actually works (sensor-driven)

Presence Mode is **not** a soft "put your phone down" reminder. It uses device sensors to make presence the structural default:

1. **Entry:** After QR check-in at a table, user enters Presence Mode. An intro screen prompts: "Place your phone face-down on the table."
2. **Detection:** The `usePresenceDetection` hook uses the accelerometer and gyroscope to detect phone orientation:
   - **Phone face-down** (z-acceleration negative, device flat) → timer runs, user is "present"
   - **Phone locked / app backgrounded** → timer continues (AppState listener)
   - **Phone picked up** (orientation changes) → timer pauses, gentle nudge to return
3. **No shaming:** Picking up the phone pauses the session — no penalty, no record, no judgment. "Step out briefly" button available at all times.
4. **Completion:** Session ends with a celebration overlay — confetti animation, +50 Seated Points earned.

### Implementation details

- Built in `PresenceModeScreen.tsx` (36KB — the largest screen in the app)
- `usePresenceDetection.ts` hook (9.8KB) — accelerometer/gyroscope sensor fusion via `expo-sensors`
- `usePresenceNotification.ts` hook (7KB) — local notification when session is active and app is backgrounded
- Group members shown as colored dots with initials (mock data for demo: You, Alex, Sam)
- Rotating conversation prompts: "What made you smile today?", "Share a favorite memory", etc.
- Count-up timer showing duration of presence (MM:SS format)
- Confetti animation on completion using `Animated` API (6 colors, physics-based falling)

### Screen layout (as built)

```
┌─────────────────────────────────────────┐
│  ← Back                    Restaurant   │
│                                         │
│          ┌───────────────┐              │
│          │   🍽️  23:47   │              │  ← Count-up timer
│          └───────────────┘              │
│                                         │
│     Present with your group             │
│     Table 3 · Window Seat              │
│                                         │
│     ● You  ● Alex  ● Sam               │  ← Group member dots
│                                         │
│   "What made you smile today?"          │  ← Rotating prompt
│                                         │
│      ┌─────────────────────┐            │
│      │   Step out briefly   │           │  ← Non-judgmental exit
│      └─────────────────────┘            │
│                                         │
│      ┌─────────────────────┐            │
│      │    End Session       │           │  ← Completes session
│      └─────────────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

- Background: warm cream tones, minimal UI
- Timer is the visual focus — large, centered
- "Step out briefly" is low-contrast, secondary styling
- gestureEnabled: false on this screen (prevents accidental swipe-back)

### Why this is the direct answer to the theme's central question

"Does constant connectivity always lead to meaningful interaction?" — Presence Mode is the only feature that touches connectivity itself in the literal sense (phones, notifications, screens displacing people). The structural answer: the **default** flips. Presence is automatic once you place your phone down; distraction (picking it up) is the opt-out that takes effort.

---

## 5. FEATURE 3 — EXPLORE MODE (IMPLEMENTED)

### How it works in the app

Explore Mode is a **full-screen Apple Maps view** centered on the user's location, showing two layers of data:

**Layer 1 — Seated Partners (orange pins):**
- Restaurants from the Supabase database
- Pulled via `GET /restaurants` API endpoint
- Show: name, category, available tables, distance

**Layer 2 — Nearby Places from OpenStreetMap (teal pins):**
- Fetched via `GET /places/nearby?lat=X&lng=Y&radius=2000`
- Backend queries the Overpass API for: restaurants, cafes, fast food, kiosks, food courts, street vendors, bars, bakeries
- Color-coded by category:
  - Restaurant → deep orange
  - Café → brown
  - Kiosk → purple
  - Street vendor → red
  - Bar → blue
  - Bakery → amber
  - Default → teal

**Mood/Occasion Filter Chips (horizontal scroll, top of map):**
- Quiet Dinner, Celebration, Study Café, Solo-Friendly, Late-Night, Family, Outdoor, Group Dining
- Chip styling: inactive = cream fill + dark text, active = dark fill + cream text

### Implementation details

- Built in `ExploreScreen.tsx` (35KB — second-largest screen)
- Uses `react-native-maps` with Apple Maps provider (works in Expo Go, no API key)
- `expo-location` for user positioning with permission flow
- Draggable bottom sheet (PanResponder) with three snap points:
  - Collapsed (12% screen height) — just the drag handle visible
  - Half (45%) — shows restaurant list
  - Full (85%) — full list view
- Default region: Cauayan City / Tuguegarao area (lat 16.93, lng 121.767)
- Floating search bar above map
- Location label showing current area name
- Restaurant list in bottom sheet with: image, name, category, distance, hours
- Tap pin → scroll to restaurant in list / show mini-card
- Tap restaurant card → navigate to RestaurantDetailScreen

### What Explore Mode deliberately does NOT show

- ❌ Star ratings (no popularity ranking)
- ❌ "Trending near you" badges
- ❌ "Recommended for you" personalization
- ❌ Review counts or social proof numbers
- ❌ Influencer endorsements
- ❌ Visible confirmation counts

Everyone in the same location sees the same map. The only factual info shown: name, category, distance, hours.

### Why this matters for the theme

Explore Mode surfaces places by neutral geographic fact and category — not by what's trending or what an algorithm decided you'd like. A carinderya with no Instagram presence appears with the same visual weight as a viral spot. Discovery happens through proximity and curiosity, not through someone else's curation.


---

## 6. SEAT INFRASTRUCTURE: TABLES & RESERVATIONS (IMPLEMENTED)

### Database schema (PostgreSQL on Supabase)

The reservation system is enforced at the database level through RPC functions:

**Tables:**
- `restaurant_tables` — per-restaurant table inventory with label, capacity (1-30), status (available/reserved/occupied/cleaning/unavailable), and a unique `qr_token`
- `reservations` — links customer → restaurant → table with status lifecycle: `claimed → checked_in → completed` (or `cancelled` / `expired`)
- Unique constraint: only one active reservation per table (`idx_one_active_reservation_per_table`)

**Core RPC functions (security definer, called via service_role only):**
- `claim_table(customer_id, restaurant_id, group_size)` — finds smallest available table that fits, reserves it, sets 5-minute expiry, creates notification
- `cancel_reservation(reservation_id, customer_id)` — releases table back to available
- `check_in_reservation(reservation_id, customer_id, qr_token)` — validates QR token match, marks checked-in, sets table to occupied
- `expire_reservations()` — auto-expires any claimed reservation past its `expires_at` timestamp
- `staff_set_table_status(profile_id, table_id, status)` — staff can manually manage table states

**Capacity handling:**
- System finds the **smallest available table** that fits the group (ORDER BY capacity ASC)
- Uses `FOR UPDATE SKIP LOCKED` to prevent race conditions on concurrent claims
- One active reservation per customer enforced

### Restaurant Detail Screen (as built)

Shows restaurant info + available tables filtered by exposure mode:
- Hero image with back arrow + heart (favorite) overlay
- Name, address, hours, distance
- Date/time selection (inline)
- Table list with capacity indicators
- "Claim This Seat" CTA (orange pill, full-width)
- Pre-order option after claiming

---

## 7. CHECK-IN METHOD: DYNAMIC QR (IMPLEMENTED)

### How it works

Each table has a static `qr_token` stored in the database. For the demo, the check-in flow uses QR code scanning:

1. **Staff displays QR:** The staff/owner management screen shows the table's QR token (can be printed as a laminated card or displayed on a device)
2. **Customer scans:** After claiming a table, the customer navigates to QR Scan screen (`QrScanScreen.tsx`, 5.6KB) using `expo-camera` barcode scanning
3. **Validation:** Backend verifies:
   - The scanned token matches the claimed table's `qr_token`
   - The reservation hasn't expired (still within 5-minute window)
   - The customer owns the reservation
4. **On success:** Reservation status → `checked_in`, table status → `occupied`, navigates to Presence Mode

### Dynamic QR Security (backend)

The backend supports **HMAC-signed rotating QR tokens** for production use:
- `DYNAMIC_QR_SECRET` environment variable for signing
- `DYNAMIC_QR_TTL_SECONDS` (default 600 = 10 minutes) for rotation
- GPS proximity check capability (rejects check-ins >100m from restaurant if coordinates available)

### Why QR instead of NFC

NFC requires `react-native-nfc-manager` which needs a **Custom Dev Client** (not compatible with Expo Go). For the competition demo running on Expo Go, QR scanning via `expo-camera` works without any native module restrictions. NFC is a post-competition upgrade.

---

## 8. BUSINESS MODEL (UNCHANGED STRATEGY, UPDATED IMPLEMENTATION STATUS)

### What's implemented in the MVP

- ✅ Restaurant onboarding (owner signup → restaurant creation → table setup)
- ✅ Table claiming with 5-minute hold (the core "seat certainty" value)
- ✅ Check-in verification (QR-based)
- ✅ Staff table management (status changes, reservation visibility)
- ✅ Favorites system
- ✅ Notification system (in-app)
- ✅ Pre-ordering (menu items linked to reservations)

### What's deferred

- ❌ Payment processing (PayMongo integration)
- ❌ No-show hold fees (tracked in logic, not charged)
- ❌ Subscription tiers (Pro/Business SaaS)
- ❌ Featured boosts (paid placement)
- ❌ Data reports (analytics product)

### Revenue model (unchanged from v3.1)

| Revenue Stream | Type | Status |
|---|---|---|
| Pro Subscriptions (₱799/mo) | Recurring B2B | Post-MVP |
| Business Subscriptions (₱2,499/mo) | Recurring B2B | Post-MVP |
| No-Show Hold Fees (20% cut) | Transaction | Logic ready, payment deferred |
| Featured Boosts | Performance | Post-MVP |
| Data Reports | B2B Project | Future roadmap |

### Guiding principle

Land free (onboard restaurants at zero cost), monetize trust (once they see value in table management + visibility, offer paid tiers). The competition demo proves the core loop works end-to-end without requiring payment infrastructure.

---

## 9. AI & SMART FEATURES (STATUS)

### A. CCTV-Assisted Occupancy Detection — DEFERRED

The YOLOv8-nano edge-device inference (Raspberry Pi 5 / Android tablet) is not in the MVP. Table status is managed manually by staff through the Owner Management screen (`OwnerManagementScreen.tsx`, 20KB).

**Why deferred:** Hardware cost (~₱3,500/unit), deployment complexity, and the fact that manual staff management achieves the same outcome for a demo with seeded restaurants.

### B. The Equalizer Algorithm — NOT IN MVP

Walk-time routing, cuisine/price matching, real-time seat count weighting — these algorithmic recommendations are not implemented. The Home screen shows categories, picks, trending, and featured sections using simple database flags (`is_featured`, `is_trending`) set during seeding.

**Why this is fine:** Explore Mode deliberately refuses algorithmic ranking (theme requirement). The Home screen uses curated editorial sections rather than ML-driven personalization. For a competition demo, this is actually more aligned with the pitch than a recommendation engine would be.

### C. Peak Prediction & No-Show Detection — DEFERRED

These require historical data accumulation that a fresh demo doesn't have. The infrastructure (PostgreSQL with timestamped reservations, pg_cron for scheduled jobs) supports future implementation.

### What IS smart in the MVP

- **Sensor fusion for Presence Mode** — accelerometer + gyroscope + AppState detection is genuinely novel UX engineering
- **Overpass API geographic query** — real-time radius search for food establishments using OSM data, category-aware pin coloring
- **Race-condition-safe table claiming** — `FOR UPDATE SKIP LOCKED` in PostgreSQL ensures correctness under concurrent load
- **Auto-expiry** — `expire_reservations()` runs on every claim attempt, keeping table state consistent without cron dependency


---

## 10. COMPETITIVE LANDSCAPE

### Direct Competitors: None in the Philippines combining seat-certainty + presence + non-hype discovery

### Indirect Competitors

| Competitor | Why They're Different | Why Seated Wins |
|---|---|---|
| Google Maps / "Busy Times" | Historical patterns, ranked by popularity, no seat claim | Seated is real-time, lets you claim a seat, Explore Mode withholds popularity ranking |
| Social-media food discovery | Optimized for engagement, converges on viral spots | Explore Mode surfaces by neutral geography, not trending status |
| OpenTable / Klook | Fine dining, formal bookings, no presence concept | Works for a 30-minute carinderya lunch + adds Presence Mode |
| Grab / Foodpanda | Delivery, not dine-in | Seated is for physical seating and what happens once you're there |
| "Just showing up" | Current behavior, no information | Removes gambling on seat availability AND social exposure |

### Defensive Moats

- **Local restaurant onboarding network** — Grab won't bother onboarding 200 carinderyas
- **OSM + partner dual-layer discovery** — a map view that neither pure-Google nor pure-social can replicate
- **Presence Mode as category creator** — no existing dining app treats "phone down" as a first-class product feature
- **RPC-level reservation correctness** — PostgreSQL-enforced constraints that can't drift out of consistency

---

## 11. TECH STACK (AS BUILT — v4.0)

### Mobile App
| Technology | Purpose |
|---|---|
| Expo SDK 54 (React Native, TypeScript) | App framework |
| react-native-maps (Apple Maps provider) | Map display in Explore Mode |
| expo-location | User positioning, distance calculations |
| expo-camera | QR code scanning for check-in |
| expo-sensors (Accelerometer, Gyroscope) | Presence Mode phone-down detection |
| expo-notifications | Local notifications for presence sessions |
| @react-navigation/native + bottom-tabs + native-stack | Navigation (5 tabs, multiple stacks) |
| react-native-safe-area-context | Device UI clearance |
| @expo/vector-icons (Ionicons) | Icon system |
| AsyncStorage | Exposure Control persistence, session tokens |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI (Python) | REST API server |
| Supabase (PostgreSQL + PostGIS) | Database, auth, realtime, storage |
| Supabase Auth | Email/password authentication with email confirmation |
| Supabase Realtime | Live table status updates |
| OpenStreetMap Overpass API | Nearby place discovery (free, no key) |
| pg_cron | Scheduled reservation expiry |
| HMAC-SHA256 | Dynamic QR token signing |

### Project Structure

```
Seated/
├── frontend/                    — Expo/React Native app
│   ├── src/screens/             — 18 screens
│   │   ├── AuthScreen.tsx       — Login/signup (13KB)
│   │   ├── ExposureControlScreen.tsx — Mode selection (5.4KB)
│   │   ├── HomeScreen.tsx       — Main feed (26KB)
│   │   ├── ExploreScreen.tsx    — Map discovery (35KB)
│   │   ├── RestaurantDetailScreen.tsx — Detail + claim (11KB)
│   │   ├── ReservationsScreen.tsx — Active reservations (22KB)
│   │   ├── PreOrderScreen.tsx   — Food ordering (17KB)
│   │   ├── QrScanScreen.tsx     — QR check-in (5.6KB)
│   │   ├── PresenceModeScreen.tsx — Presence session (36KB)
│   │   ├── SearchScreen.tsx     — Search (3.9KB)
│   │   ├── RestoListScreen.tsx  — Restaurant list (5.4KB)
│   │   ├── FavoritesScreen.tsx  — Saved restaurants (5.3KB)
│   │   ├── NotificationsScreen.tsx — Alerts (6.7KB)
│   │   ├── ProfileScreen.tsx    — User profile (7.9KB)
│   │   ├── SettingsScreen.tsx   — App settings (3.6KB)
│   │   ├── StaffScreen.tsx      — Staff table mgmt (14KB)
│   │   ├── OwnerManagementScreen.tsx — Owner dashboard (20KB)
│   │   └── OwnerOnboardingScreen.tsx — Restaurant setup (5KB)
│   ├── src/navigation/         — Tab + stack navigators
│   │   ├── MainTabs.tsx        — 5-tab layout (Home, Explore, Claim, Alerts, Profile)
│   │   ├── HomeStack.tsx       — Home → Search → Detail → Claim → QR → Presence
│   │   ├── ExploreStack.tsx    — Explore → Detail → Claim → QR → Presence
│   │   ├── ClaimStack.tsx      — Active reservations → QR → Presence
│   │   ├── ProfileStack.tsx    — Profile → Reservations → Favorites → Settings
│   │   ├── StaffStack.tsx      — Staff/owner management
│   │   └── AuthStack.tsx       — Auth flow
│   ├── src/services/           — API, session, realtime, favorites, exposure
│   ├── src/hooks/              — usePresenceDetection, usePresenceNotification
│   ├── src/components/         — CustomTabBar, RestaurantCard, LoadingState, ErrorState
│   └── src/theme.ts           — Complete design system (colors, typography, spacing, shadows)
├── backend/                    — FastAPI API
│   ├── main.py                — All routes (37KB)
│   ├── schemas.py             — Pydantic models
│   ├── database.py            — Supabase client setup
│   └── tests/                 — pytest suite
└── supabase/migrations/        — 5 versioned migrations
    ├── 001_mvp_schema.sql     — Core tables, RPC functions, RLS policies
    ├── 002_seed_demo_data.sql — Demo restaurants for Cauayan City
    ├── 003_production_operations.sql — Operational helpers
    ├── 004_consistency_and_security.sql — Additional constraints
    └── 005_email_confirmation.sql — Auth verification flow
```

### API Endpoints (implemented)

**Auth:** POST `/auth/signup/customer`, `/auth/signup/owner`, `/auth/login`, `/auth/refresh`, `/auth/verify-email`, `/auth/resend-confirmation`

**Restaurants:** GET `/restaurants`, `/restaurants/{id}`, `/restaurants/search`, `/home` (feed with picks/trending/featured)

**Discovery:** GET `/places/nearby?lat=X&lng=Y&radius=2000` (OSM Overpass query)

**Reservations:** POST `/reservations`, GET `/reservations/me`, POST `/reservations/{id}/cancel`, `/reservations/{id}/check-in`

**Favorites:** GET `/favorites`, POST `/favorites`, DELETE `/favorites/{id}`

**Staff:** GET `/staff/restaurants`, `/staff/restaurants/{id}/reservations`, PATCH `/staff/tables/{id}`

**Menu/Pre-order:** GET `/restaurants/{id}/menu`, POST `/orders`

---

## 12. DESIGN SYSTEM (AS BUILT)

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| background | `#FFFDF4` | App background, warm cream |
| screenBg | `#F6F1E8` | Screen/page background |
| surface | `#F6F2E9` | Cards, elevated containers |
| primary | `#FF6A00` | CTAs, active nav, accent |
| secondary | `#FFBF00` | Gold highlights, promo badges |
| textPrimary | `#141517` | Headings, body text |
| textSecondary | `#828282` | Descriptions, metadata |
| textMuted | `#AFAFAF` | Placeholders, inactive labels |
| success | `#86D433` | Available, confirmed |
| error | `#F20000` | Error states, destructive actions |

### Typography: Urbanist (all weights: 400, 600, 700, 800, 900)

### Navigation: 5-tab bottom bar with center gradient CTA button (dice icon)
- Home | Explore | [Claim CTA] | Alerts | Profile
- Staff/owners see "Manage" instead of "Claim"
- Custom tab bar with orange glow on center button, 32px rounded top corners

### Design philosophy
- **Warmth over sterility** — cream tones, not clinical white
- **Calm over urgency** — no "X people looking at this" pressure
- **Choice over default** — non-hierarchical option presentation
- **Presence over noise** — generous whitespace, minimal information density

---

## 13. GO-TO-MARKET: CAUAYAN CITY / TUGUEGARAO FIRST

Same strategy as v3.1, now with concrete demo data:
- Demo seeded with restaurants in Cauayan City, Isabela
- Map defaults to Tuguegarao region (lat 16.93, lng 121.767)
- Target: local carinderyas, cafes, food stalls that have zero digital presence
- Student population at ISU / UCV as initial user base
- Explore Mode OSM data already shows all food establishments in the area without any onboarding needed

---

## 14. WHAT SEATED IS NOT

- Not a food delivery app (no delivery logistics)
- Not a formal dining reservation system (works for 30-minute lunches)
- Not a food ordering app (pre-ordering is optional, not the core value)
- Not surveillance (no CCTV in MVP; Presence Mode stores nothing beyond the session)
- Not a rating/review platform (Explore Mode has no star ratings by design)
- Not a social media app (no feeds, no followers, no public profiles)
- Not a payment app (no wallet/payment in MVP)

---

## 15. THE PITCH ANCHOR

> *"Every day, people trade away control the moment they sit down to eat — squeezed next to strangers with no say in it, phones out because that's just what everyone does at the table, walking toward whatever's trending because that's what showed up on a feed. None of that was ever a choice.*
>
> *Seated asks a different question: what if the connections around a meal — who you sit near, whether your phone gets your attention or the person across from you does, and how you even found this place — were something you chose, not something the crowd, the habit, or the algorithm decided for you?*
>
> *We don't just get you a seat. We give you back the say in what happens once you're in it."*

### Demo flow for judges (3 minutes)

1. **Exposure Control** → Pick "With My Group" (10 sec)
2. **Home** → Browse picks, tap a restaurant (15 sec)
3. **Explore Mode** → Show map with orange + teal pins, filter chips (30 sec)
4. **Restaurant Detail** → Show tables, claim one (15 sec)
5. **Pre-Order** → Add food items to the order (15 sec)
6. **QR Scan** → Scan table QR, check in (15 sec)
7. **Presence Mode** → Place phone face-down, show timer running, pick up to show pause, conversation prompts rotating (60 sec)
8. **Complete Session** → Confetti, +50 points (10 sec)
9. **Staff View** → Show owner management screen, table statuses updating (10 sec)

---

## 16. OPEN QUESTIONS (UPDATED)

- [ ] NFC check-in: upgrade to Custom Dev Client build post-competition?
- [ ] PayMongo: integrate for real no-show hold fees in v1.1?
- [ ] Crowd-Sensing POI: implement the user-submitted pin + corroboration flow?
- [ ] CCTV AI: pursue hardware deployment for pilot restaurants?
- [ ] Presence Mode: add opt-in OS-level DND (requires native module)?
- [ ] Offline mode: what happens when cellular drops mid-session?
- [ ] Pre-ordering: connect to kitchen display / POS system?
- [ ] Points system: implement Seated Points redemption (currently earned but not spent)?
- [ ] Multi-language: Tagalog / Ilocano localization for Cagayan Valley users?

---

## Team

- **Randel Serafica** — Team Leader
- **Gem Cordova** — Team Member
- **Christy Prejido** — Team Member
- **Sander Sedano, MIT** — Mentor

---

*Document reflects the actual built product as of July 2025. Version 4.0.*
