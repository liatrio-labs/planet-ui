import { act, render, screen } from "@testing-library/react";

import type { Planet } from "~/modules/planets/models/planet";
import { usePlanetsStore } from "~/modules/planets/store/planets.store";
import { env } from "~/modules/shared/env.config";
import { SolarSystemPane } from "./solar-system-pane";

const makePlanet = (id: string): Planet => ({
  id,
  createdAt: 0,
  name: `Planet ${id}`,
  description: "",
  distanceAu: 1,
  size: 2,
  characteristics: [],
});

describe("SolarSystemPane", () => {
  beforeEach(() => {
    usePlanetsStore.setState({ planets: [], focusedBodyId: null });
  });

  it("renders the app name, title and the fixed sun entry", () => {
    render(<SolarSystemPane />);
    expect(screen.getByText(env.appName)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Solar System" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sun" })).toBeInTheDocument();
    expect(screen.getByText("Fixed at the center")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Bodies" })).toBeInTheDocument();
  });

  it("renders the add-planet trigger and the empty list", () => {
    render(<SolarSystemPane />);
    expect(
      screen.getByRole("button", { name: "Add Planet" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No planets yet")).toBeInTheDocument();
  });

  it("summarises zero planets", () => {
    render(<SolarSystemPane />);
    expect(screen.getByText("One sun, no planets.")).toBeInTheDocument();
  });

  it("uses the singular for one planet", () => {
    usePlanetsStore.setState({ planets: [makePlanet("a")] });
    render(<SolarSystemPane />);
    expect(screen.getByText("One sun, 1 planet.")).toBeInTheDocument();
  });

  it("uses the plural for several planets and lists them", () => {
    usePlanetsStore.setState({
      planets: [makePlanet("a"), makePlanet("b"), makePlanet("c")],
    });
    render(<SolarSystemPane />);
    expect(screen.getByText("One sun, 3 planets.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("updates the summary when a planet is added to the store", () => {
    render(<SolarSystemPane />);
    act(() => {
      usePlanetsStore.getState().addPlanet({
        name: "New",
        description: "",
        distanceAu: 1,
        size: 1,
        characteristics: [],
      });
    });
    expect(screen.getByText("One sun, 1 planet.")).toBeInTheDocument();
  });
});
