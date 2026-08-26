# Keypath — Project Architecture

Working product name: **Keypath**.  
Repository: `touch-type-learn`.  
Package scope: `@keypath/*`.

This document is the source of truth for product intent, architecture, and major technical decisions. Update it whenever an architectural decision changes.

Related: [`BUILD_PLAN.md`](./BUILD_PLAN.md) for phased implementation status.

---

## Product Overview

Keypath is a structured touch-typing learning platform. It is not a typing-test website.

It takes a learner from:

> “I type with two fingers and look at the keyboard.”

to:

> “I touch-type accurately, evenly, and at high speed without looking down.”

The learning order is fixed:

**Correct technique → accuracy → rhythm → fluency → speed**

Beginners are not pushed to chase WPM. Speed becomes a first-class goal only after home-row, alphabet, words, sentences, and basic punctuation are in muscle memory.

The product loop:

```text
LEARN → PRACTICE → PLAY → ANALYZE → ADAPT → REPEAT
```

Four primary areas (plus Profile):

```text
LEARN    structured worlds and levels
PRACTICE adaptive and targeted drills
PLAY     games that reuse the typing engine
STATS    deep analytics, heatmap, trends
PROFILE  identity, XP, streaks, achievements
```

---

## Core Product Principles

1. **Accuracy before speed.** Early unlocks require accuracy, not WPM.
2. **Gradual key introduction.** A learner only types keys they have already been taught (`allowedKeys`).
3. **Muscle memory over memorization.** Visual keyboard guidance fades as skill grows.
4. **Adaptive practice.** Weak keys get more exposure; strong keys get less.
5. **Short sessions.** A lesson should be completable in a few minutes.
6. **Visible progression.** The course map always answers: where am I, what is next, what is locked.
7. **Encourage, do not punish.** Mistakes are visible and correctable. No screen-shake, no exercise reset, no streak anxiety.
8. **Technique is taught, not assumed.** Finger, hand, and home-row orientation are part of the curriculum, not a tooltip.

---

## User Personas

### Complete beginner

Has never touch-typed. Hunts and pecks. Needs orientation, home-row bumps, finger-to-key mapping, and a lot of visual guidance. Success looks like: can type home-row words without looking, slowly, with high accuracy.

### Casual typist

Types daily but with poor technique. Wants to “finally learn properly.” Needs a placement-aware path (post-MVP) or a beginner path they can move through quickly. Success looks like: full alphabet, real words, no looking down.

### Intermediate typist

Can touch-type but is inaccurate, uneven, or slow on punctuation/numbers. Needs adaptive weak-key work, sentences, rhythm, and symbols. Success looks like: 50–70 WPM at ≥96% accuracy with even rhythm.

### Advanced / speed-focused typist

Already touch-types. Wants 90–100+ WPM, endurance, code, and mixed symbol text. Needs speed worlds, analytics, and hard practice modes. Success looks like: consistent high WPM without accuracy collapse.

The MVP is built for the first two personas. Later phases serve the last two.

---

## Product Areas

### Learn

The spine of the product. Worlds → lessons → exercises. Predictable lesson shape:

1. **Introduce** — new key, finger, hand, keyboard, short copy.
2. **Guided practice** — repeated patterns using only `allowedKeys`.
3. **Word practice** — real or synthetic words from allowed keys.
4. **Challenge** — reduced visual assistance.
5. **Results** — WPM, accuracy, consistency, mistakes, combo, XP, stars.

The learner can move rapidly between lessons. Three stars are never required to unlock the next lesson. One star (see Scoring) is.

### Practice

Adaptive and targeted modes. MVP includes weak-key practice. Later: accuracy, speed, punctuation, numbers, common words, custom text, endurance.

### Play

Games reuse `packages/typing-engine`. They must not reimplement WPM, accuracy, or key tracking. First game (post-MVP core): Word Rain. Other modes (race, meteor, combo) are later.

### Stats

Dedicated analytics. Not on the dashboard. Trends, heatmap, per-key mastery, finger performance, mistake distribution.

### Profile

Identity, level/XP, headline stats, course completion, achievements, longest streak. Guest users see a local profile prompt to save progress.

### Dashboard

Continuation, not analytics overload:

- Continue learning (world, lesson, CTA)
- Course progress
- Streak (encouraging, not threatening)
- XP / user level
- Current WPM + accuracy
- Today’s practice
- Weak keys
- Daily challenge (when that phase lands)

---

## Curriculum

Curriculum is **data**, not UI. Source of truth: `packages/curriculum`. Lesson IDs are stable strings. A seed script upserts lesson/world metadata into Postgres so attempts can reference them.

### Critical rule

An exercise generator must never emit a character outside the lesson’s `allowedKeys` (plus space, and later explicitly introduced punctuation). Foundational paths are hand-authored. Do not generate World 1–3 with a model.

### Worlds

| World | Name                 | Teaches                                                | MVP          |
| ----- | -------------------- | ------------------------------------------------------ | ------------ |
| 1     | Finger Foundations   | Orientation, home row, F/J bumps, home-row words, boss | Full         |
| 2     | Top Row              | E/I, R/U, T/Y, W/O, Q/P, boss                          | Full         |
| 3     | Bottom Row           | C/, V/M, B/N, X/., Z/, alphabet boss                   | Full         |
| 4     | Real Words           | Common words, same-hand, doubles, hard pairs           | Partial      |
| 5     | Sentences and Rhythm | Capitals, opposite-hand Shift, punctuation             | Partial      |
| 6     | Numbers and Symbols  | Number row, ₹, %, @, dates, email                      | Stub → later |
| 7     | Speed Training       | 20 → 100+ WPM, accuracy still required                 | Stub → later |
| 8     | Mastery              | Long form, prose, code, endurance                      | Stub → later |

### Lesson shape

```ts
interface Lesson {
  id: string; // e.g. "w1-home-f-j"
  worldId: string; // e.g. "world-1"
  title: string;
  description?: string;
  newKeys: string[];
  allowedKeys: string[];
  targetAccuracy: number;
  targetWpm?: number; // omitted until speed-focused lessons
  assistance: AssistanceLevel;
  isBoss?: boolean;
  exercises: Exercise[];
}

type ExerciseType =
  | "introduction"
  | "key-drill"
  | "pattern"
  | "word"
  | "sentence"
  | "timed"
  | "challenge"
  | "boss";
```

### Keyboard assistance levels

Derived from the lesson (overridable in settings):

| Level      | When                    | Keyboard            | Guidance                      |
| ---------- | ----------------------- | ------------------- | ----------------------------- |
| `full`     | World 1, early World 2  | Visible             | Target key + finger highlight |
| `minimal`  | Late World 2–3          | Visible             | Target key only               |
| `on-error` | Worlds 4–5              | Hidden until a miss | Brief highlight on error      |
| `hidden`   | Worlds 7–8, speed modes | Hidden              | None                          |

### Layout scope

MVP teaches **US QWERTY** only. Other layouts (Colemak, Dvorak, AZERTY) are post-MVP. World 6 still includes practical characters such as `₹` as typed characters, not as a second physical layout.

---

## Technical Architecture

### Monorepo

```text
touch-type-learn/
├── apps/
│   └── web/                     Next.js App Router
├── packages/
│   ├── typing-engine/           Pure TS keystroke engine (no React)
│   ├── curriculum/              Worlds, lessons, generators, allowed-key checks
│   ├── scoring/                 Stars, XP, mastery, weak keys, level curve
│   ├── shared-types/            DTOs shared by app, engine, scoring, DB
│   ├── ui/                      Keyboard + a few primitives (thin)
│   ├── typescript-config/       Shared tsconfig
│   └── eslint-config/           Shared ESLint
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── .github/workflows/
├── PROJECT.md
├── BUILD_PLAN.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### Frontend

| Choice       | Decision                                                               |
| ------------ | ---------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router)                                                |
| UI           | React, TypeScript strict                                               |
| Styling      | Tailwind CSS                                                           |
| Components   | shadcn/ui where it saves time (dialogs, buttons, charts wrappers)      |
| Motion       | `motion` (Framer Motion) for completion, XP, stars — not per keystroke |
| Client state | Zustand for session/UI; engine instance in a ref                       |
| Charts       | Recharts on Stats only                                                 |

Desktop is the primary typing environment. Dashboards, stats, and profile must work on mobile. Lesson routes may show a “physical keyboard needed” state on touch-only devices. Do not design core lessons around the on-screen keyboard.

### Backend

Supabase is the backend:

- PostgreSQL
- Auth
- RLS (mandatory for user data)
- Storage only if a real file need appears (avatars later)
- `@supabase/ssr` + Next.js Server Actions / Route Handlers

No separate API server unless a concrete need appears (it has not).

Live typing never touches the network. After a lesson ends, one aggregated attempt payload is written.

### Deployment

```text
Next.js  →  Vercel
                ↓
            Supabase (Auth, Postgres, Storage)
```

Avoid Vercel-only features where a standard Next.js approach works (use `next/headers` cookies, not Edge-only APIs, unless there is a reason).

### Data flow (live typing)

```text
Keyboard Event
    → Typing Engine (performance.now())
    → Engine snapshot (ref, not Zustand)
    → Immediate UI feedback (isolated view)
    → Metrics (derived from engine)
    → Lesson complete
    → Scoring package (stars, XP, mastery deltas)
    → Persist summary (localStorage guest, or Supabase user)
```

Never write one row per keystroke.

---

## Typing Engine

Package: `packages/typing-engine`.

**Does:**

- Accept expected text and a stream of input events
- Track cursor, per-character status, backspace, combo
- Record timestamps via `performance.now()`
- Compute raw WPM, net WPM, accuracy, consistency
- Track per-key attempts, latency, errors, substitutions
- Expose finger mapping for a known layout
- Support two input modes: `forced-correction` and `free-flow`
- Segment input as grapheme clusters (needed for `₹` and similar)

**Does not:**

- Import React
- Know about XP, stars, worlds, or auth
- Talk to the network
- Render a keyboard

**Input modes (product decision):**

| Mode                | Behavior                                                               | Used in                                   |
| ------------------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| `forced-correction` | Wrong key is marked; cursor does not advance until backspace + correct | Learn (Worlds 1–5), accuracy practice     |
| `free-flow`         | Wrong key is marked; cursor advances                                   | Speed tests, some games, timed challenges |

The engine is unit-tested extensively with Vitest. The UI may not duplicate any of these calculations.

---

## Database Architecture

User data lives in Postgres. Curriculum **content** lives in `packages/curriculum`. Postgres stores world/lesson **metadata** (stable IDs) so attempts have referential integrity.

### ER overview

```text
auth.users
    └── profiles
            ├── user_progress      (user × lesson)
            ├── lesson_attempts
            ├── user_key_stats     (user × key)
            ├── daily_stats        (user × date)
            ├── streaks            (1:1 user)
            ├── user_settings      (1:1 user)
            ├── user_achievements  (later)
            └── user_daily_challenges (later)

worlds 1──* lessons     (seeded metadata)
```

### Tables (MVP)

**profiles**

| Column                     | Notes                                    |
| -------------------------- | ---------------------------------------- |
| `id`                       | PK, `auth.users.id`                      |
| `username`                 | unique, nullable until chosen            |
| `display_name`             |                                          |
| `xp`                       | integer ≥ 0                              |
| `level`                    | derived but stored for query convenience |
| `lifetime_wpm`             | rolling display metric                   |
| `lifetime_accuracy`        |                                          |
| `created_at`, `updated_at` |                                          |

**worlds** / **lessons**

Seeded from the curriculum package. Lessons store `id`, `world_id`, `title`, `sort_order`, `is_boss`, targets. Exercise bodies are **not** duplicated in SQL in MVP.

**lesson_attempts**

One row per finished attempt. Columns match `LessonAttempt` plus `user_id`, `key_stats jsonb` (aggregated, not raw keylog), `created_at`.

**user_progress**

Best stars, best WPM, best accuracy, attempt count, first completed at, last attempted at. Unique `(user_id, lesson_id)`.

**user_key_stats**

Per-key counters and EMA latency, mastery score, last practiced. Unique `(user_id, key)`.

**daily_stats**

Practice minutes, characters, lessons completed, XP earned. Unique `(user_id, date)`.

**streaks**

`current_streak`, `longest_streak`, `last_practice_date`, `practice_days_month`.

**user_settings**

Sound, assistance override, reduced motion, keyboard labels.

### Later tables

`achievements`, `user_achievements`, `daily_challenges`, `user_daily_challenges`.

### Indexes

- `lesson_attempts (user_id, created_at desc)`
- `lesson_attempts (user_id, lesson_id, created_at desc)`
- `user_progress (user_id)`
- `user_key_stats (user_id, mastery_score)`
- `daily_stats (user_id, date desc)`

### What is never stored

- Individual keystroke streams
- Raw lesson text the user typed (unless we later add an opt-in replay feature)
- Passwords (Supabase Auth)

---

## Authentication

### Guest

No account required to start World 1.

Guest progress is stored in **versioned localStorage** (`keypath.guest.v1`). It includes completed lesson IDs, best stars, XP, key-stat summaries, and streak dates.

Guests are not given anonymous Supabase users. That would pollute `auth.users` and complicate merge.

### Signed-in

Supabase Auth:

- Email + password
- Google OAuth if project credentials are configured
- Magic link is **not** in MVP (adds a second unverified path)

Server-side session via `@supabase/ssr` cookies. Route protection for write operations is RLS + server checks, not UI hiding.

### Guest → account merge

On first successful signup/sign-in from a guest device:

1. Read `keypath.guest.v1`.
2. If the account has **no** lesson progress: import guest snapshot (attempts reconstructed as summaries, progress, key stats, XP, streak).
3. If the account **already has** progress: merge
   - progress: max stars, max best WPM/accuracy per lesson
   - key stats: additive attempts/errors; recompute mastery
   - XP: `max(account.xp, guest.xp)` then add XP only for lessons the account had not completed
   - streak: keep the more consistent of the two by `last_practice_date` (do not invent days)
4. Clear guest storage after confirmed write.
5. Never delete server data to make room for guest data.

---

## RLS Strategy

RLS is enabled on every user-owned table. No client uses a service role key.

| Data                                                                                            | SELECT                                                     | INSERT                    | UPDATE                 | DELETE                         |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------- | ---------------------- | ------------------------------ |
| `worlds`, `lessons`                                                                             | public (anon + authenticated)                              | none (seed / service)     | none                   | none                           |
| `profiles`                                                                                      | own row; limited public fields later if profiles go public | own row on signup trigger | own row                | none                           |
| `lesson_attempts`, `user_progress`, `user_key_stats`, `daily_stats`, `streaks`, `user_settings` | `auth.uid() = user_id`                                     | `auth.uid() = user_id`    | `auth.uid() = user_id` | `auth.uid() = user_id` or none |

New profiles are created by a trigger on `auth.users` insert, not by a client insert of arbitrary IDs.

Curriculum is readable without auth so guests can learn. Writes of progress require a real user; guests write only locally.

---

## Adaptive Learning

Deterministic. No ML in MVP or near-term.

### Per-key stats

Updated from the attempt summary, not live:

- attempts, correct, errors
- average latency (EMA)
- last practiced at
- mastery score (from `packages/scoring`)

### Weak keys

Among keys the user has **unlocked** and practiced at least `MIN_ATTEMPTS` (10):

- Sort by mastery ascending
- Take the bottom 3–5
- Generate drills that stay inside `allowedKeys` for that learner’s furthest lesson (or the practice mode’s key set)

Do not introduce unlearned keys in adaptive practice.

### Practice selection

Weighted random over weak keys, with a small exploration weight on mid-tier keys so the model does not obsess over one character.

---

## Scoring

All formulas live in `packages/scoring` and are documented here. Numbers are configurable constants, not scattered literals.

### WPM

A “word” is 5 characters (including spaces).

```text
elapsedMinutes = durationMs / 60000
rawWpm         = (allTypedChars / 5) / elapsedMinutes
wpm            = (correctChars / 5) / elapsedMinutes
```

In `forced-correction` mode, at completion `correctChars` equals the prompt length if the user finished. Errors still affect accuracy.

### Accuracy

```text
accuracy = correctKeystrokes / (correctKeystrokes + errorKeystrokes)
```

Backspace is not an error. The original wrong key is. Corrected errors still reduce accuracy. This rewards clean typing, not merely a clean final string.

### Consistency

Consistency measures evenness of inter-keystroke intervals (IKI).

Algorithm:

1. Collect IKIs from `performance.now()` deltas.
2. Drop the first character (no interval).
3. Drop IKIs `> 1500ms` (pause / think / attention shift, not rhythm).
4. If fewer than 8 remaining intervals, return `null` (not enough signal).
5. `cv = stddev(iki) / mean(iki)`
6. `consistency = clamp(0, 100, 100 * (1 - cv / 1.0))`

A burst-pause-burst typist scores lower than a steady typist at the same WPM.

### Stars

Three stars. Progression requires **1 star**, not 3. Users may replay freely.

**Lessons without `targetWpm` (Worlds 1–5):**

| Stars | Rule                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------ |
| 1     | Completed and accuracy ≥ 90%                                                                     |
| 2     | Accuracy ≥ 95%                                                                                   |
| 3     | Accuracy ≥ 98% and consistency ≥ 70 (or consistency `null` on very short drills: accuracy ≥ 99%) |

**Lessons with `targetWpm` (World 7+):**

Same as above, and 3 stars also require `wpm >= targetWpm`.

Below 90% accuracy: lesson is not passed, no star, next lesson stays locked. Early lessons are short so 90% is achievable (two misses on a 20-character drill still pass).

### XP

| Event                                                      | XP                           |
| ---------------------------------------------------------- | ---------------------------- |
| First lesson completion (1★+)                              | +50                          |
| Repeat completion                                          | +15                          |
| Accuracy 95–99.9%                                          | +20                          |
| Accuracy 100%                                              | +50 (replaces the 95% bonus) |
| Personal record (best WPM or best accuracy on that lesson) | +30                          |
| Boss completion (first time)                               | +100                         |
| Daily challenge (later)                                    | +100                         |

XP rewards accuracy, consistency of practice, and improvement — not raw speed alone. Speed PRs can award the PR bonus, but there is no “typed 80 WPM” XP in beginner worlds.

### User level

```text
xpRequiredToReach(n) = floor(80 * n^1.35)   // XP needed to go from n-1 to n
```

Level is stored on `profiles` and recomputed when XP changes.

### Skill-level scoring weights

Used for optional “performance score” on results (not for unlocks):

| Band                      | Accuracy | Speed | Consistency |
| ------------------------- | -------- | ----- | ----------- |
| Beginner (Worlds 1–3)     | 70%      | 15%   | 15%         |
| Intermediate (Worlds 4–6) | 55%      | 25%   | 20%         |
| Advanced (Worlds 7–8)     | 40%      | 40%   | 20%         |

Speed component is 100% of target when `wpm >= target`; below target it scales linearly. If no target, speed is scored against a gentle world default and still capped so it cannot outweigh accuracy for beginners.

### Key mastery

```text
bayesianAccuracy = (correct + 2) / (attempts + 4)      // prior ≈ 50%
confidence       = 1 - exp(-attempts / 30)

latencyScore     = 100 at ≤180ms EMA, 0 at ≥600ms, linear between
accuracyScore    = bayesianAccuracy * 100
recencyScore     = EMA of recent attempt accuracy for that key
consistencyScore = from IKI when available, else accuracyScore

mastery = confidence * (
  0.45 * accuracyScore +
  0.25 * latencyScore +
  0.20 * recencyScore +
  0.10 * consistencyScore
)
```

Low sample size cannot produce a high mastery score. That is intentional.

---

## State Management

| Layer                        | Owns                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ |
| Typing engine instance (ref) | Live cursor, timings, per-keystroke status                                     |
| React local state            | View-only snapshots at RAF or on each engine event, isolated typing surface    |
| Zustand                      | Active lesson id, exercise index, UI flags, last result, guest cache, settings |
| localStorage                 | Guest progress (`keypath.guest.v1`), settings                                  |
| Supabase                     | Canonical user progress, attempts, key stats, streak, profile                  |

Do **not** put per-keystroke fields in Zustand. That causes whole-tree rerenders and fights the latency budget.

---

## Analytics

Product analytics (PostHog or equivalent) ship in Phase 12, not in the engine.

Events (no keystroke content, no full prompt text):

- `lesson_started` / `lesson_completed` / `lesson_abandoned`
- `world_completed` / `boss_completed`
- `practice_started` / `practice_completed`
- `signup_completed`
- `streak_extended`
- `achievement_unlocked`
- `daily_challenge_completed`
- `guest_progress_migrated`

Do not send typed characters. Properties may include lesson id, duration, WPM, accuracy, stars, XP.

---

## Testing Strategy

| Layer                       | Tool                           | What                                                                                                                                         |
| --------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine, scoring, curriculum | Vitest                         | Correct/incorrect/backspace, WPM, accuracy, consistency, empty input, rapid input, unicode, allowed-key invariant, stars, XP, mastery, merge |
| UI behavior                 | Vitest + React Testing Library | Keyboard rendering states, results screen, course lock/unlock                                                                                |
| E2E                         | Playwright                     | Guest first lesson, signup + merge, lesson complete persist, course map                                                                      |

CI (GitHub Actions): `pnpm lint`, `pnpm typecheck`, `pnpm test` via Turbo. Playwright in Phase 12 and on main.

---

## Deployment

### Local

```text
pnpm install
pnpm dev              # turbo: web + watch packages
supabase start        # local Auth + Postgres
pnpm test
```

Env: `apps/web/.env.local` from `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Never commit secrets. Service role stays server-only if used for seed.

### Staging / production

- Vercel project on `apps/web`
- Supabase project (staging + prod)
- Migrations applied via Supabase CLI, never by hand in the dashboard as the source of truth

---

## Future Features (post-MVP)

Explicitly out of MVP:

- Multiplayer / real-time races / leagues
- AI-generated curriculum or “AI tutor”
- Webcam / posture detection
- Native apps
- Teacher / classroom dashboard
- More than one polished game
- Social network, follows, public profiles beyond a simple share card
- Alternate keyboard layouts
- Magic-link-only auth
- CMS for lessons
- Per-keystroke cloud replay
- Streak freezes, gems, gacha, energy systems

Planned after MVP (see BUILD_PLAN phases 8–12): expanded practice modes, Word Rain, daily challenges, achievements, placement test, polish, PostHog, production launch.

---

## Architectural Decisions

Record decisions here. Newest first.

### ADR-001 — Curriculum lives in code, metadata in Postgres

**Decision:** Author worlds/lessons/exercises in `packages/curriculum`. Seed IDs and titles into Postgres.

**Why:** Curriculum is reviewed like code. Git diff is the right review tool. Avoids a CMS and avoids duplicating exercise text in SQL. Attempts still reference stable lesson IDs.

**Rejected:** Postgres as source of truth for prompts (slow iteration, weak review). Fully client-only with no lesson table (weak FKs).

### ADR-002 — No anonymous Supabase users for guests

**Decision:** Guest progress is localStorage. Auth users are real signups.

**Why:** Anonymous auth creates orphaned users and messy merges. The spec’s “try then save” path maps cleanly onto local → migrate.

### ADR-003 — Forced correction in Learn; free-flow in speed/games

**Decision:** Engine supports both; Learn defaults to forced correction.

**Why:** Beginners who can skip past errors never build the correction habit. Speed tests that force correction distort WPM. One engine, two modes.

### ADR-004 — 1★ required to unlock; 3★ never required; no WPM gate in early worlds

**Decision:** Unlock at ≥90% accuracy. `targetWpm` is ignored for stars until speed worlds.

**Why:** Matches “accuracy before speed.” Requiring WPM in World 1 would punish correct slow typing.

### ADR-005 — Per-keystroke state stays out of Zustand

**Decision:** Engine in a ref; Zustand for coarse session state.

**Why:** Typing must feel instant. Store subscriptions on every key would rerender the app shell.

### ADR-006 — Aggregate writes only

**Decision:** One attempt payload at lesson end. Key stats are summaries.

**Why:** Cost, latency, and privacy. Spec forbids per-keystroke network I/O.

### ADR-007 — Deterministic mastery, not ML

**Decision:** Documented formula in `packages/scoring` with Bayesian smoothing.

**Why:** Debuggable, tunable, honest. “AI” would not improve the MVP.

### ADR-008 — US QWERTY only in MVP

**Decision:** Single layout map in the engine. Alternate layouts later.

**Why:** Finger maps and curriculum prompts are layout-specific. Doing one layout well beats shipping three half-broken ones.

### ADR-009 — Thin `packages/ui`

**Decision:** Extract virtual keyboard and a few primitives. Do not force every visual through a design-system package on day one.

**Why:** Premature extraction slows the lesson UI. The keyboard is the one primitive that is clearly shared (Learn, Practice, Stats heatmap, games).

### ADR-010 — PostHog (or equivalent) only at production polish

**Decision:** No analytics SDK until Phase 12.

**Why:** Nothing to measure until the loop exists. Avoid early PII surface.

### ADR-011 — Monorepo with pnpm + Turborepo as specified

**Decision:** Keep the proposed package split. Engine has no React dependency.

**Why:** The engine and scoring must be testable without Next. The split is justified, not ceremonial.

### ADR-014 — Consume TypeScript source from packages; Bundler module resolution

**Decision:** Workspace packages export `.ts` entrypoints. Next.js `transpilePackages` compiles them. Shared `tsconfig` uses `moduleResolution: Bundler`, not NodeNext.

**Why:** These packages are not published to npm. Requiring `.js` extensions (NodeNext) fights Vitest and Next. A separate `tsup` build step is premature.

### ADR-013 — Next.js 16 from create-next-app

**Decision:** Use the current `create-next-app` default (Next.js 16, React 19, Tailwind v4, App Router) rather than pinning Next 15.

**Why:** There is no product dependency on a 15-only API. Staying on the generator default reduces one-off config drift. Revisit only if a Supabase SSR or Vercel feature requires it.

### ADR-012 — Consistency uses CV of IKIs with 1.5s pause filter

**Decision:** See Scoring. Pauses over 1500ms are excluded.

**Why:** True rhythm is even intervals while typing. Including an AFK gap would make consistency meaningless. Burst-pause-burst under 1.5s still penalizes.

---

## Visual and UX direction (constraints)

Detailed visual identity is implemented in the web app, not in this doc. Non-negotiables:

- Typing surface is quiet: no chrome, no toasts, no decorative motion on each key.
- Motion is reserved for completion, stars, XP, world unlocks.
- Error state is a color + optional soft mark, not shake or sound spam. Sound is optional and off by default until proven useful.
- Essential status is never color-only (icons/text for wrong vs right).
- `prefers-reduced-motion` disables celebratory motion.
- Contrast and focus rings are required.

---

## Document maintenance

- Architecture change → update this file and add/adjust an ADR.
- Phase complete → update `BUILD_PLAN.md` status, completion notes, and known issues.
- Formula change → update Scoring here **and** constants in `packages/scoring` together.
