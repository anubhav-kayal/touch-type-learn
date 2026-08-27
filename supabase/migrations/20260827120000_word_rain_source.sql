-- Word Rain reuses lesson_attempts with source = 'word-rain'.

alter table public.lesson_attempts
  drop constraint if exists lesson_attempts_source_check;

alter table public.lesson_attempts
  add constraint lesson_attempts_source_check
  check (source in ('lesson', 'practice', 'word-rain'));
