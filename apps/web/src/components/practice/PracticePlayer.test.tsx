import { PracticePlayer } from "@/components/practice/PracticePlayer";
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

describe("PracticePlayer", () => {
  it("asks the learner to complete more lessons when there are no weak keys", () => {
    render(<PracticePlayer />);
    expect(
      screen.getByRole("heading", { name: "Your weak keys" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/complete more learn lessons/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start drill" })).not.toBeInTheDocument();
  });
});
