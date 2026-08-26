-- Keypath MVP schema, RLS, and profile trigger.
-- Policy review is in the comments beside each table.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Curriculum metadata (readable without auth; writes are seed / service only)
-- ---------------------------------------------------------------------------

create table public.worlds (
  id text primary key,
  title text not null,
  description text not null default '',
  sort_order integer not null,
  status text not null check (status in ('full', 'partial', 'stub')),
  created_at timestamptz not null default now()
);

create table public.lessons (
  id text primary key,
  world_id text not null references public.worlds (id) on delete cascade,
  title text not null,
  sort_order integer not null,
  is_boss boolean not null default false,
  target_accuracy numeric not null default 0.9
    check (target_accuracy >= 0 and target_accuracy <= 1),
  target_wpm integer,
  created_at timestamptz not null default now()
);

create index lessons_world_sort_idx on public.lessons (world_id, sort_order);

-- SELECT: anon + authenticated (guests can learn).
-- INSERT/UPDATE/DELETE: none for those roles; seed runs as postgres/service.
alter table public.worlds enable row level security;
alter table public.lessons enable row level security;

create policy worlds_select_public
  on public.worlds
  for select
  to anon, authenticated
  using (true);

create policy lessons_select_public
  on public.lessons
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users). Inserts come from the trigger, not clients.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text not null default '',
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  lifetime_wpm numeric not null default 0 check (lifetime_wpm >= 0),
  lifetime_accuracy numeric not null default 0
    check (lifetime_accuracy >= 0 and lifetime_accuracy <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- SELECT/UPDATE: own row. INSERT: trigger only (security definer). DELETE: none.
alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- User-owned tables. All scoped by auth.uid() = user_id.
-- Anon cannot select another user's rows because anon has no uid match.
-- ---------------------------------------------------------------------------

create table public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null references public.lessons (id),
  duration_ms integer not null check (duration_ms >= 0),
  wpm numeric not null check (wpm >= 0),
  raw_wpm numeric not null check (raw_wpm >= 0),
  accuracy numeric not null check (accuracy >= 0 and accuracy <= 1),
  consistency numeric check (consistency is null or (consistency >= 0 and consistency <= 100)),
  errors integer not null check (errors >= 0),
  corrected_errors integer not null check (corrected_errors >= 0),
  max_combo integer not null check (max_combo >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  stars integer not null check (stars between 0 and 3),
  key_stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index lesson_attempts_user_created_idx
  on public.lesson_attempts (user_id, created_at desc);
create index lesson_attempts_user_lesson_created_idx
  on public.lesson_attempts (user_id, lesson_id, created_at desc);

create table public.user_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null references public.lessons (id),
  stars integer not null default 0 check (stars between 0 and 3),
  best_wpm numeric not null default 0 check (best_wpm >= 0),
  best_accuracy numeric not null default 0
    check (best_accuracy >= 0 and best_accuracy <= 1),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  first_completed_at timestamptz,
  last_attempted_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index user_progress_user_idx on public.user_progress (user_id);

create table public.user_key_stats (
  user_id uuid not null references public.profiles (id) on delete cascade,
  key text not null,
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct >= 0),
  errors integer not null default 0 check (errors >= 0),
  ema_latency_ms numeric,
  mastery_score numeric not null default 0,
  last_practiced_at timestamptz,
  primary key (user_id, key)
);

create index user_key_stats_user_mastery_idx
  on public.user_key_stats (user_id, mastery_score);

create table public.daily_stats (
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  practice_minutes numeric not null default 0 check (practice_minutes >= 0),
  characters integer not null default 0 check (characters >= 0),
  lessons_completed integer not null default 0 check (lessons_completed >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  primary key (user_id, date)
);

create index daily_stats_user_date_idx on public.daily_stats (user_id, date desc);

create table public.streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_practice_date date,
  practice_days_month integer not null default 0 check (practice_days_month >= 0)
);

create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  sound boolean not null default true,
  assistance_override text,
  reduced_motion boolean not null default false,
  keyboard_labels boolean not null default true
);

alter table public.lesson_attempts enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_key_stats enable row level security;
alter table public.daily_stats enable row level security;
alter table public.streaks enable row level security;
alter table public.user_settings enable row level security;

-- Attempts are append-only (no update/delete for clients).
create policy lesson_attempts_select_own
  on public.lesson_attempts for select to authenticated
  using (auth.uid() = user_id);
create policy lesson_attempts_insert_own
  on public.lesson_attempts for insert to authenticated
  with check (auth.uid() = user_id);

create policy user_progress_select_own
  on public.user_progress for select to authenticated
  using (auth.uid() = user_id);
create policy user_progress_insert_own
  on public.user_progress for insert to authenticated
  with check (auth.uid() = user_id);
create policy user_progress_update_own
  on public.user_progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy user_key_stats_select_own
  on public.user_key_stats for select to authenticated
  using (auth.uid() = user_id);
create policy user_key_stats_insert_own
  on public.user_key_stats for insert to authenticated
  with check (auth.uid() = user_id);
create policy user_key_stats_update_own
  on public.user_key_stats for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy daily_stats_select_own
  on public.daily_stats for select to authenticated
  using (auth.uid() = user_id);
create policy daily_stats_insert_own
  on public.daily_stats for insert to authenticated
  with check (auth.uid() = user_id);
create policy daily_stats_update_own
  on public.daily_stats for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy streaks_select_own
  on public.streaks for select to authenticated
  using (auth.uid() = user_id);
create policy streaks_update_own
  on public.streaks for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy user_settings_select_own
  on public.user_settings for select to authenticated
  using (auth.uid() = user_id);
create policy user_settings_update_own
  on public.user_settings for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Signup trigger: profile + empty streak + settings. Not a client insert.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  );
  insert into public.streaks (user_id) values (new.id);
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant usage on schema public to anon, authenticated;

grant select on table public.worlds to anon, authenticated;
grant select on table public.lessons to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert on table public.lesson_attempts to authenticated;
grant select, insert, update on table public.user_progress to authenticated;
grant select, insert, update on table public.user_key_stats to authenticated;
grant select, insert, update on table public.daily_stats to authenticated;
grant select, update on table public.streaks to authenticated;
grant select, update on table public.user_settings to authenticated;
