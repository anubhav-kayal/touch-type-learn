import { CourseMap } from "@/components/learn/CourseMap";
import { getWorlds } from "@keypath/curriculum";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("CourseMap", () => {
  it("unlocks the first lesson and locks the next", () => {
    render(<CourseMap worlds={getWorlds()} stars={{}} />);

    const current = screen.getByRole("link", { name: /find the bumps/i });
    expect(current).toHaveAttribute("href", "/learn/w1-orient");
    expect(current).toHaveAttribute("data-status", "current");

    expect(screen.getByText("F and J").closest("[data-status]")).toHaveAttribute(
      "data-status",
      "locked",
    );
  });

  it("unlocks the next lesson after one star", () => {
    render(<CourseMap worlds={getWorlds()} stars={{ "w1-orient": 1 }} />);

    expect(screen.getByRole("link", { name: /f and j/i })).toHaveAttribute(
      "href",
      "/learn/w1-home-fj",
    );
  });
});
