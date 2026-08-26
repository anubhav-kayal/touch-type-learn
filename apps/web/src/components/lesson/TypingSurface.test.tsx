import { TypingSurface } from "@/components/lesson/TypingSurface";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("TypingSurface", () => {
  it("renders the prompt and highlights the target key", () => {
    render(
      <TypingSurface prompt="asdf jkl;" inputMode="forced-correction" onComplete={vi.fn()} />,
    );

    expect(screen.getByTestId("typing-prompt").textContent).toContain("a");
    const target = document.querySelector('[data-key="a"]');
    expect(target).toHaveAttribute("data-state", "target");
  });

  it("marks a wrong character without advancing", async () => {
    const user = userEvent.setup();
    render(
      <TypingSurface prompt="asdf" inputMode="forced-correction" onComplete={vi.fn()} />,
    );

    await user.click(screen.getByTestId("typing-surface"));
    await user.keyboard("x");

    expect(screen.getByTestId("typing-prompt").querySelector('[data-status="incorrect"]')).not.toBeNull();
    expect(document.querySelector('[data-key="a"]')).toHaveAttribute("data-state", "incorrect");
    expect(screen.getByTestId("finger-hint")).toHaveTextContent(/backspace/i);
  });

  it("calls onComplete after a correct run", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <TypingSurface prompt="as" inputMode="forced-correction" onComplete={onComplete} />,
    );

    await user.click(screen.getByTestId("typing-surface"));
    await user.keyboard("as");

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0]?.[0].isComplete).toBe(true);
    expect(onComplete.mock.calls[0]?.[0].accuracy).toBe(1);
  });
});
