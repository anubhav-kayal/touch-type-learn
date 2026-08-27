# Keypath — Build Plan

Phased implementation plan. Work **one phase at a time**. Do not silently skip or merge phases.

At the **start** of a phase: state the objective, decisions, and risks.  
At the **end** of a phase: test, summarize, list known issues, update this file. Update [`PROJECT.md`](./PROJECT.md) if architecture changed.

Product and architecture: [`PROJECT.md`](./PROJECT.md).

---

## Current status

| Field        | Value                       |
| ------------ | --------------------------- |
| Active phase | Phase 6 — Adaptive practice |
| Last updated | 2026-08-27                  |
| MVP =        | Phases 0–7                   |
| Post-MVP =   | Phases 8–13                  |

**Legend:** `not started` · `in progress` · `done`

---

## Phase map

```text
0  Repo / toolchain / docs
1  Typing engine
2  Lesson UI + virtual keyboard
3  Curriculum + course map
4  Supabase, auth, persistence, guest merge
5  Stars, XP, streaks, bosses, unlocks
6  Per-key stats, mastery, adaptive practice
7  Dashboard + basic statistics          ← MVP complete
8  Broader practice modes
9  Word Rain (first game)
10 Daily challenges + achievements
11 Placement test
12 Polish, a11y, E2E, analytics
13 Hosted Supabase + public accounts   ← live for everyone
```

### Dependencies

```text
0 → 1 → 2 → 3 → 5          scoring UI needs curriculum + engine
        ↘ 4 → 5 → 6 → 7    persistence before adaptive aggregates
                     ↘ 8
                     ↘ 9
                     ↘ 10
                3+6 → 11   placement needs curriculum + mastery
7+12 overlap is fine for polish of MVP surfaces
12 → 13    polish before public Auth URL and prod keys
```

Guest local persistence is sketched in Phase 2 (enough to retry a lesson) and completed in Phase 4 (schema + merge).

---

## MVP boundary

**In:**

- Typing engine
- Worlds 1–3 complete; World 4–5 partial; 6–8 stubs
- Virtual keyboard + assistance levels
- Lesson interface + results
- Course map + 1★ unlocks
- Guest + authenticated progress
- Stars, XP, user level, streaks
- Weak-key tracking + adaptive practice
- Dashboard + basic stats (not the full heatmap/finger suite)

**Out:**

- Multiplayer, leagues, races
- AI-generated curriculum
- Webcam / native app / teacher dashboard
- Games (Word Rain is Phase 9)
- Full practice catalog (Phase 8)
- Daily challenges / achievements (Phase 10)
- Placement test (Phase 11)
- PostHog and production hardening (Phase 12)

---

## Phase 0 — Repository and architecture

**Status:** `done`

### Objective

Install a boring, strict monorepo that can host the engine, curriculum, scoring, and Next.js app. No product features.

### Features

- None facing users except a placeholder web app that boots

### Technical tasks

- [x] pnpm workspaces + Turborepo pipelines (`build`, `dev`, `lint`, `typecheck`, `test`)
- [x] `apps/web` Next.js App Router, TypeScript strict, Tailwind, path aliases
- [x] Packages: `typing-engine`, `curriculum`, `scoring`, `shared-types`, `ui`, `typescript-config`, `eslint-config`
- [x] ESLint + Prettier
- [x] Vitest for packages and `apps/web` (RTL deferred to Phase 2 when UI exists)
- [x] `.env.example`, `.gitignore`, `README.md` (dev commands only)
- [x] `supabase/config.toml` placeholder + empty `migrations/`
- [x] GitHub Actions: lint, typecheck, test
- [x] This file + `PROJECT.md`

### Database changes

None.

### Dependencies

None.

### Tests

Toolchain: `pnpm test` runs placeholder suites successfully.

### Completion criteria

- `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` work
- Packages are importable from `apps/web` via `@keypath/*`
- No lesson UI yet

### Known risks

- Tailwind + Next + package compilation (use `transpilePackages` or tsup as needed)
- Over-extracting `packages/ui` before a keyboard exists — keep the package empty-but-valid

### Phase notes

Shipped 2026-08-26. Next.js 16 + React 19 + Tailwind v4 from `create-next-app`. Packages export TypeScript source; Next transpiles them. React Testing Library is not installed yet — there are no UI components to test. `supabase/config.toml` is a minimal stub, not a full CLI-generated config. Ready for Phase 1.

---

## Phase 1 — Core typing engine

**Status:** `done`

### Objective

A React-free engine that can run a lesson prompt in tests and, later, in the UI.

### Features

- Keystroke processing, cursor, errors, backspace
- `forced-correction` and `free-flow` modes
- WPM, raw WPM, accuracy, consistency
- Per-key timing and substitution tracking
- Finger map for US QWERTY
- Grapheme-aware character iteration

### Technical tasks

- [x] Implement modules: `engine`, `timing`, `calculateWpm`, `calculateAccuracy`, `calculateConsistency`, `keyTracking`, `fingerMapping`, `mistakeTracking`, `types`
- [x] Public API: create session → `handleKey` / `handleBackspace` → snapshot
- [x] Export layout constants from one module only
- [x] No React, no DOM except `performance.now` injection for tests

### Database changes

None.

### Dependencies

Phase 0. `shared-types` for DTO shapes if they stabilize here.

### Tests (required)

Vitest cases: correct char, wrong char, backspace, double backspace, complete, empty prompt, rapid sequence, corrected errors, unicode `₹`, consistency with even vs bursty IKIs, pause >1500ms excluded, both input modes, finger map for home-row keys.

### Completion criteria

- Package tests green
- Engine usable from Node in Vitest with a fake `now()`
- Documented snapshot type matches `PROJECT.md`

### Known risks

- `performance.now` in Node tests — inject a clock
- Grapheme segmentation vs UTF-16 surrogate pairs
- Defining “character” consistently for prompts and input

### Phase notes

Shipped 2026-08-26. `createTypingSession` + injected `createManualClock`. A character is an NFC grapheme (`Intl.Segmenter`). Forced correction requires backspace before the cursor can advance; extra keys while an error is pending count as additional errors. Net WPM uses currently correct slots; raw WPM uses all character keystrokes. Accuracy is a 0–1 ratio that still penalizes corrected mistakes. Consistency is 0–100 from the CV of IKIs (pauses >1500ms dropped; `null` below 8 intervals). `₹` is one grapheme and has no US QWERTY finger. 33 Vitest tests passing. Ready for Phase 2.

---

## Phase 2 — Basic typing experience

**Status:** `done`

### Objective

A single-lesson experience that feels instant: prompt, caret, errors, keyboard, results.

### Features

- Lesson player route (can use a fixture lesson)
- Target text with current-char highlight
- Incorrect-character state (no shake)
- Virtual keyboard: default, target, pressed, correct, incorrect, finger
- Results: WPM, accuracy, consistency, errors, combo
- Optional “keyboard needed” notice on coarse pointers
- Quiet UI during typing (no app chrome)

### Technical tasks

- [x] Isolate the typing surface so keystrokes do not rerender the shell
- [x] Zustand store: lesson session flags only
- [x] `packages/ui` keyboard driven by engine snapshot + finger map
- [x] Motion only on results enter
- [x] Fixture lesson in the web app or curriculum stub

### Database changes

None.

### Dependencies

Phase 1. Light use of `packages/scoring` optional (stars can wait for Phase 5).

### Tests

RTL: renders prompt, marks wrong char, keyboard highlights target. Do not try to E2E every key.

### Completion criteria

- Developer can complete a fixture drill on a physical keyboard
- Input latency feels immediate
- Keyboard and prompt stay in sync

### Known risks

- React rerender cost — measure before memoizing everything
- Focus management (`tabIndex`, capturing `keydown` on window vs hidden input)
- IME composition (MVP: US English; ignore IME until it bites)

### Phase notes

Shipped 2026-08-26. Route: `/learn/home-row` (fixture `asdf jkl;`). Engine lives in TypingSurface state; Zustand only holds view/result/runId. Virtual keyboard in `@keypath/ui` uses `resolveKeyState` + engine finger map. F/J show tactile bumps; current character uses the same bump as a caret. Errors use color plus underline (no shake). Coarse-pointer notice is informational. RTL covers prompt, wrong-key state, target highlight, and completion. IME still ignored. Guest save is Phase 4.

---

## Phase 3 — Curriculum system

**Status:** `done`

### Objective

Data-driven worlds and lessons with the allowed-key invariant and a readable course map.

### Features

- World 1 fully authored (orientation through home-row boss)
- World 2 fully authored
- World 3 fully authored
- Worlds 4–5: enough lessons to continue the path
- Worlds 6–8: titled stubs / locked
- Course map: current, complete, locked, boss
- Unlock rule: 1★ (temporary local stars until Phase 5) **or** “completed fixture accuracy ≥90%” if scoring is not wired yet — prefer calling scoring for stars even if XP is stubbed
- Lesson structure: introduce → drill → words → challenge → results

### Technical tasks

- [x] `packages/curriculum` lesson types, world lists, `assertAllowedKeys`
- [x] Generator helpers for patterns that **check** allowed keys
- [x] Course map UI
- [x] Wire lesson player to curriculum IDs, not fixtures
- [x] Assistance level per lesson

### Database changes

None (seed in Phase 4).

### Dependencies

Phases 1–2. `packages/scoring` for pass/stars if already present; otherwise a temporary pass function that matches the 90% rule and is replaced in Phase 5 without changing thresholds.

### Tests

Every authored prompt: all chars ⊆ `allowedKeys` ∪ `{ space }` (and later explicit punctuation). World 1 contains no top-row letters. Boss lessons flagged.

### Completion criteria

- A new user can walk World 1 on the map
- Adding a lesson is a data change, not a UI rewrite
- Allowed-key tests fail if a prompt leaks an unknown letter

### Known risks

- Authoring quality (boring drills vs useful ones) — budget time for copy
- Course map visual complexity — ship a clear vertical/path map, not a minigame

### Phase notes

Shipped 2026-08-26. Catalog lives in `packages/curriculum` (`w1-orient` … `w5-sentences`). Worlds 6–8 are stubs. `assertAllowedKeys` runs at catalog load for every typing prompt. `calculateStars` in `@keypath/scoring` gates unlocks at 90%. Best stars are stored in `localStorage` (`keypath.progress.v1`) until Phase 4. Assistance: World 1 full, late World 2–3 minimal, Worlds 4–5 on-error. Route `/learn` is the map; `/learn/[lessonId]` plays a lesson. `/learn/home-row` redirects to `w1-home-fj`.

---

## Phase 4 — Supabase and accounts

**Status:** `done`

### Objective

Real persistence, auth, RLS, and guest migration. Curriculum metadata seeded.

### Features

- Email/password auth; Google if env present
- Profile trigger on signup
- Save attempt + progress when signed in
- Guest localStorage schema `keypath.guest.v1`
- Merge on first authenticated session (see `PROJECT.md`)
- Continue as guest

### Technical tasks

- [x] Migrations for MVP tables
- [x] RLS policies as specified
- [x] Seed worlds/lessons IDs
- [x] `@supabase/ssr` server client + browser client
- [x] Server Actions for attempt submit (validate payload)
- [x] Guest provider + migrate action
- [x] `.env.example` documented

### Database changes

Create: `profiles`, `worlds`, `lessons`, `lesson_attempts`, `user_progress`, `user_key_stats` (table may stay unused until Phase 6), `daily_stats`, `streaks`, `user_settings`. RLS on all user tables. Indexes from `PROJECT.md`.

### Dependencies

Phase 3 (stable lesson IDs). Phase 2 UI to attach save.

### Tests

- SQL/RLS: documented policy review
- Unit: merge function (guest vs empty account, guest vs existing)
- Optional: Playwright signup path in Phase 12

### Completion criteria

- Signed-in attempt appears in Postgres
- Guest can complete lessons offline of auth
- Signup imports guest progress once
- Anon role cannot `select` another user’s attempts

### Known risks

- Merge bugs (double XP) — implement merge in one pure function with tests
- Local Supabase not running in CI — keep unit tests independent of Docker
- Clock skew on streak dates — use UTC dates

### Notes

Shipped 2026-08-26. Schema lives in `supabase/migrations/20260826100000_init.sql` (RLS comments beside each table). Seed IDs are generated from the curriculum catalog (`renderCurriculumSeedSql`); `apps/web/src/seed-sql.test.ts` fails if they drift. Guest progress is `keypath.guest.v1`; `keypath.progress.v1` is imported once. Guests keep learning with no Supabase. Signed-in finish writes one attempt row plus progress/key/daily/streak aggregates. Merge is `mergeGuestIntoAccount` in `@keypath/scoring`. Routes: `/login`, `/signup`, `/auth/callback`. Google only if `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`. This machine has no Docker/Supabase CLI, so the signed-in Postgres path needs `supabase start` or a hosted project plus `apps/web/.env.local`.

---

## Phase 5 — Progression and gamification

**Status:** `done`

### Objective

Stars, XP, level, streaks, boss framing, unlocks — all using `packages/scoring`.

### Features

- Star thresholds (world-dependent WPM as in `PROJECT.md`)
- XP awards (first vs repeat, accuracy, PR, boss)
- User level from XP curve
- Streak: current, longest, days this month; quiet reset, no scare copy
- Boss lessons at end of Worlds 1–3
- Course map consumes persisted stars

### Technical tasks

- [x] `packages/scoring`: stars, XP, level, streak date logic
- [x] Results screen shows stars + XP breakdown
- [x] Persist XP/level/streak (user) and mirror in guest storage
- [x] Unlock = 1★ on previous lesson (linear per world)

### Database changes

Use `profiles.xp`, `profiles.level`, `streaks`, `user_progress.stars`. No new tables required if Phase 4 created them.

### Dependencies

Phase 4 for persistence; Phase 3 for bosses and order.

### Tests

Scoring table tests: 89.9% → 0 stars; 90% → 1; 95% → 2; 98% + consistency → 3; targetWpm only on speed lessons; XP 100% does not stack with 95% bonus; streak overnight UTC.

### Completion criteria

- Map locks/unlocks from stars
- Repeat lesson awards reduced XP
- Streak increments once per UTC day with a passed lesson

### Known risks

- Farming XP via 2-second drills — acceptable for MVP; cap later if needed
- Consistency `null` on short drills — fallback documented in `PROJECT.md`

### Phase notes

Shipped 2026-08-27. Stars were already in `calculateStars`; this phase adds `calculateXp`, `levelFromXp` / `xpRequiredToReach(n) = floor(80 * n^1.35)`, and `applyStreakOnPass` (UTC, once per day, quiet reset). XP is recomputed on the server from the attempt + stored bests — the client does not send XP. Failed lessons (0★) award no XP and do not touch the streak. Guests get the same awards in `keypath.guest.v1`. Results shows a small XP ledger; `/learn` shows level, XP, and a calm streak line. Boss lessons in Worlds 1–3 were already in the catalog.

---

## Phase 6 — Adaptive practice

**Status:** `not started`

### Objective

Per-key mastery and a Practice entry that drills weak keys without violating `allowedKeys`.

### Features

- Update `user_key_stats` from attempt summaries
- Mastery formula
- Weak-key list (min 10 attempts, unlocked keys only)
- Practice: “Your weak keys” generated drills
- Dashboard widget later in Phase 7; this phase can expose a Practice page

### Technical tasks

- [ ] Scoring: mastery, weak-key picker
- [ ] Curriculum: drill generator from a key set
- [ ] Server Action to upsert key stats in bulk after attempt
- [ ] Guest: same stats in localStorage

### Database changes

Populate `user_key_stats`. Add index on `(user_id, mastery_score)` if missing.

### Dependencies

Phases 4–5 (attempts exist). Curriculum allowed-key helper.

### Tests

Mastery low at n=3 even with 100% hits. Weak keys ignore locked letters. Generator never emits extra letters.

### Completion criteria

- After several World 1 lessons, Practice offers home-row weak keys only
- Mastery documented and matches implementation constants

### Known risks

- EMA latency initialization (first hit should not mark a key “slow forever”)
- Empty weak-key set for brand-new users — show “complete more Learn lessons”

---

## Phase 7 — Dashboard and statistics

**Status:** `not started`

### Objective

A home that pushes “Continue” and a Stats page with the first honest charts.

### Features

- Dashboard: continue, world/level, progress, streak, XP/level, WPM, accuracy, today, weak keys
- Stats: average/best WPM, accuracy, consistency, time, characters, lessons, activity, WPM/accuracy over time
- Simple per-key table (heatmap can be a stretch if keyboard component is ready)

### Technical tasks

- [ ] Queries / views for aggregates (or compute from attempts in app for MVP)
- [ ] Recharts on Stats only
- [ ] Mobile-capable dashboard layout
- [ ] Empty states that send the user into Learn

### Database changes

Read-only use of existing tables. Optional SQL view `user_stat_summaries` if queries get heavy — not required.

### Dependencies

Phases 4–6.

### Tests

Empty account dashboard. After one attempt, continue CTA points at the next locked-or-current lesson.

### Completion criteria

- New user and returning user both know what to click
- Stats page does not live on the typing surface
- MVP feature list in this document is satisfied

### Known risks

- Over-fetching attempts — aggregate server-side or maintain `daily_stats`
- Heatmap scope creep — table is enough to close MVP

### MVP exit checklist

- [ ] Engine tested
- [ ] Worlds 1–3 playable
- [ ] Keyboard + assistance
- [ ] Map + 1★ gates
- [ ] Guest + auth + merge
- [ ] Stars, XP, streaks
- [ ] Weak keys + adaptive practice
- [ ] Dashboard + basic stats

---

## Phase 8 — Practice modes

**Status:** `not started` (post-MVP)

### Objective

Practice as a real destination, not only weak keys.

### Features

- Weakest keys (already in 6)
- Accuracy mode, speed mode
- Common words, punctuation, numbers
- Custom text paste (length-capped)

### Technical tasks

Mode catalog in curriculum/practice package; each mode is a lesson-shaped session using the same player.

### Database changes

Optional `practice_attempts` or reuse `lesson_attempts` with a `source` enum. Prefer a `source` column added via migration.

### Dependencies

Phase 7 MVP player + scoring.

### Tests

Custom text still scored; reject enormous pastes.

### Completion criteria

At least four modes besides Learn, all using the engine.

### Known risks

Custom text can include unteachable unicode — strip or warn.

---

## Phase 9 — First game (Word Rain)

**Status:** `not started` (post-MVP)

### Objective

One polished game. No second game in this phase.

### Features

- Words fall; type to clear before bottom
- Uses typing engine (or engine-compatible scorer) for correctness/timing
- Results feed XP + key stats

### Technical tasks

Game loop in `apps/web`; shared engine for commit of a word; no duplicate WPM math.

### Database changes

Attempts with `source = 'word-rain'` if enum exists.

### Dependencies

Engine + scoring + auth/guest save path.

### Tests

Word commit on exact match; miss on timeout; allowed-key words for beginner difficulty.

### Completion criteria

Game is fun for 3–5 minutes and does not jank; metrics match engine definitions.

### Known risks

RAF + React; keep rendering in canvas or a dedicated view. Difficulty curve.

---

## Phase 10 — Daily challenges and achievements

**Status:** `not started` (post-MVP)

### Objective

Light meta-progression that celebrates real milestones.

### Features

- Daily challenge pool (200 words @95%, 3 weak keys, 3 lessons, beat 60s PB)
- Achievements: first lesson, perfect run, speed 40/60/100, home-row hero, marathon, precision
- Reward XP; no punitive miss for dailies

### Technical tasks

Tables `achievements`, `user_achievements`, `daily_challenges`, `user_daily_challenges`. Unlock in scoring/pure functions, persist after attempt.

### Database changes

As above. RLS: own rows only. Achievements catalog readable by all.

### Dependencies

Phases 5–7.

### Tests

Achievement idempotency (unlock once). Daily challenge UTC day boundary.

### Completion criteria

Completing World 1 boss unlocks Home Row Hero. Dailies reset at UTC midnight.

### Known risks

Timezone confusion — document UTC. Notification spam — show once on results.

---

## Phase 11 — Placement test

**Status:** `not started` (post-MVP)

### Objective

Non-beginners skip World 1 without skipping technique they actually lack.

### Features

- Short assessment: speed, accuracy, punctuation, numbers, observed weak keys
- Recommend a world/lesson start
- User can ignore and start at World 1

### Technical tasks

Fixed prompts (not model-generated). Scoring maps results to a start lesson. Still enforce `allowedKeys` from that point forward.

### Database changes

Store placement result on profile (`placement_world_id`, completed_at).

### Dependencies

Curriculum + mastery/weak keys.

### Tests

Low accuracy home-row → World 1. High WPM + punctuation errors → World 5-ish. Never skip into keys the test did not sample.

### Completion criteria

Recommendation is explainable (“weak on numbers → World 6”). Beginner can opt out.

### Known risks

Over-skipping beginners who type fast with two fingers — include a technique/home-row sample that cannot be faked easily (no looking: we cannot detect; keep a mandatory home-row accuracy gate).

---

## Phase 12 — Polish and production readiness

**Status:** `not started`

### Objective

Ship. This phase hardens Phases 0–7 (and later 8–11 if already built).

### Features

- Accessibility pass (focus, contrast, reduced motion, labels)
- Loading and error states
- Responsive dashboard/stats/profile
- Performance pass on typing surface
- PostHog (or chosen analytics) with the event list in `PROJECT.md`
- RLS review
- Playwright: guest lesson, signup merge, persist, map unlock
- Staging env checklist (no public DNS required)

### Technical tasks

Security review of actions (zod payloads). Monitoring. Keyboard-only navigation of chrome. `README` local + staging env. Production URL and public Auth are **Phase 13**.

### Database changes

Only if review finds missing policies or indexes.

### Dependencies

MVP (Phase 7) minimum.

### Tests

Playwright suite green against local or staging. Lighthouse/a11y spot check on dashboard and lesson (lesson a11y: live region optional; do not announce every key).

### Completion criteria

- Staging URL or local E2E of the core loop
- RLS verified
- Analytics events firing without typed text
- Ready to point Auth at a public domain in Phase 13

### Known risks

- Focus stolen from the lesson by toasts
- Hydration mismatches from guest localStorage — gate on client mount

---

## Phase 13 — Public accounts (hosted)

**Status:** `not started`

### Objective

Keypath is live for everyone. Sign-up and saved progress use a **hosted** Supabase project. End users install nothing. Docker Desktop is local-only and is not part of production.

### Features

- Hosted Supabase (Auth + Postgres) for all public accounts
- Next.js on Vercel (`apps/web`)
- Email/password signup on the public URL
- Google OAuth if the hosted provider is configured
- Guest still works; first sign-in merges `keypath.guest.v1` into the account
- Auth site URL and redirect allow-list set to the real domain

### Technical tasks

- [ ] Create staging + production Supabase projects
- [ ] `supabase link` + `supabase db push` (migrations + seed; never hand-edit prod as source of truth)
- [ ] Vercel project for `apps/web`
- [ ] Production env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `SUPABASE_SERVICE_ROLE_KEY` server-only
- [ ] Dashboard: Auth site URL = production origin; additional redirects include `/auth/callback`
- [ ] Optional: Google provider + `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` on Vercel
- [ ] Confirm a new user can sign up from the public URL and an attempt row appears in hosted Postgres
- [ ] Confirm guests can finish World 1 without an account

### Database changes

Apply existing MVP schema to hosted projects. No new tables unless Phase 12 review added policies.

### Dependencies

Phase 12 (hardening). Phase 4 schema and merge must already exist.

### Tests

Playwright signup + persist against staging. Manual: create account on production, complete one lesson, verify `lesson_attempts` for that user only (RLS).

### Completion criteria

- Public URL
- Anyone can create an account without Docker or the CLI
- Guest merge works on first sign-in from a real browser
- Service role is not in client bundles

### Known risks

- Wrong Auth site URL → OAuth/email redirects fail
- Pointing Vercel at local `127.0.0.1` keys → production sign-in broken
- Forgetting `db push` → FK errors on lesson ids

---

## Recommended spec adjustments (accepted)

These are product/engineering changes from the original brief. Full rationale is in `PROJECT.md` ADRs.

1. Curriculum source of truth is **code**, Postgres holds IDs/metadata.
2. Guests use **localStorage**, not anonymous Auth users.
3. Learn uses **forced correction**; speed/games use **free-flow**.
4. **1★ (90%)** unlocks the next lesson; 3★ never required; **no WPM gate** before speed worlds.
5. Analytics SDK **deferred to Phase 12**.
6. **US QWERTY only** in MVP.
7. `packages/ui` stays **thin**; keyboard is the shared primitive.
8. Consistency = **CV of IKIs**, pauses >1500ms dropped.
9. Mastery uses **Bayesian smoothing + sample confidence**.
10. Email/password (+ Google if configured); **no magic link in MVP**.
11. Games, extra practice modes, dailies, placement = **post-MVP**.
12. Per-keystroke state **never** in Zustand.

---

## How to run a phase

1. Set this file’s active phase to `in progress`.
2. Implement only that phase’s tasks.
3. Run the phase’s tests.
4. Mark tasks, set status `done`, write a short **Phase notes** subsection (what shipped, what slipped, issues).
5. If an ADR changed, update `PROJECT.md` the same day.
