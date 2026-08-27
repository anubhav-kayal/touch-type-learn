import { StatsView } from "@/components/stats/StatsView";
import { recordGuestAttempt } from "@/lib/guest-progress";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => memory.clear(),
    },
  });
});

describe("StatsView", () => {
  it("sends an empty account back to Learn", () => {
    render(<StatsView />);
    expect(screen.getByRole("heading", { name: /no sessions yet/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue learning/i })).toHaveAttribute(
      "href",
      "/learn/w1-orient",
    );
    expect(screen.queryByTestId("stats-trend")).not.toBeInTheDocument();
  });

  it("shows attempt totals after one lesson", () => {
    recordGuestAttempt({
      lessonId: "w1-orient",
      stars: 1,
      wpm: 22,
      accuracy: 0.95,
      xpAwarded: 50,
      durationMs: 60_000,
      keyStats: {
        f: { key: "f", attempts: 12, correct: 11, errors: 1, averageLatencyMs: 220 },
      },
    });
    render(<StatsView />);
    expect(screen.getAllByText("22").length).toBeGreaterThan(0);
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByTestId("stats-trend")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "F" })).toBeInTheDocument();
    expect(screen.getByTestId("achievements")).toHaveTextContent("First star");
  });
});
