import { PracticePlayer } from "@/components/practice/PracticePlayer";
import { getPracticeMode } from "@keypath/curriculum";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    const mode = getPracticeMode("weak-keys");
    expect(mode).toBeDefined();
    render(<PracticePlayer mode={mode!} />);
    expect(
      screen.getByRole("heading", { name: "Your weak keys" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/complete more learn lessons/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start drill" })).not.toBeInTheDocument();
  });

  it("rejects an enormous custom paste", async () => {
    const user = userEvent.setup();
    const mode = getPracticeMode("custom");
    expect(mode).toBeDefined();
    render(<PracticePlayer mode={mode!} />);
    fireEvent.change(screen.getByRole("textbox", { name: /paste text/i }), {
      target: { value: "a".repeat(2001) },
    });
    await user.click(screen.getByRole("button", { name: "Start drill" }));
    expect(screen.getByText(/too long/i)).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /typing lesson/i })).not.toBeInTheDocument();
  });

  it("starts a custom drill from cleaned US QWERTY text", async () => {
    const user = userEvent.setup();
    const mode = getPracticeMode("custom");
    expect(mode).toBeDefined();
    render(<PracticePlayer mode={mode!} />);
    await user.type(screen.getByRole("textbox", { name: /paste text/i }), "Hello, world.");
    await user.click(screen.getByRole("button", { name: "Start drill" }));
    expect(screen.getByRole("group", { name: /typing lesson/i })).toBeInTheDocument();
  });
});
