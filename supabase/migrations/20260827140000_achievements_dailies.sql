-- Daily challenges and achievements. Catalogs are readable by guests; user rows are own-only.

create table public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  xp integer not null default 0 check (xp >= 0)
);

insert into public.achievements (id, title, description, xp) values
  ('first-lesson', 'First star', 'Pass any lesson with 90% accuracy.', 25),
  ('perfect-run', 'Perfect run', 'Finish a lesson with 100% accuracy.', 40),
  ('speed-40', '40 WPM', 'Reach 40 WPM on any session.', 20),
  ('speed-60', '60 WPM', 'Reach 60 WPM on any session.', 40),
  ('speed-100', '100 WPM', 'Reach 100 WPM on any session.', 80),
  ('home-row-hero', 'Home Row Hero', 'Pass the World 1 boss.', 100),
  ('marathon', 'Marathon', 'Practice 15 minutes in one UTC day.', 50),
  ('precision', 'Precision', 'Earn three stars on a lesson.', 40);

create table public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index user_achievements_user_idx on public.user_achievements (user_id);

create table public.daily_challenges (
  date date primary key,
  challenge_id text not null,
  title text not null,
  description text not null
);

create table public.user_daily_challenges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  challenge_id text not null,
  progress numeric not null default 0 check (progress >= 0),
  target numeric not null check (target > 0),
  completed boolean not null default false,
  xp_awarded boolean not null default false,
  primary key (user_id, date)
);

create index user_daily_challenges_user_date_idx on public.user_daily_challenges (user_id, date desc);

alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.user_daily_challenges enable row level security;

create policy achievements_select_public
  on public.achievements for select to anon, authenticated
  using (true);

create policy daily_challenges_select_public
  on public.daily_challenges for select to anon, authenticated
  using (true);

create policy daily_challenges_insert_authenticated
  on public.daily_challenges for insert to authenticated
  with check (true);

create policy daily_challenges_update_authenticated
  on public.daily_challenges for update to authenticated
  using (true)
  with check (true);

create policy user_achievements_select_own
  on public.user_achievements for select to authenticated
  using (auth.uid() = user_id);

create policy user_achievements_insert_own
  on public.user_achievements for insert to authenticated
  with check (auth.uid() = user_id);

create policy user_achievements_update_own
  on public.user_achievements for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy user_daily_challenges_select_own
  on public.user_daily_challenges for select to authenticated
  using (auth.uid() = user_id);

create policy user_daily_challenges_insert_own
  on public.user_daily_challenges for insert to authenticated
  with check (auth.uid() = user_id);

create policy user_daily_challenges_update_own
  on public.user_daily_challenges for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select on table public.achievements to anon, authenticated;
grant select on table public.daily_challenges to anon, authenticated;
grant insert, update on table public.daily_challenges to authenticated;
grant select, insert, update on table public.user_achievements to authenticated;
grant select, insert, update on table public.user_daily_challenges to authenticated;
