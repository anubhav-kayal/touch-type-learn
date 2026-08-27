import { HomeView } from "@/components/home/HomeView";
import { recordGuestAttempt } from "@/lib/guest-progress";
import { getContinueTarget } from "@/lib/continue-target";
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

function continueHrefs(): string[] {
  return screen.getAllByTestId("continue-cta").map((node) => node.getAttribute("href") ?? "");
}

describe("getContinueTarget", () => {
  it("starts on orientation and moves after one star", () => {
    expect(getContinueTarget({}).href).toBe("/learn/w1-orient");
    expect(getContinueTarget({ "w1-orient": 1 }).href).toBe("/learn/w1-home-fj");
    expect(getContinueTarget({ "w1-orient": 1 }).title).toBe("F and J");
  });
});

describe("HomeView", () => {
  it("sends an empty account into the first lesson", () => {
    render(<HomeView />);
    expect(screen.getByRole("heading", { name: /find f and j/i })).toBeInTheDocument();
    expect(continueHrefs().every((href) => href === "/learn/w1-orient")).toBe(true);
  });

  it("points continue at the next lesson after one star", () => {
    recordGuestAttempt({
      lessonId: "w1-orient",
      stars: 1,
      wpm: 18,
      accuracy: 0.94,
      xpAwarded: 50,
      durationMs: 40_000,
    });
    render(<HomeView />);
    expect(screen.getByRole("heading", { name: /next: f and j/i })).toBeInTheDocument();
    expect(continueHrefs().every((href) => href === "/learn/w1-home-fj")).toBe(true);
  });
});
