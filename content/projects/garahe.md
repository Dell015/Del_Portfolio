# Garahe
### Your garage. Your story. Privately yours.

> A private vehicle companion app. Not a social network. Not a marketplace. Not a forum. A personal relationship between you and every vehicle you own, have worked on, and dream of owning.

---

## What Garahe is

Garahe is a private, web-based vehicle companion built around one idea: your knowledge about your vehicle should live in one place, belong entirely to you, and get smarter the longer you use it.

It is built for the person who forgets when the last oil change was. Who hears a noise and can't remember if they've dealt with it before. Who loses the receipt in the glovebox. Who dreams about the next vehicle but has no honest way to know if they can really afford to own and maintain it. Who takes their car to a new mechanic and has to start from scratch explaining five years of history.

That person is not a niche. That is every vehicle owner.

Garahe has three phases of features — a lean core that works from day one, a 3D interactive layer that makes the experience visual and intuitive, and an AI diagnostic layer that turns your own logged history into a conversational tool. The features are built in that order for a reason: each phase sits on the foundation of the one before it.

---

## The core problems Garahe solves

Every vehicle owner has the same four friction points, whether they drive a Toyota Innova, a Kawasaki Z650, or a Honda Civic:

**Forgetting what's due.** Maintenance intervals are tied to mileage, not calendars. Most people don't track odometer readings between services, so reminders either come too early, too late, or not at all.

**Not knowing what a noise means.** When something sounds wrong, you have no quick way to check your own history — did I already deal with this? What did I try last time? What was the outcome? You end up searching the internet instead of searching your own records.

**Losing the paper trail.** Receipts get crumpled in the glovebox and thrown away. Service records live in mechanics' internal systems you can't access. By the time you sell the vehicle, the five years of careful maintenance you did is invisible to the buyer.

**Dreaming without data.** Looking at a vehicle you want to own someday and having no honest way to understand what it would actually cost to maintain, what typically goes wrong, and when you could realistically afford it.

Garahe solves all four — and the way it solves them compounds over time. The longer you use it, the more valuable it becomes.

---

## Feature set

### Phase 1 features — the core (what gets built first)

---

#### The Garage — multi-vehicle management

Every vehicle you own lives in the Garage. Setup takes under a minute: make, model, year, variant, current mileage. That's it. No social profile. No interests to select. No feed to configure.

Each vehicle in the Garage has its own page — a running timeline of everything that has ever happened to it, organized by component. Not a flat list of dates and costs, but a structured record tied to the actual physical parts of the vehicle: the front brakes, the engine oil, the air filter, the rear shocks, the battery. Every entry attaches to a named component, which is the foundation that makes the 3D viewer and AI chatbot possible later.

Garahe supports any vehicle type — cars, motorcycles, trucks, vans. If it has an odometer and maintenance intervals, it belongs in the Garage.

---

#### The Timeline — every service, every entry, in one place

The Timeline is the single source of truth for a vehicle. Every log entry — a service, a repair, a part changed, a noise investigated — appears chronologically and is tied to the specific component it involves.

Each entry captures: the date, the current odometer reading, the component affected, what was done, the parts used (brand, part number if known), the cost, the shop or person who did the work, notes and observations, and optionally a photo of the receipt or the part itself.

The Timeline is searchable. When you hear a noise and want to know if you've dealt with this before, you search "brake" or "grinding" and instantly see every entry in your history that's relevant. You're not searching the internet. You're searching your own knowledge.

---

#### Component-based structure — the most important technical decision in the app

This is invisible to the user but it is the architectural foundation that everything else builds on.

Every vehicle has a predefined set of components: engine oil and filter, air filter, fuel filter, spark plugs (or glow plugs for diesel), coolant, brake fluid, transmission fluid, power steering fluid, front brake pads, rear brake pads, front brake rotors, rear brake rotors, front shocks, rear shocks, front tires, rear tires, battery, timing belt or chain, clutch (where applicable), drive belt, and a flexible "other" category for anything not on this list.

Every service log entry attaches to one or more of these components. This means the app always knows the last time each component was touched, at what mileage, and what was done. This is what makes odometer-based reminders accurate, what makes the status dashboard meaningful, what makes the 3D viewer's clickable hotspots possible, and what gives the AI chatbot the context it needs to be genuinely useful rather than generic.

---

#### Odometer-based reminders

Every time a user logs a refuel or any service entry, they can update their current odometer reading. Garahe tracks actual kilometers driven, not calendar days, and calculates when each component is next due based on the manufacturer's recommended interval for that specific vehicle.

Reminders are smart. If the user's Innova 2.8L Diesel is at 54,000 km and the fuel filter interval for that engine is every 20,000 km, and the last fuel filter entry was at 34,000 km — Garahe flags it. Not a generic "check your fuel filter" notification, but a specific "your Innova's fuel filter was last replaced 20,000 km ago — this is the interval Toyota recommends for the 1GD-FTV diesel engine."

---

#### The Status Dashboard — what needs attention, at a glance

The Status Dashboard is a single page per vehicle that gives an honest picture of its current health, organized into three categories:

**Recently maintained** — components that were serviced recently and are in good shape. No action needed.

**Coming up** — components that are approaching their service interval based on current mileage. Plan for these in the next few weeks.

**Look into this** — components that are either past their interval, flagged by the user as showing symptoms, or flagged by the AI as probable causes of a reported issue. These need attention.

Each item in the Status Dashboard links directly to that component's full history in the Timeline so the user can see exactly what's been done and decide what to do next.

The Status Dashboard also generates a Vehicle Health Score — a single number from 0 to 100 that reflects how up-to-date the vehicle's maintenance is across all tracked components, weighted by severity (overdue brake pads matter more than an overdue cabin air filter). This score travels with the vehicle when it's sold, giving the buyer an honest summary before they even open the full Timeline.

---

#### The Trust Layer — sharing history without surrendering it

When a vehicle owner takes their car to a new mechanic, or lists it for sale, Garahe's Trust Layer lets them share exactly what's needed — and nothing more.

**For a new mechanic:** The owner taps "Share with service center" and generates a six-digit one-time access code with a configurable expiry (24 hours, 7 days, or single-use). The mechanic types the code into any browser — no account, no app, no download required. They see the vehicle's full Timeline, component statuses, and the owner's flagged issues. After the service, the mechanic can submit a new entry for the owner to approve. The moment the owner approves or the code expires, access closes permanently.

**For a secondhand buyer:** The owner generates a Verified History Report — a snapshot of the vehicle's complete Timeline, health score, and component statuses at the time of listing. It's shareable as a link or exportable as a PDF. The buyer sees the full history without needing a Garahe account. When the sale completes, the owner taps "Transfer Ownership," enters the buyer's email, and the vehicle moves to the buyer's Garage. The previous owner's personal data (cost entries, private notes, photos of home-based work) is wiped. The vehicle's maintenance history remains intact.

The Trust Layer proves that you can solve a real trust problem between strangers without forcing them into a permanent shared network. The connection exists for exactly as long as the transaction requires. Then it closes.

---

#### The Workshop Log — your private knowledge base

The Workshop Log is a free-form journal attached to each vehicle. It is the place for everything that doesn't fit a clean structured entry: the modification you tried that didn't work, the adjustment you made to the suspension that took three iterations, the noise you heard and investigated and couldn't reproduce, the thing you learned from the manual that you want to remember.

It is not a social feed. It has no audience. It is private by default and stays private unless you explicitly share a specific entry.

Over time, the Workshop Log becomes something genuinely valuable — a complete, honest record of your growing understanding of a specific vehicle. When you sell the car, the Workshop Log transfers to the new owner. They don't just inherit a service record. They inherit the knowledge of the person who knew the vehicle best.

---

### Phase 2 features — the 3D interactive layer

Phase 2 begins after the core app is working and being used daily. The 3D layer does not replace the Timeline or the Status Dashboard — it is a visual interface into the same underlying data. The database doesn't change. The 3D viewer is a new way to look at what's already there.

---

#### The 3D vehicle viewer

Each vehicle in the Garage has a 3D model — a generic model that matches the vehicle category (sedan, MPV, motorcycle, truck) rather than an exact twin of the user's specific make and model. The model is loaded using Three.js, a JavaScript library for 3D rendering in the browser, and the user can rotate, zoom, and pan it freely.

The model is divided into named zones that correspond directly to the component names in the database: front wheel zone (front brakes, front tires, front shocks), rear wheel zone, engine bay (oil, filter, air filter, fuel filter, belts, coolant), cabin (battery, dashboard electronics), exhaust, and transmission/drivetrain.

Each zone is color-coded in real time based on the component's current status from the Status Dashboard. Green for recently maintained, amber for coming up, red for needs attention, grey for never logged. The user can see the health of their vehicle spatially — not just as a list, but as a physical object.

---

#### Clickable hotspots — logging from the model

The user can click any zone on the 3D model to interact with it directly. Clicking the front wheel zone opens a panel showing: the current status of front brake pads, front brake rotors, front shocks, and front tires. Each component shows its last service mileage, current mileage, interval, and days/km until next service.

From this panel, the user can log a new entry directly — "I changed the front brake pads today" — without navigating away from the 3D view. The hotspot immediately updates its color to reflect the new status.

This makes logging faster and more intuitive, especially for less experienced owners who might not know the technical name for a component but can point to where it is on the car.

---

#### AI-driven highlighting — the connection between the chatbot and the viewer

When the AI chatbot (Phase 3) identifies a likely component based on the user's described symptom, it sends a highlight instruction to the 3D viewer — the relevant zone animates, pulses, and the camera rotates to face it. The user sees their car on screen and the suspected area lights up as the AI explains what might be happening.

This is the feature that makes the experience feel genuinely different from any other automotive app. It is not a gimmick — it turns abstract mechanical language into spatial understanding. "Your front brake pads" means more when the front wheel zone of your car is glowing on screen as it's being explained.

---

### Phase 3 features — the AI diagnostic layer

Phase 3 adds the conversational AI layer on top of everything built in Phases 1 and 2. The AI's power comes entirely from having access to the user's own logged history — it is not a generic automotive encyclopedia, it is a tool that knows this specific vehicle, this specific owner's maintenance patterns, and this specific timeline of events.

---

#### The AI chatbot — describe what's wrong, get answers from your own data

The user opens the chat and describes a symptom in plain language: "I hear a grinding noise when I brake at high speed." The AI receives the message along with the full component history of the relevant vehicle — every brake-related entry, the current mileage, the last time the pads were changed, what brand was used, the mileage at which they were installed.

The AI responds with a structured answer: what the likely cause is, which component is probably involved, what the history shows (e.g., "your front brake pads were changed 22,000 km ago using Brembo pads — the typical wear interval for this pad and driving style is 20,000–25,000 km, so replacement is due"), and a recommended action.

The AI does not silently change the user's data. It proposes. The response includes a one-tap action: "Flag front brake pads as needs attention" or "Log this symptom in the Timeline." The user confirms. Only then does the data change.

The AI also drives the 3D viewer in real time — as it identifies the probable component, it sends the highlight instruction and the viewer responds. The user sees the word and the location simultaneously.

---

#### Symptom search — your history, instantly searchable

The AI layer also powers a smarter search across the full Timeline. Instead of searching for exact words in log entries, the user can ask questions: "Have I ever dealt with a vibration at highway speed?" or "What oil brand have I been using?" The AI searches the structured data and free-text Workshop Log entries and returns a plain-language summary with links to the relevant Timeline entries.

---

#### Proactive flags — patterns the user hasn't noticed

Over time, the AI watches for patterns in the logged data that the user might miss: a component being serviced more frequently than the interval suggests (which may indicate an underlying issue), a cost that's higher than typical for a service type, or a cluster of Workshop Log notes that all describe variations of the same symptom. It surfaces these proactively as gentle notifications, not alarms — "You've logged three separate notes about a vibration over the last 6 months. Want to investigate this as a recurring issue?"

---

### Future features — planned but not in the current build

**The Dream Lot** — a two-mode wishlist feature. Fantasy mode for enjoying the dream: specs, what it's actually like to live with, owner impressions. Planning mode for when you're serious: honest cost comparison, common failures at various mileages, realistic timeline to purchase based on your current vehicle's projected resale value. This is a future feature because it requires a separate data layer (vehicle spec and owner-reported issue data for non-owned vehicles) that is independent of the core maintenance system.

**Community layer (undecided)** — the question of whether Garahe should ever have a way for owners of the same vehicle to share notes or ask each other questions is still open. The answer depends on what feels natural after using the solo version for a while. If it gets added, it will be narrow and intentional — not a feed, not a forum, but something more like a private channel between owners of the exact same make, model, and year who opt in.

---

## Tech stack

The stack is chosen to be learnable as a solo developer, genuinely employable as a skill set, and architecturally capable of supporting all three phases without a rewrite. Every technology chosen here is used in real production systems — not toys or shortcuts.

---

### Frontend

**Next.js 14+ (App Router) with TypeScript**

Next.js is a React framework that handles routing, server-side rendering, static page generation, and API routes in one tool. The App Router (introduced in Next.js 13) is the current standard and is what most new Next.js projects use. TypeScript adds static typing, which catches errors before they happen and makes the codebase far easier to maintain as it grows.

Why Next.js specifically: it is the most documented, most tutorial-rich, and most AI-assisted framework in the frontend world right now. When you get stuck, help is everywhere. It also handles SEO well, which matters if Garahe ever has public-facing pages (like a vehicle's Verified History Report).

**Tailwind CSS**

Utility-first CSS framework that pairs naturally with Next.js and React. Instead of writing separate CSS files, you apply styling classes directly in the component markup. It enforces consistency, speeds up development, and is the dominant styling approach in the modern React ecosystem.

**Three.js (via React Three Fiber)**

Three.js is the industry-standard JavaScript library for 3D graphics in the browser. React Three Fiber is a React wrapper around Three.js that lets you write Three.js scenes as React components — which means the 3D viewer lives in the same codebase and component structure as the rest of the app, rather than being a foreign piece of code bolted on the side.

Three.js is only introduced in Phase 2. In Phase 1, the codebase has no 3D dependencies at all. The database schema is designed to support it, but the rendering code doesn't exist yet.

**Zustand (state management)**

A lightweight state management library for React. Simpler than Redux, more capable than plain useState for managing shared state across components (like the current vehicle selected, the 3D viewer's highlight state, the AI chatbot's conversation). Introduced when the app grows complex enough to need it — probably mid-Phase 1.

---

### Backend

**Python 3.11+ with FastAPI**

FastAPI is a modern Python web framework for building REST APIs. It is fast, easy to learn, automatically generates interactive API documentation (which is genuinely useful while building), and is type-annotated — meaning your Python code has the same kind of type safety as TypeScript.

The FastAPI backend is the layer between the Next.js frontend and the Supabase database. Every action the user takes in the app (logging a service entry, generating an access code, requesting an AI response) goes through a FastAPI endpoint. This is where the business logic lives — the rules that decide what's allowed, what to compute, and what to return.

Python is also the natural home for the AI integration in Phase 3. The Anthropic API has a first-class Python SDK, and the logic for building the prompt (pulling the vehicle's component history from the database, formatting it for the AI, parsing the structured response back out) is cleaner to write in Python than in TypeScript.

**SQLAlchemy (ORM) with Alembic (migrations)**

SQLAlchemy is the most widely used Python ORM (Object-Relational Mapper) — it lets you interact with the Postgres database using Python objects rather than writing raw SQL for every query. Alembic is the companion migration tool that manages database schema changes over time. When you add a new column or a new table, Alembic tracks the change and applies it safely to the running database.

These two tools together mean you rarely need to write raw SQL, your database schema is version-controlled alongside your code, and changes to the schema are applied in a controlled, reversible way.

**Pydantic v2**

FastAPI uses Pydantic for data validation — every piece of data that comes into the API and every piece that goes out is validated against a schema before the code does anything with it. This catches bad data at the boundary of the system rather than deep inside the logic where it's harder to debug.

---

### Database, auth, and storage

**Supabase (Postgres + Auth + Storage)**

Supabase provides three things: a managed PostgreSQL database, a built-in authentication system (email/password, magic links, OAuth), and file storage for binary files like receipt photos and 3D model assets.

Supabase is not the backend — FastAPI is the backend. Supabase is the infrastructure the backend connects to. The database is a real, production-grade Postgres instance. The auth system handles password hashing, session tokens, and refresh logic so you don't have to. The file storage handles receipts and Workshop Log photos with a simple SDK call.

Using Supabase for auth specifically is important for a solo developer: authentication security is one of the most dangerous things to implement incorrectly, and one of the hardest to test thoroughly. Supabase's auth is battle-tested, free at early scale, and integrates cleanly with FastAPI via JWT token verification.

Row-Level Security (Supabase's built-in Postgres permission system) enforces that a user can only ever see their own vehicles and entries — even if a bug in the FastAPI code accidentally queries the wrong user's data, Postgres itself refuses to return it. This is a meaningful safety layer that's worth understanding how to configure correctly from the start.

---

### AI integration

**Anthropic API (Claude)**

The AI chatbot in Phase 3 is powered by Claude via the Anthropic API. The integration lives entirely in the FastAPI backend — a new endpoint that accepts a user's message and vehicle ID, pulls the relevant component history from the database, constructs a prompt with that context, calls the Anthropic API, parses the structured response (which component is flagged, what the recommendation is, what highlight instruction to send to the 3D viewer), and returns a clean JSON response to the frontend.

The AI is explicitly given the user's own data as context in every prompt — it is not making generic guesses about Toyota Innovas in general, it is reasoning about this specific vehicle with this specific maintenance history. That distinction is the difference between a useful diagnostic tool and a generic automotive chatbot.

Prompt design is part of the engineering work here — how you structure the context you give the AI significantly affects the quality of the response. This is a learnable skill and an interesting one to have on a resume.

---

### Deployment and tooling

**Vercel (frontend)**

Vercel is built by the same team as Next.js. Deploying a Next.js app to Vercel is effectively one command or a GitHub integration that deploys automatically on every push. The free tier is generous and more than sufficient for development and early users. Preview deployments (a live URL for every pull request or branch) are included automatically.

**Railway (backend)**

Railway is the simplest way to deploy a FastAPI Python backend. You connect your GitHub repo, it detects the Python project, and it deploys. Environment variables are managed in a dashboard. It handles scaling, restarts on crash, and logging. Free tier is limited but workable for development; paid tier is affordable when real users arrive.

**GitHub**

All code lives in a private GitHub repository from day one. Version control is not optional — it is how you track changes, roll back mistakes, and eventually collaborate if Garahe grows. Each phase of the build maps to a GitHub milestone with issues for individual features.

**GitHub Actions (CI)**

A simple automated test runner that runs every time you push code. Even basic tests — does the API start? Do the database queries return the right shape? — catch regressions early. Introduced mid-Phase 1 once there's enough code to test.

---

### Stack summary table

| Layer | Technology | Phase introduced |
|---|---|---|
| Frontend framework | Next.js 14+ (App Router) + TypeScript | Phase 1 |
| Styling | Tailwind CSS | Phase 1 |
| State management | Zustand | Phase 1 (mid) |
| 3D rendering | Three.js via React Three Fiber | Phase 2 |
| Backend framework | Python + FastAPI | Phase 1 |
| Data validation | Pydantic v2 | Phase 1 |
| ORM | SQLAlchemy | Phase 1 |
| DB migrations | Alembic | Phase 1 |
| Database | Supabase (Postgres) | Phase 1 |
| Authentication | Supabase Auth | Phase 1 |
| File storage | Supabase Storage | Phase 1 |
| AI layer | Anthropic API | Phase 3 |
| Frontend hosting | Vercel | Phase 1 |
| Backend hosting | Railway | Phase 1 |
| Version control | GitHub | Phase 0 |
| CI | GitHub Actions | Phase 1 (mid) |

---

## Database schema

The schema is the most important design decision in the entire project. It is designed from day one to support all three phases. Nothing in Phase 2 or Phase 3 requires a schema rewrite — those phases only read and write data that the Phase 1 schema already has a place for.

---

### `users`
Created and managed by Supabase Auth. Contains: `id` (UUID), `email`, `created_at`. Garahe's own tables reference `users.id` as a foreign key — Supabase Auth's Row-Level Security ensures users can only access rows where `owner_id` matches their authenticated user ID.

---

### `vehicles`
One row per vehicle per user.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| owner_id | UUID | Foreign key → users.id |
| make | text | e.g. Toyota |
| model | text | e.g. Innova |
| variant | text | e.g. 2.8 G AT |
| year | integer | e.g. 2021 |
| vehicle_type | enum | car, motorcycle, truck, van |
| current_odometer | integer | km, updated on each entry |
| vin | text | optional — vehicle ID number |
| color | text | optional |
| plate_number | text | optional |
| purchase_date | date | optional |
| purchase_price | integer | optional, in local currency |
| health_score | integer | computed, 0–100 |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `components`
One row per trackable component per vehicle. Populated automatically when a vehicle is created, based on the vehicle type (a motorcycle gets different default components than a diesel MPV).

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key → vehicles.id |
| name | text | e.g. front_brake_pads |
| display_name | text | e.g. Front Brake Pads |
| category | text | e.g. brakes, engine, suspension |
| 3d_zone | text | maps to a named hotspot in the 3D model |
| service_interval_km | integer | manufacturer recommended interval |
| service_interval_days | integer | manufacturer recommended interval |
| last_serviced_km | integer | updated on each relevant log entry |
| last_serviced_date | date | updated on each relevant log entry |
| status | enum | good, upcoming, attention |
| notes | text | freeform owner notes on this component |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `service_entries`
One row per log entry. The core data table of the entire application.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key → vehicles.id |
| component_id | UUID | Foreign key → components.id |
| entry_type | enum | service, repair, inspection, symptom, note |
| title | text | short description |
| description | text | full freeform notes |
| odometer_at_entry | integer | km at the time of this entry |
| entry_date | date | |
| performed_by | text | owner, shop name, mechanic name |
| parts_used | jsonb | array of {name, brand, part_number, cost} |
| total_cost | integer | in local currency |
| receipt_url | text | Supabase Storage URL |
| photo_urls | jsonb | array of Supabase Storage URLs |
| is_verified | boolean | true if submitted by a mechanic via Trust Layer |
| ai_flagged | boolean | true if surfaced by the AI chatbot |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `access_codes`
Manages the Trust Layer mechanic access system.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key → vehicles.id |
| owner_id | UUID | Foreign key → users.id |
| code | text | 6-digit alphanumeric, unique |
| access_type | enum | mechanic, buyer |
| expires_at | timestamp | set at creation |
| used_at | timestamp | set on first use |
| is_single_use | boolean | expires after one access if true |
| mechanic_name | text | optional, set by the mechanic on use |
| created_at | timestamp | |

---

### `ownership_transfers`
Tracks the history of vehicle ownership for the buyer-facing Trust Layer.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key → vehicles.id |
| from_owner_id | UUID | previous owner |
| to_email | text | new owner's email |
| to_owner_id | UUID | set when new owner accepts |
| transferred_at | timestamp | |
| health_score_at_transfer | integer | snapshot of health score at sale |

---

### `workshop_log_entries`
Freeform journal entries attached to a vehicle, separate from structured service entries.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key → vehicles.id |
| title | text | |
| content | text | freeform markdown-supported text |
| photo_urls | jsonb | array of Supabase Storage URLs |
| related_component_id | UUID | optional link to a component |
| odometer_at_entry | integer | optional |
| entry_date | date | |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### `ai_conversations`
Stores the history of AI chatbot conversations per vehicle.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key → vehicles.id |
| owner_id | UUID | Foreign key → users.id |
| messages | jsonb | array of {role, content, timestamp} |
| flagged_component_id | UUID | component flagged in this conversation |
| proposed_entry | jsonb | the entry the AI proposed, pending approval |
| resolved | boolean | true once user approved or dismissed |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## Build roadmap

The roadmap is organized into phases, not weeks, because timelines depend on how much time is available each day. Each phase has a clear definition of done — a specific, demonstrable thing that works — so you always know whether you're in a phase or past it.

---

### Phase 0 — Environment setup
**Definition of done:** Three separate deployments are live (frontend, backend, database), each doing almost nothing but proving they can talk to each other.

**What you do:**

Create a Supabase project. Note the database URL, the anon key, and the service role key. Create the `users` table by enabling Supabase Auth.

Scaffold the Next.js app: `npx create-next-app@latest garahe --typescript --tailwind --app`. Push to a new private GitHub repo. Connect the repo to Vercel. Deploy. You now have a live Next.js app at a Vercel URL that shows the default Next.js homepage.

Scaffold the FastAPI app: create a Python virtual environment, install fastapi, uvicorn, sqlalchemy, alembic, psycopg2-binary, and python-dotenv. Write one route: `GET /health` returns `{"status": "ok"}`. Push to the same repo in a `/backend` folder. Connect to Railway. Deploy. You now have a live FastAPI backend.

Write one page in Next.js that calls the `/health` endpoint and displays the response. Deploy. When you see `{"status": "ok"}` rendered in the browser from the deployed frontend calling the deployed backend, Phase 0 is done.

**What you learn:** The deployment pipeline, environment variables, CORS configuration between frontend and backend, and the shape of the three-layer architecture. You learn this with the simplest possible code so deployment is never a scary unknown again.

---

### Phase 1a — Database schema and vehicle CRUD
**Definition of done:** A logged-in user can add a vehicle and see it listed on a page.

**What you do:**

Run Alembic init and write the first migration: create the `vehicles` table and the `components` table. Run the migration against the Supabase Postgres database. Verify the tables exist in the Supabase dashboard.

Write the Pydantic models for Vehicle and Component. Write the SQLAlchemy models. Write the FastAPI endpoints: `POST /vehicles` (create), `GET /vehicles` (list for current user), `GET /vehicles/{id}` (single vehicle with its components).

In Next.js, wire up Supabase Auth — sign up, log in, log out. Write a simple Vehicles page that fetches from `GET /vehicles` and renders a list. Write an Add Vehicle form that posts to `POST /vehicles`.

The FastAPI backend must verify the Supabase auth token on every request — extract the user ID from the JWT, pass it through to every database query so Row-Level Security can enforce ownership.

**What you learn:** Full-stack data flow, JWT authentication, Row-Level Security, and the FastAPI + SQLAlchemy + Supabase integration pattern that every subsequent feature repeats.

---

### Phase 1b — Service entries and the Timeline
**Definition of done:** A logged-in user can log a service entry on one of their vehicles and see it displayed chronologically in a Timeline view.

**What you do:**

Write the Alembic migration for `service_entries`. Write the Pydantic and SQLAlchemy models. Write the FastAPI endpoints: `POST /vehicles/{id}/entries`, `GET /vehicles/{id}/entries` (with optional component filter and text search), `PATCH /entries/{id}`, `DELETE /entries/{id}`.

In Next.js, build the Timeline page — a chronological list of entries for a vehicle, grouped by month. Build the Log Entry form — select a component from a dropdown, enter the details, submit. Make the Timeline searchable by keyword.

**What you learn:** Relational data (entries belong to vehicles belong to users), list filtering and search, form design, and the component-based data structure that everything else builds on.

---

### Phase 1c — Status Dashboard and health score
**Definition of done:** Each vehicle has a Status Dashboard page showing component statuses in three categories, and a health score computed from the database.

**What you do:**

Write a FastAPI endpoint `GET /vehicles/{id}/status` that queries all components for the vehicle, computes each component's status (good / upcoming / attention) based on the last service mileage plus interval vs. the current odometer, assigns a severity weight to each component type, and computes an overall health score. This is pure logic — no new database tables required.

In Next.js, build the Status Dashboard page — three sections (Recently Maintained, Coming Up, Look Into This), each showing the relevant components with their last service date, current mileage gap, and a link to that component's Timeline entries.

**What you learn:** Backend business logic, computed values from relational data, and the difference between data-layer work (database) and logic-layer work (API).

---

### Phase 1d — File uploads and the Workshop Log
**Definition of done:** A user can attach a photo to a service entry, and can write Workshop Log entries with photos.

**What you do:**

Enable Supabase Storage and create two buckets: `receipts` and `workshop-photos`. Write FastAPI endpoints that accept multipart file uploads, upload to Supabase Storage, and store the returned URL in the service entry or workshop log entry.

Write the Alembic migration for `workshop_log_entries`. Write the full CRUD for Workshop Log entries with photo support.

In Next.js, add file upload inputs to the service entry form and build the Workshop Log page — a chronological journal view with text and photos.

**What you learn:** File handling in web apps, Supabase Storage SDK, multipart form submissions.

---

### Phase 1e — Odometer-based reminders
**Definition of done:** The app sends a notification when a component is approaching or past its service interval, based on actual odometer readings.

**What you do:**

Set up a scheduled background job in FastAPI using APScheduler — runs once daily, queries all components across all users, compares current odometer to last service mileage plus interval, and creates a notification record for any component that is within 500 km of its interval or past it.

Write a `notifications` table (lightweight — just user_id, vehicle_id, component_id, message, seen boolean, created_at). Build a notification indicator in the Next.js UI — a badge count in the header and a notifications dropdown.

**What you learn:** Background jobs, scheduled tasks, notification systems.

---

### Phase 1f — The Trust Layer
**Definition of done:** A vehicle owner can generate a one-time access code that a mechanic can use to view the vehicle's history in a browser, and the mechanic can submit a service entry that the owner approves.

**What you do:**

Write the Alembic migration for `access_codes`. Write FastAPI endpoints: `POST /vehicles/{id}/access-codes` (generate a code), `GET /access/{code}` (public endpoint — validates code, returns vehicle history if valid, records access timestamp), `POST /access/{code}/entries` (mechanic submits an entry), `POST /entries/{id}/approve` (owner approves a pending entry).

Write the code generation logic — 6-character alphanumeric, checked for uniqueness, stored with expiry and single-use flag. Write the code validation logic — check expiry, check if already used (for single-use codes), mark as used on first access.

In Next.js, build the Share page (owner-facing — generate code, see active codes, revoke codes). Build the public access page (mechanic-facing — no login required, shows vehicle history read-only, has a form to submit an entry pending owner approval).

**What you learn:** Public vs authenticated endpoints, token-based access control, approval workflows.

---

### Phase 1g — Ownership transfer
**Definition of done:** A vehicle owner can transfer a vehicle to another user by email, wiping their personal data and preserving the maintenance history.

**What you do:**

Write the Alembic migration for `ownership_transfers`. Write the FastAPI endpoint: `POST /vehicles/{id}/transfer` — validates the target email exists as a Garahe user, creates an ownership transfer record, reassigns the vehicle's `owner_id`, deletes the previous owner's private Workshop Log entries marked as private, sets `purchase_price` to null. Write `GET /vehicles/{id}/history-report` — a public endpoint (no auth required) that returns a sanitized view of the vehicle history suitable for a buyer.

In Next.js, build the Transfer Ownership flow (confirmation screen with clear explanation of what gets wiped and what transfers). Build the public Verified History Report page — accessible via shareable link, no login required.

**What you learn:** Database transactions (multiple changes that must all succeed or all fail), data sanitization, public-facing pages generated from private data.

---

### Phase 1 is complete when:
A user can register, add multiple vehicles, log service entries with component tracking, view a Status Dashboard with health score, receive odometer-based reminders, share their history with a mechanic via a one-time code, approve a mechanic's submitted entry, and transfer a vehicle to a new owner. The app is deployed and usable. The dream lot, 3D viewer, and AI chatbot do not exist yet — and the app is already useful without them.

---

### Phase 2 — The 3D interactive layer

**Phase 2 prerequisite:** You have been using Phase 1 yourself for at least a few weeks and have real data in the app.

**Definition of done:** Each vehicle page has a 3D model the user can rotate and click, with zones color-coded to match the component statuses from the Status Dashboard, and clicking a zone opens a component panel with current status and a log entry form.

**What you do:**

Source or purchase a base 3D model for each vehicle category (sedan/MPV, motorcycle, truck) in GLTF/GLB format. The GLB format is Three.js's preferred format. Suitable models exist on Sketchfab (search for free or CC-licensed car models) or can be purchased on CGTrader for a small one-time cost. The model does not need to be an exact replica of the user's specific vehicle — it needs to have the right zones in the right places.

If the model's mesh is not already organized into named groups, use Blender (free, open source) to separate it into zones: front_wheel_zone, rear_wheel_zone, engine_bay, cabin, exhaust, drivetrain. Each zone becomes a named mesh in the exported GLB file.

Install React Three Fiber and Drei (a helper library for common Three.js patterns): `npm install three @react-three/fiber @react-three/drei`. Write a VehicleViewer React component that loads the GLB model, sets up lighting and camera controls (OrbitControls from Drei handles rotation and zoom), and applies color-coded materials to each named zone based on the vehicle's component statuses fetched from the API.

Write the click handler — when a zone is clicked, a side panel opens showing the components in that zone with their current status, last service details, and a button to log a new entry. The panel is the same data that's in the Status Dashboard, just accessed spatially.

Add the `3d_zone` field to the `components` table (already in the schema) by running a new Alembic migration that populates this field for all existing components based on their name.

**What you learn:** Three.js and 3D rendering in the browser, GLB file format, Blender basics (enough to rename mesh groups), React Three Fiber's component model, and how to connect a visual layer to an existing data layer without changing the data model.

---

### Phase 3 — The AI diagnostic layer

**Phase 3 prerequisite:** The 3D viewer is working and you have a solid understanding of how the component data is structured.

**Definition of done:** A user can describe a symptom in the chat, the AI responds with a specific diagnosis referencing their actual maintenance history, the relevant 3D zone highlights, and the user can approve a new Timeline entry proposed by the AI.

**What you do:**

Install the Anthropic Python SDK in the FastAPI backend: `pip install anthropic`. Write a new FastAPI endpoint: `POST /vehicles/{id}/chat`. This endpoint:

1. Receives the user's message and the full conversation history for this session
2. Queries the database for all components of the vehicle, their current status, and the last 10 service entries for each component
3. Constructs a system prompt that explains the AI's role and provides the vehicle's full component context as structured data
4. Calls the Anthropic API with the system prompt plus the conversation history plus the new user message
5. Parses the AI's response — which is instructed to return a JSON structure containing: the plain-language response text, the component_id being flagged (if any), the 3d_zone to highlight (if any), and a proposed service entry (if any)
6. Stores the conversation in the `ai_conversations` table
7. Returns the structured response to the frontend

In Next.js, build the Chat panel — a sidebar on the vehicle page with a text input and conversation history. When the AI response includes a `3d_zone` to highlight, the VehicleViewer component receives it as a prop and applies the highlight animation. When the AI response includes a proposed entry, a "Log this" confirmation card appears below the AI's message — one tap approves it and creates the entry.

Prompt engineering work: iterate on the system prompt until the AI reliably maps symptom descriptions to the right component and produces genuinely useful, specific responses rather than generic automotive advice. This is its own skill — the quality of the AI experience depends almost entirely on the quality of the prompt.

Write the symptom search endpoint: `POST /vehicles/{id}/search` — same pattern as chat, but optimized for searching existing entries rather than diagnosing new symptoms.

Write the proactive flag job — runs weekly alongside the existing reminder job, looks for patterns in `service_entries` and `workshop_log_entries` that suggest recurring issues, creates notifications for the owner.

**What you learn:** API integration with large language models, prompt engineering, structured output parsing from AI responses, real-time UI updates driven by backend responses, and how to build a product experience where AI assists rather than replaces the user's judgment.

---

### Future phase — The Dream Lot

The Dream Lot is explicitly not in the current build. It requires a separate data layer — a database of vehicle specs, typical ownership costs, and owner-reported issues for vehicles the user does not own. This data could be sourced from public datasets, scraped with permission from reputable sources, or contributed by users over time. The architecture for it is independent of the Phase 1–3 build, so it can be added at any point without touching the existing code.

When it is built, it will live as a separate section of the app — a wishlist where each entry has a dual-mode view: one for enjoying the fantasy (specs, photos, what it's like to live with), and one for planning the reality (honest cost comparison, common failures, realistic upgrade timeline based on the current vehicle's projected resale value from its health score).

---

## What this project proves on a resume

By the time Phase 1 is complete, you can demonstrate: full-stack web development with a typed frontend and a typed backend, relational database design with proper normalization and foreign key relationships, JWT-based authentication and Row-Level Security, file upload and storage, token-based temporary access control, and data ownership transfer. These are not toy features — they are real engineering patterns used in production systems.

By Phase 2, you add: 3D rendering in the browser, integration of a binary asset pipeline (GLB models), and connecting a visual layer to a live data system.

By Phase 3, you add: LLM API integration, prompt engineering, structured output parsing, and building a user experience around AI assistance that keeps the user in control. This is one of the most in-demand skill combinations in the current job market.

The project is also genuinely interesting to talk about in an interview — because it started from personal frustration, because every feature decision has a clear "why," and because the architecture scales: the same stack that runs on Vercel and Railway as a personal project could run on AWS or GCP serving millions of users with relatively minor infrastructure changes.

---

*Personal project — development started June 2026*
