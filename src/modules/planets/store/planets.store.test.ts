import { SUN_ID, usePlanetsStore } from "./planets.store";

const values = {
  name: "Test",
  description: "",
  distanceAu: 1,
  size: 1,
  characteristics: [],
};

describe("usePlanetsStore focus", () => {
  beforeEach(() => {
    usePlanetsStore.setState({ planets: [], focusedBodyId: null });
  });

  it("starts with nothing focused", () => {
    expect(usePlanetsStore.getState().focusedBodyId).toBeNull();
  });

  it("focuses the sun and planets by id", () => {
    const planet = usePlanetsStore.getState().addPlanet(values);
    usePlanetsStore.getState().focusBody(SUN_ID);
    expect(usePlanetsStore.getState().focusedBodyId).toBe(SUN_ID);
    usePlanetsStore.getState().focusBody(planet.id);
    expect(usePlanetsStore.getState().focusedBodyId).toBe(planet.id);
  });

  it("clears focus when the focused planet is removed", () => {
    const planet = usePlanetsStore.getState().addPlanet(values);
    usePlanetsStore.getState().focusBody(planet.id);
    usePlanetsStore.getState().removePlanet(planet.id);
    expect(usePlanetsStore.getState().focusedBodyId).toBeNull();
  });

  it("keeps focus when a different planet is removed", () => {
    const kept = usePlanetsStore.getState().addPlanet(values);
    const gone = usePlanetsStore.getState().addPlanet(values);
    usePlanetsStore.getState().focusBody(kept.id);
    usePlanetsStore.getState().removePlanet(gone.id);
    expect(usePlanetsStore.getState().focusedBodyId).toBe(kept.id);
  });

  it("clears focus when all planets are cleared", () => {
    usePlanetsStore.getState().focusBody(SUN_ID);
    usePlanetsStore.getState().clearPlanets();
    expect(usePlanetsStore.getState().focusedBodyId).toBeNull();
  });
});
