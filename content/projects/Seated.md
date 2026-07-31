# 🪑 SEATED — Full Startup Brief
### *Disconnected by Design: Redesigning How People Connect Around a Meal*
*Startup Competition Reference Document — Version 3.1*
*(v3.0: revised for "つながらない価値 — Disconnected by Design" theme fit — original seat-certainty product retained as supporting infrastructure, front-facing pitch restructured around connection quality, not connection speed. v3.1: mobile stack migrated from Flutter to Expo/React Native + TypeScript; no product or feature changes.)*

---

## 0. WHY THIS VERSION EXISTS

The original Seated brief (v2.0) solved a real problem — people can't find seats, restaurants lose walk-by traffic — but its core optimization target was **certainty and speed of connection**: get a hungry person into a seat as fast and predictably as possible. That is close to the opposite of what this theme asks. The theme's opening question is whether constant connectivity actually produces meaningful interaction — and a product whose entire value proposition is "more certainty, more speed, more successful matches between people and seats" doesn't answer that question, it dodges it.

This version keeps the underlying infrastructure (NFC check-in, real-time seat tracking, Supabase backend) but changes what the product is *for*. Three new mechanisms carry the actual theme argument. Everything else — seat-finding, no-show fees, peak prediction — is now supporting plumbing underneath these, not the headline.

**The old rule, stated plainly:** public eating spaces are designed around throughput — get more people through more seats, faster — and if you want solitude, or to disengage from your phone, or to discover something on your own terms, you get whatever's left over or you pay a social cost for asking.

**The new rule:** your desired level of contact — with strangers, with your phone, with what's trending — is the thing the system is built around, and choosing less of it costs you nothing.

---

## 1. THE PROBLEM: THIS IS NOT ABOUT CHAIRS

Let's be blunt about what actually happens when there are no seats — and about what happens even when there are.

A college student has a 30-minute lunch break. She skips her first choice because the line outside tells her it's full. She walks to the next place — full. She finally gets a seat, but it's wedged at a communal table between two strangers, elbow to elbow, phone out because there's nothing else to do with the forced proximity and the eight minutes she has left. She never chose any of this — not the strangers, not the noise, not the reflex to look at her phone instead of the moment in front of her. She just took whatever the room gave her.

Scale that up. A construction worker on a one-hour break. A nurse finishing a 12-hour shift who wants five minutes of actual quiet, not another wall of noise. A small business owner who eats with friends but spends half of it looking at a screen because everyone else at the table already has theirs out, and nobody wants to be the one who puts it away first.

**The problem was never just "can I find a seat." It's "once I have one, do I get any say in what happens to me while I'm in it" — who I'm forced next to, how much noise I'm exposed to, whether my phone or the person across from me gets my attention, and whether the place I'm even walking toward was something I found or something a trending list found for me.**

Right now, the answer to all of that is: no say at all. The room decides. The feed decides. The algorithm decides. Seated exists to hand some of that back.

### What This Costs Restaurants

A local carinderya three blocks away has 12 empty seats during peak hour and no way to signal that to anyone nearby. Meanwhile the same five viral spots absorb all the foot traffic because that's what shows up on everyone's feed. Smaller, genuinely good places stay invisible not because they're worse, but because nobody's discovery process ever routes through them.

---

## 2. THE SOLUTION: SEATED

**Seated** is a real-time seat and dining platform built around three connected mechanisms, each answering a different piece of the theme:

1. **Exposure Control** — you decide how much contact with strangers you want before you commit to a place (privacy / distance)
2. **Presence Mode** — when you sit down with people you know, disconnection from your phone is the default, not something you have to enforce on yourself (freedom to disconnect)
3. **Explore Mode** — a discovery map built on what real people found, not on what's trending or influencer-endorsed (meaningful interaction with a place, not with a feed)

Underneath all three, the original seat-certainty infrastructure (real-time availability, NFC check-in, no-show handling) still runs — but it's supporting infrastructure now, not the pitch.

**One line:** *Seated doesn't just get you a seat. It lets you decide what happens once you're in it.*

---

## 3. FEATURE 1 — EXPOSURE CONTROL

### The old default and the new one

Old rule: if a restaurant is full, you get whatever proximity to strangers is left — a shared communal bench, a squeezed-in stool, no say in it. New rule: you declare your desired contact level *before* you walk, and the system honors it.

### How it works

Before browsing restaurants, the user picks one of three modes:
- **Solo** — a single seat, no expectation of company, explicitly framed as supported rather than tolerated (see below)
- **Shared, open to strangers** — a communal-table slot, anonymous, no obligation to interact
- **With people I choose** — a private table locked for a specific group

This reuses the existing Table vs. Individual Seat layer from the original design (Section 4 in v2.0), but promotes it from a filter buried in restaurant search to the **first screen of the app** — the thing you choose before you choose a place.

Restaurants configure this the same way as before: table definitions, solo-only counters, PWD/senior locks, outdoor toggles. Nothing changes technically; what changes is that this becomes the app's front door instead of a side option.

### Destigmatizing solo dining

Solo mode doesn't visually mark a person as "waiting for someone" or otherwise flag them as alone by accident. It's a deliberate, supported state — the app treats eating alone as a restorative choice, not a gap to be filled. This is the direct answer to "solitude" as a specific theme word, distinct from "silence" or "privacy."

### Zero-cost disconnection, scoped correctly

Backing out of *company* — leaving a shared table early, declining to be pulled into conversation, switching from shared to solo mid-visit — costs nothing and needs no justification.

This is explicitly **not** the same system as the no-show hold fee (Section 8), which governs *seat logistics*, not interpersonal disengagement. A no-show fee protects a scarce physical resource during peak hours and has no relationship to the theme one way or the other — it stays exactly as in v2.0. What's zero-cost is disengaging from *people*, not disengaging from a *reservation you made and didn't use*. Keeping these two systems clearly separate matters — conflating them either overcorrects the business model or undercuts the theme story.

### Why this answers OGIS's specific line

*"Questions what should be connected, why, and to what extent"* — Exposure Control is that question asked literally, per person, per visit: should this person be connected to this seat, why (their stated preference), to what extent (whole table locked vs. anonymous shared slot vs. solo). This is the most literal match to the judging rubric in the whole product.

---

## 4. FEATURE 2 — PRESENCE MODE

### The old default and the new one

Old rule: once you sit down with people, what happens to your phone is left entirely to individual willpower — nobody designed that moment, it defaults to everyone scrolling, and staying present takes conscious effort. New rule: the group's check-in *is* the trigger that flips the default — presence is what happens automatically, and reaching for distraction is the thing that now takes a deliberate action.

### How it works

1. A group checks in together at a table via the existing NFC tag / QR flow (unchanged from v2.0's check-in mechanism).
2. That group check-in starts a shared **Presence Session** for the table. Each participant's device defaults into a quiet state for the session — notifications silenced, the Seated app itself locked to a minimal "session active" screen.
3. Un-silencing requires a visible, deliberate action (not a hidden setting) — e.g., explicitly stepping out of the session. This flips which behavior takes effort: right now silence takes effort, so this design makes distraction take the effort instead.
4. Each person at the table sees their own group's session status ("Present since 12:04") — visible only to the people physically at that table, never reported to the restaurant, never stored as analytics, never used for ranking or scoring anyone.
5. Leaving the session early costs nothing socially or functionally — no penalty, no note to anyone, no record kept beyond the session itself.

### Restaurant-side incentive (optional, not required for MVP)

Restaurants can optionally designate certain tables as "Presence-friendly" zones — quieter seating, maybe a small perk (a free item, faster service) — turning phone-down dining into something the restaurant actively curates, not just something the app suggests. This reintroduces OGIS's "why and to what extent" question at the restaurant level: the restaurant decides which tables get this treatment and why.

### Why this is the direct answer to the theme's central question

"Does constant connectivity always lead to meaningful interaction?" — nothing else in Seated actually engages this question; Exposure Control and Explore Mode both address *what* you connect to, but Presence Mode is the only feature that touches connectivity itself, in the literal sense the theme opens with (phones, notifications, screens displacing the people already in front of you). This should be positioned as the headline mechanism in the pitch, not a secondary add-on.

### Honest limitation

A soft reminder to "put your phone down" is decoration, not structure — it fails the theme's own test (Mistake #3: making it about individual willpower). What makes this structural instead of a nudge is that the *default* changes, not just the suggestion: presence is automatic on check-in, and distraction is the opt-out, not the other way around.

---

## 5. FEATURE 3 — EXPLORE MODE

### The old default and the new one

Old rule: food discovery runs through trending lists, influencer opinion, and engagement-optimized ranking — everyone converges on the same handful of viral spots, and the personal act of finding a place gets replaced by consuming someone else's curation. New rule: what's shown to you reflects neutral facts and what real people independently confirmed exists — never popularity, never trending status, never a ranked "recommended for you."

### Two data layers

1. **Baseline layer** — legitimate public POI data (Google Places API or OpenStreetMap), giving basic facts: name, category, price bracket, hours, distance. No star ratings, no review counts, no "trending near you" surfaced by default. *(Note: this layer alone does not solve "hidden places" — anything not already indexed on Google won't appear here either, which is why Layer 2 exists.)*
2. **Seated-exclusive layer** — places that exist in Seated specifically because the team's own onboarding reached them, or because users found and confirmed them (see Crowd-Sensing POI below), or because an owner self-registered. Visually distinguishable from baseline-layer pins (different marker style).

### Crowd-Sensing POI (how hidden places get added)

- **Tag:** a user who finds an unlisted place drops a pin at their GPS location, takes one storefront photo, picks a category. This creates an invisible "candidate" — not yet shown to anyone else.
- **Corroboration:** the candidate stays hidden until independently confirmed — different accounts, tight GPS clustering (~15–20m) around the original pin, spread across different times so one person can't fake it with alt accounts in one sitting. A minimum threshold (tunable, e.g. 3 unique confirmations) promotes it to visible.
- **What gets shown, and what doesn't:** once promoted, the place appears with a single **binary "Verified" badge** — not a confirmation count, not a ranking, not a "X people found this" number. Confirmation counts exist only on the backend, purely for the existence-verification logic. This distinction matters and is easy to get wrong — see the note below.
- **Owner self-registration:** an owner can add their own place directly (reusing the existing onboarding flow from Section 6), skipping the crowd-confirmation gate but going through lightweight identity verification instead (phone OTP tied to the business, or an in-app photo-at-location check).
- **Personal log, not public leaderboard:** the original discoverer can see their own private "places I found" history — visible only to them, never shared or ranked publicly. This is where any sense of pride or magnitude lives; it stays personal, not social proof.

### Why counts stay hidden — this is the part worth getting right

Showing "12 people confirmed this place" recreates the exact mechanism the theme is skeptical of, just with a different source. The theme's actual complaint about trending/influencer content isn't "who's behind the number" — it's that a visible quantity of other people's choices replaces your own judgment with a shortcut. That happens the same way whether the number comes from a celebrity or from 47 ordinary users: humans read "many people did this" as "worth doing," not as "verified to exist." A visible count also recreates the same flywheel (early attention → more visits → more confirmations → winner-take-most) and creates a real incentive to fake confirmations, which doesn't exist when the count only gates a binary badge. A binary "Verified" badge gives users the trust signal (this is real, not one person's claim) without giving anyone a magnitude to chase or compare across places.

### No ranking, ever, in this mode — and the contradiction to name out loud

Explore Mode has no popularity sort, no personalization, no "recommended for you." Everyone standing in the same place sees the same map. The one exception is the "explore something unfamiliar" toggle, which biases results toward places the user (specifically) hasn't checked into before — a bias against the platform's own gravity toward showing what's already been found, not a ranking by anyone else's behavior.

This deliberately conflicts with the existing Equalizer algorithm used in seat-finding (Section 9), which *is* popularity- and acceptance-rate-driven. That's fine, and it should be stated explicitly in the pitch rather than hidden: Reserve Mode optimizes for certainty during a time-pressured meal (an honest, non-contradictory use of ranking in that context); Explore Mode deliberately refuses to rank anything, because its purpose — helping someone find something for themselves — is different. Judges will trust an explicit, named boundary between the two more than a product that quietly avoids the contradiction.

### Moderation and abuse considerations (stated honestly)

- Photos must be storefront/signage only; anything with identifiable faces gets flagged/blurred or rejected before promotion.
- Account-age minimums and basic device-fingerprint checks reduce (not eliminate) sock-puppet confirmation.
- Low-density areas may never reach the confirmation threshold organically — the owner self-registration and manual review paths exist specifically to not gate legitimacy solely on foot traffic.
- The anti-abuse logic here is v1 and tunable, not hardened. For a competition-stage MVP, the honest position is: the tagging/confirmation flow works end to end, and the fraud-resistance thresholds are acknowledged as an area for iteration — not oversold as solved.

### Feasibility (unchanged conclusion from prior analysis)

Fully buildable on the existing stack:
- **Map/UI:** Expo (React Native, TypeScript) + `react-native-maps` (Google Maps provider), the same map layer already used for the Equalizer — no new framework.
- **Geospatial clustering:** PostGIS on Supabase (Postgres extension, natively supported) handles the radius/clustering logic for corroboration.
- **Photo storage:** Supabase Storage, same as existing menu/restaurant images.
- **EXIF/GPS validation:** standard metadata check on upload, doable in a Supabase Edge Function.
- **Moderation queue:** an added view in the existing Next.js staff/admin dashboard — UI work, not new infrastructure.
- **Genuinely new work:** the moderation tooling and the discipline of *not* surfacing signals (ratings, counts) that would be trivial to add but would undercut the entire premise.

---

## 6. THE SEAT PROBLEM: TABLES VS. INDIVIDUAL SEATS (unchanged infrastructure)

Restaurants are not uniform — long communal tables, small counters, pushed-together 4-seaters. Seated tracks two parallel layers, now presented to the user through Exposure Control (Section 3) rather than as a bare seat-search filter:

- **Table Reservations** — a group claims a specific table, locked until check-in or a 5-minute expiry.
- **Individual Seat Slots** — solo diners claim a single shared-friendly slot (counter seats, communal tables) without reserving a whole table.
- **Special categories** — PWD/senior seats locked from the pool entirely; outdoor seats toggle off in one tap; counter/bar stools auto-tagged solo-only; pushed-together tables auto-separate when cleared.

A restaurant with 40 seats shows: *8 private tables (2–6 people) · 6 solo counter seats · Outdoor: closed today* — paired now with each table/zone's Presence-friendly status and noise/crowd-density signal, so a diner is choosing based on desired contact and atmosphere, not just raw availability.

---

## 7. THE WALK-IN PROBLEM & CHECK-IN METHOD (unchanged from v2.0)

- **Table Status Marker:** laminated "RESERVED — Seated App" card placed by staff on confirmation.
- **Staff Notification:** staff app pings on claim; markers placed proactively.
- **Walk-In Grace Window:** arriving party can flag "Seat Taken"; timer pauses during a reported conflict, no penalty to the reserving customer.
- **NFC + Dynamic QR Hybrid check-in:** NFC sticker per table (~₱15–₱30, one-time), QR fallback that rotates every 10 minutes server-side, GPS proximity check (rejects check-ins >100m from the restaurant).

This same check-in event is now also the trigger for Presence Mode (Section 4) — no new hardware, just a second function attached to an existing tap.

---

## 8. BUSINESS MODEL

### Guiding principle, updated

The original framing was "land free, monetize trust." That still holds for restaurant onboarding. What changes is which revenue streams stay in the front-facing pitch versus which stay as background/future mechanics — because some of the original monetization directly contradicts the theme story if it's foregrounded.

### Kept as-is (resource/operations — no theme conflict either way)

- **Tier 0 Free / Tier 1 Pro (₱799/mo) / Tier 2 Business (₱2,499/mo)** — unchanged from v2.0. AI peak prediction, CCTV smart vacancy, menu analytics, multi-branch dashboards. This is legitimate SaaS value for restaurants and doesn't touch the connectivity question either way.
- **No-Show Hold Fee** — unchanged, and explicitly *not* reframed as a theme conflict. This governs a scarce physical resource during peak hours (someone claiming a seat and not showing costs another hungry person their lunch); it has nothing to do with interpersonal disconnection. Keep it exactly as designed. The zero-cost-disconnect principle in Section 3 applies to backing out of *company*, not backing out of a *reservation* — these are deliberately separate systems and should be described as such if asked.

### Downplay in the pitch (kept as real revenue mechanics, but not part of the theme narrative)

- **Featured Boosts** targeting time-pressured, hungry users at high purchase-intent moments — this is an urgency-driven connection pattern, which works against the pitch even though it's a legitimate ad product. Keep it running the business; don't lead with it.
- **Aggregated Insights (data-as-a-service)** to malls, developers, FMCG brands — legitimate B2B revenue, but "aggregated behavioral data from hungry people" reads as surveillance monetization next to a privacy-and-disconnection pitch. Move to a "future revenue, post-MVP" footnote rather than the main business model slide.

### Revenue Summary (unchanged figures, reordered by pitch prominence)

| Revenue Stream | Type | Est. Monthly (Year 1, Tuguegarao) | Pitch prominence |
|---|---|---|---|
| Pro Subscriptions (₱799 × 15) | Recurring B2B | ₱11,985 | Primary |
| Business Subscriptions (₱2,499 × 3) | Recurring B2B | ₱7,497 | Primary |
| No-Show Hold Fees (20% cut) | Transaction | ₱15,000 | Primary (framed as ops, not theme) |
| Featured Boosts | Performance | ₱16,000 | Secondary — mention if asked |
| Data Reports (1 mall deal) | B2B Project | ₱15,000 | Future roadmap, not MVP pitch |
| **Total Estimated Month 12** | | **~₱65,000/month** | |

---

## 9. THE AI COMPONENT (unchanged technically, reframed by purpose)

### A. CCTV-Assisted Occupancy Detection (Smart Vacancy)

Technical design unchanged from v2.0: edge-device YOLOv8-nano object detection, table-zone-only bounding boxes, four-state classification (Available / Likely Vacating / Occupied / Cleaning), 90% confidence threshold for auto-update, no video storage, no facial recognition, no individual tracking — only state labels leave the device.

**Reframed purpose:** in v2.0 this existed purely to maximize turnover accuracy. It still does that, but it now has a second job — keeping designated solo/private/Presence zones honest (flagging if a quiet zone is being encroached on by overflow seating), which ties the AI layer back into Exposure Control and Presence Mode rather than being pure throughput optimization.

### B. The Equalizer Algorithm (Diversion Engine) — unchanged, explicitly scoped to Reserve Mode only

Walk-time routing, cuisine/price matching, real-time seat count, historical acceptance rate, time-of-day learning. This stays exactly as designed — and stays confined to Reserve Mode. It is explicitly *not* used in Explore Mode (Section 5), and the pitch should name that boundary directly rather than let a judge find the contradiction first.

### C. Peak Prediction Engine & D. No-Show Pattern Detection — unchanged from v2.0.

---

## 10. COMPETITIVE LANDSCAPE

### Direct Competitors: None in the Philippines combining seat-certainty + non-hype discovery

### Indirect Competitors

| Competitor | Why They're Different | Why Seated Wins |
|---|---|---|
| Google Maps / "Busy Times" | Historical patterns, ranked by popularity, no seat claim | Seated is real-time, lets you claim a seat, and Explore Mode deliberately withholds popularity ranking |
| Social-media food discovery (viral/influencer lists) | Optimized for engagement, converges everyone on the same spots | Explore Mode surfaces places by neutral facts and independent user confirmation, not trending status |
| OpenTable / Klook | Fine dining, formal bookings | Works for a 30-minute carinderia lunch |
| Grab / Foodpanda | Delivery, not dine-in or in-person social experience | Seated is for physical seating and what happens once you're there |
| "Just showing up" | Current behavior | Removes the gambling on both seats and unwanted social exposure |

### Defensive Moats

- **Local restaurant onboarding network** — same as v2.0; Grab/Jollibee won't bother onboarding 200 carinderyas, Seated will.
- **Crowd-Sensing POI dataset** — a discovery layer that Google's own indexing can't replicate, because it's built from users physically finding places, not from search/review activity.
- **CCTV AI calibration** — months of per-restaurant tuning, a head start any copycat has to rebuild from scratch.

---

## 11. TECH STACK & TECHNICAL ARCHITECTURE (v3.1 — migrated from Flutter to Expo/React Native)

### Mobile App (Diner + Staff)
Expo (React Native, TypeScript), Zustand or Redux Toolkit for app state, TanStack Query (React Query) for server-state/data-fetching against Supabase, `react-native-nfc-manager` for NFC read/write, `expo-camera` (or `react-native-vision-camera`) for QR scanning, `react-native-maps` (Google Maps provider) + OpenRouteService (pedestrian routing, unchanged), `expo-notifications` for push (built on top of FCM/APNs under the hood, same underlying delivery as v2.0's direct Firebase Cloud Messaging integration).

*Important build-tooling note:* NFC (via `react-native-nfc-manager`) is a native module and is **not supported inside the plain Expo Go sandbox app** — it requires an Expo **Custom Dev Client** or an EAS-built standalone binary. This doesn't block development (Expo's managed workflow still supports it through EAS Build/prebuild), but it does mean the team can't demo NFC check-in purely inside Expo Go on a judge's or teammate's phone without first installing a custom dev build. Worth planning the demo device/build pipeline around this rather than discovering it close to the deadline.

*Addition for Presence Mode:* OS-level notification-silencing achieved via `expo-notifications` (setting notification handlers/interruption levels) plus, where deeper silencing is needed (e.g. full Do-Not-Disturb-style behavior), a thin native module through Expo's config plugin system — same custom-dev-client requirement as NFC above, since this also falls outside what plain Expo Go can do. Triggered on group NFC check-in, same as v2.0's design intent.

*Addition for Explore Mode:* same `react-native-maps` instance, second data layer/query mode; PostGIS (via Supabase) for corroboration clustering — unchanged from prior version, framework-agnostic on the backend side.

### Backend
Supabase (PostgreSQL + PostGIS), Supabase Realtime, Supabase Auth, Supabase Storage, Supabase Edge Functions (Deno), pg_cron.

### AI / Computer Vision
YOLOv8-nano (ONNX Runtime), OpenCV pre-processing, on-site edge inference (Raspberry Pi 5 / Android tablet) — unchanged.

### Payments
PayMongo API (GCash/Maya) — unchanged.

### Admin / Staff Portals
Next.js on Vercel — unchanged, plus a moderation-queue view for Crowd-Sensing POI review.

### Security (unchanged, extended)
AES-256 NFC tokens, HMAC-signed rotating QR, GPS proximity check on check-in, Supabase RLS. *Extended:* Presence Session data (who's "present," timestamps) is never stored beyond the session and never exposed outside the specific table's participants.

---

## 12. GO-TO-MARKET: TUGUEGARAO FIRST (unchanged from v2.0)

Same launch sequence — canteen partners first, walk-in onboarding of local restaurants, student council partnerships, "First 100 Users" perks. Crowd-Sensing POI tagging launches alongside Explore Mode in Month 2, seeded initially by the team's own onboarding walks so the map isn't empty at launch.

---

## 13. WHAT SEATED IS NOT

- Not a food delivery app
- Not a formal dining reservation system
- Not a replacement for walk-in customers — it complements them
- Not surveillance — CCTV is opt-in, table-zone only, stores nothing, governed by a signed data use agreement per restaurant
- Not a trending/rating platform — Explore Mode deliberately has no star ratings, no visible confirmation counts, no "recommended for you," by design, not by omission

---

## 14. THE PITCH ANCHOR

> *"Every day, people trade away control the moment they sit down to eat — squeezed next to strangers with no say in it, phones out because that's just what everyone does at the table, walking toward whatever's trending because that's what showed up on a feed. None of that was ever a choice. Seated asks a different question: what if the connections around a meal — who you sit near, whether your phone gets your attention or the person across from you does, and how you even found this place — were something you chose, not something the crowd, the habit, or the algorithm decided for you? We don't just get you a seat. We give you back the say in what happens once you're in it."*

---

## 15. OPEN QUESTIONS TO STILL RESOLVE

- [ ] Legal: DTI registration before competition, or MVP only?
- [ ] Menu data entry: owner-built interface vs. manual onboarding input?
- [ ] NFC tag cost: Seated absorbs as CAC, or restaurant-paid?
- [ ] Offline mode: manual fallback + diner-facing notice (unchanged from v2.0)
- [ ] CCTV privacy: signed data use agreement template per Pro partner
- [ ] PayMongo integration timeline: MVP-ready, or hold fees deferred to v1.1?
- [ ] Edge device cost (~₱3,500/unit): Seated cost or billed to Pro restaurants?
- [ ] **New — Presence Mode:** which OS-level mechanism actually silences notifications reliably across both iOS and Android without requiring a separate permission grant that adds onboarding friction — and confirm whether `expo-notifications` alone is sufficient or whether a custom native module (requiring a Custom Dev Client, not plain Expo Go) is needed for full silencing behavior.
- [ ] **New — build pipeline:** decide whether the competition demo runs on a Custom Dev Client / EAS build (required for NFC + full Presence Mode silencing) or a scaled-down Expo Go–only demo (QR fallback check-in, lighter notification handling) if there isn't time to set up custom builds before the deadline.
- [ ] **New — Explore Mode:** confirm Google Places API coverage quality for Tuguegarao specifically before committing it as the baseline layer; check OpenStreetMap as a free fallback if coverage is thin.
- [ ] **New — Crowd-Sensing POI:** finalize the confirmation threshold (3 accounts is a starting assumption, not tested) and the account-age minimum before a confirmation counts.
- [ ] **New — pitch scope:** for the competition demo, decide whether to fully build both Explore Mode and Reserve Mode, or build Presence Mode + Exposure Control + a convincing Explore Mode demo (even with seeded/sample data) and present Reserve Mode as existing, working infrastructure rather than a live demo focus.

---

*Document prepared for internal startup competition use. Version 3.0 — revised for theme fit.*
