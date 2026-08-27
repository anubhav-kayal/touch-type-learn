import { EMPTY_XP_BREAKDOWN } from "@keypath/scoring";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultsCard } from "./ResultsCard";
import type { LessonResultView } from "./ResultsCard";

const passed: LessonResultView = {
  accuracy: 1,
  wpm: 18,
  consistency: null,
  errors: 0,
  maxCombo: 12,
  stars: 3,
  isBoss: true,
  xp: {
    completion: 50,
    accuracy: 50,
    personalRecord: 0,
    boss: 100,
    total: 200,
  },
  totalXp: 200,
  level: 1,
  streakDays: 1,
};

describe("ResultsCard", () => {
  it("shows an XP ledger on a passed lesson", () => {
    render(
      <ResultsCard
        result={passed}
        passed
        nextLessonHref="/learn/w2-e-i"
        onRetry={() => undefined}
      />,
    );

    expect(screen.getByRole("heading", { name: "Boss cleared" })).toBeInTheDocument();
    expect(screen.getByTestId("xp-ledger")).toHaveTextContent("First clear");
    expect(screen.getByTestId("xp-ledger")).toHaveTextContent("Perfect accuracy");
    expect(screen.getByTestId("xp-ledger")).toHaveTextContent("Boss");
    expect(screen.getByTestId("xp-ledger")).toHaveTextContent("+200");
  });

  it("shows newly unlocked achievements once", () => {
    render(
      <ResultsCard
        result={{
          ...passed,
          unlocked: [
            {
              id: "home-row-hero",
              title: "Home Row Hero",
              description: "Pass the World 1 boss.",
              xp: 100,
            },
          ],
        }}
        passed
        nextLessonHref="/learn/w2-e-i"
        onRetry={() => undefined}
      />,
    );

    expect(screen.getByTestId("meta-unlocks")).toHaveTextContent("Home Row Hero");
    expect(screen.getByTestId("meta-unlocks")).toHaveTextContent("+100");
  });

  it("hides XP when the lesson is not passed", () => {
    render(
      <ResultsCard
        result={{
          ...passed,
          stars: 0,
          isBoss: false,
          xp: EMPTY_XP_BREAKDOWN,
          accuracy: 0.8,
        }}
        passed={false}
        nextLessonHref={null}
        onRetry={() => undefined}
      />,
    );

    expect(screen.getByRole("heading", { name: "Need 90% to continue" })).toBeInTheDocument();
    expect(screen.queryByTestId("xp-ledger")).not.toBeInTheDocument();
  });
});
