import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Planet } from "../models/planet";
import { usePlanetsStore } from "../store/planets.store";
import { PlanetList } from "./planet-list";

const makePlanet = (id: string, name: string): Planet => ({
  id,
  createdAt: 0,
  name,
  description: "",
  distanceAu: 1,
  size: 3,
  characteristics: [],
});

describe("PlanetList", () => {
  beforeEach(() => {
    usePlanetsStore.setState({ planets: [], focusedBodyId: null });
  });

  it("renders the empty state when there are no planets", () => {
    render(<PlanetList />);
    expect(screen.getByText("No planets yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders a list item per planet from the store", () => {
    usePlanetsStore.setState({
      planets: [makePlanet("a", "Alpha"), makePlanet("b", "Beta")],
    });
    render(<PlanetList />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Beta" })).toBeInTheDocument();
  });

  it("removes a planet from the store when its remove button is clicked", async () => {
    const user = userEvent.setup();
    usePlanetsStore.setState({
      planets: [makePlanet("a", "Alpha"), makePlanet("b", "Beta")],
    });
    render(<PlanetList />);

    await user.click(screen.getByRole("button", { name: "Remove Alpha" }));

    expect(usePlanetsStore.getState().planets.map((p) => p.id)).toEqual(["b"]);
    expect(
      screen.queryByRole("heading", { name: "Alpha" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Beta" })).toBeInTheDocument();
  });

  it("falls back to the empty state once the last planet is removed", async () => {
    const user = userEvent.setup();
    usePlanetsStore.setState({ planets: [makePlanet("a", "Alpha")] });
    render(<PlanetList />);
    await user.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(screen.getByText("No planets yet")).toBeInTheDocument();
  });
});

describe("PlanetList focus", () => {
  beforeEach(() => {
    usePlanetsStore.setState({ planets: [], focusedBodyId: null });
  });

  it("focuses a planet in the store when its item is clicked", async () => {
    const user = userEvent.setup();
    usePlanetsStore.setState({
      planets: [makePlanet("a", "Alpha"), makePlanet("b", "Beta")],
    });
    render(<PlanetList />);

    await user.click(screen.getByRole("button", { name: "Focus camera on Beta" }));

    expect(usePlanetsStore.getState().focusedBodyId).toBe("b");
    expect(
      screen.getByRole("button", { name: "Focus camera on Beta" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Focus camera on Alpha" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
