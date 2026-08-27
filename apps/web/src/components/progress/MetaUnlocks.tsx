import { XP, type AchievementDef } from "@keypath/scoring";

export function MetaUnlocks({
  unlocked,
  dailyJustCompleted,
}: {
  unlocked: readonly AchievementDef[];
  dailyJustCompleted: boolean;
}) {
  if (unlocked.length === 0 && !dailyJustCompleted) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-keycap px-5 py-4 font-mono" data-testid="meta-unlocks">
      <p className="text-xs tracking-[0.18em] text-legend uppercase">Unlocked</p>
      <ul className="mt-3 flex flex-col gap-1 text-sm text-ink">
        {unlocked.map((row) => (
          <li key={row.id} className="flex justify-between gap-4">
            <span>{row.title}</span>
            <span>+{row.xp}</span>
          </li>
        ))}
        {dailyJustCompleted ? (
          <li className="flex justify-between gap-4">
            <span>Daily challenge</span>
            <span>+{XP.dailyChallenge}</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
