import { PracticeHub } from "@/components/practice/PracticeHub";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("PracticeHub", () => {
  it("lists practice modes besides Learn", () => {
    render(<PracticeHub />);
    expect(screen.getByRole("heading", { name: "Extra mileage" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /weak keys/i })).toHaveAttribute(
      "href",
      "/practice/weak-keys",
    );
    expect(screen.getByRole("link", { name: /accuracy/i })).toHaveAttribute(
      "href",
      "/practice/accuracy",
    );
    expect(screen.getByRole("link", { name: /speed/i })).toHaveAttribute("href", "/practice/speed");
    expect(screen.getByRole("link", { name: /common words/i })).toHaveAttribute(
      "href",
      "/practice/common-words",
    );
    expect(screen.getByRole("link", { name: /punctuation/i })).toHaveAttribute(
      "href",
      "/practice/punctuation",
    );
    expect(screen.getByRole("link", { name: /numbers/i })).toHaveAttribute(
      "href",
      "/practice/numbers",
    );
    expect(screen.getByRole("link", { name: /custom text/i })).toHaveAttribute(
      "href",
      "/practice/custom",
    );
  });
});
