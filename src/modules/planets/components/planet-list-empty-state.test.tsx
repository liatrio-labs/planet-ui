import { render, screen } from "@testing-library/react";

import { PlanetListEmptyState } from "./planet-list-empty-state";

describe("PlanetListEmptyState", () => {
  it("renders the empty headline and hint", () => {
    render(<PlanetListEmptyState />);
    expect(screen.getByText("No planets yet")).toBeInTheDocument();
    expect(
      screen.getByText("Your sun is lonely. Add a planet to set it in orbit."),
    ).toBeInTheDocument();
  });

  it("renders an icon", () => {
    const { container } = render(<PlanetListEmptyState />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
