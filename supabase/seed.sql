-- Generated from packages/curriculum. Do not edit by hand.
-- Keep in sync with renderCurriculumSeedSql().

insert into public.worlds (id, title, description, sort_order, status)
values
  ('world-1', 'Finger Foundations', 'Home row, the F and J bumps, and your first words.', 1, 'full'),
  ('world-2', 'Top Row', 'Reach up from the home row, one pair at a time.', 2, 'full'),
  ('world-3', 'Bottom Row', 'Finish the alphabet. Reach down, then return home.', 3, 'full'),
  ('world-4', 'Real Words', 'Common English, doubles, and awkward pairs.', 4, 'partial'),
  ('world-5', 'Sentences and Rhythm', 'Shift, capitals, and everyday punctuation.', 5, 'partial'),
  ('world-6', 'Numbers and Symbols', 'Number row, ₹, %, @, dates, and email.', 6, 'stub'),
  ('world-7', 'Speed Training', 'Speed targets from 20 WPM up, with accuracy still required.', 7, 'stub'),
  ('world-8', 'Mastery', 'Long form, prose, code, and endurance.', 8, 'stub')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status;

insert into public.lessons (id, world_id, title, sort_order, is_boss, target_accuracy, target_wpm)
values
  ('w1-orient', 'world-1', 'Find the bumps', 0, false, 0.9, null),
  ('w1-home-fj', 'world-1', 'F and J', 1, false, 0.9, null),
  ('w1-home-dk', 'world-1', 'D and K', 2, false, 0.9, null),
  ('w1-home-sl', 'world-1', 'S and L', 3, false, 0.9, null),
  ('w1-home-a-semi', 'world-1', 'A and ;', 4, false, 0.9, null),
  ('w1-home-gh', 'world-1', 'G and H', 5, false, 0.9, null),
  ('w1-home-combos', 'world-1', 'Home row mix', 6, false, 0.9, null),
  ('w1-home-words', 'world-1', 'Home row words', 7, false, 0.9, null),
  ('w1-home-boss', 'world-1', 'Home row mastery', 8, true, 0.9, null),
  ('w2-ei', 'world-2', 'E and I', 0, false, 0.9, null),
  ('w2-ru', 'world-2', 'R and U', 1, false, 0.9, null),
  ('w2-ty', 'world-2', 'T and Y', 2, false, 0.9, null),
  ('w2-wo', 'world-2', 'W and O', 3, false, 0.9, null),
  ('w2-qp', 'world-2', 'Q and P', 4, false, 0.9, null),
  ('w2-boss', 'world-2', 'Top row mastery', 5, true, 0.9, null),
  ('w3-c-comma', 'world-3', 'C and comma', 0, false, 0.9, null),
  ('w3-vm', 'world-3', 'V and M', 1, false, 0.9, null),
  ('w3-bn', 'world-3', 'B and N', 2, false, 0.9, null),
  ('w3-x-period', 'world-3', 'X and period', 3, false, 0.9, null),
  ('w3-z-slash', 'world-3', 'Z and slash', 4, false, 0.9, null),
  ('w3-boss', 'world-3', 'Alphabet mastery', 5, true, 0.9, null),
  ('w4-common', 'world-4', 'Common words', 0, false, 0.9, null),
  ('w4-double', 'world-4', 'Double letters', 1, false, 0.9, null),
  ('w4-hard-pairs', 'world-4', 'Awkward pairs', 2, false, 0.9, null),
  ('w5-shift', 'world-5', 'Shift and capitals', 0, false, 0.9, null),
  ('w5-comma-period', 'world-5', 'Comma and period', 1, false, 0.9, null),
  ('w5-sentences', 'world-5', 'Full sentences', 2, false, 0.9, null)
on conflict (id) do update set
  world_id = excluded.world_id,
  title = excluded.title,
  sort_order = excluded.sort_order,
  is_boss = excluded.is_boss,
  target_accuracy = excluded.target_accuracy,
  target_wpm = excluded.target_wpm;
