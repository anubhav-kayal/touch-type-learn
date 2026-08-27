import { WordRainView } from "@/components/play/WordRainView";
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

describe("WordRainView", () => {
  it("offers a start into Word Rain", () => {
    render(<WordRainView />);
    expect(screen.getByRole("heading", { name: "Word Rain" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start rain" })).toBeInTheDocument();
  });
});
