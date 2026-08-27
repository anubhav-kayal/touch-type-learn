-- Practice attempts reuse lesson_attempts with a source tag.
-- lesson_id stays required for Learn; practice rows may omit it.

alter table public.lesson_attempts
  alter column lesson_id drop not null;

alter table public.lesson_attempts
  add column source text not null default 'lesson';

alter table public.lesson_attempts
  add constraint lesson_attempts_source_check
  check (source in ('lesson', 'practice'));

alter table public.lesson_attempts
  add constraint lesson_attempts_lesson_required
  check (source <> 'lesson' or lesson_id is not null);

create index lesson_attempts_user_source_created_idx
  on public.lesson_attempts (user_id, source, created_at desc);
