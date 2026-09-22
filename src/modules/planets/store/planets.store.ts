import { create } from "zustand";

import type { Planet, PlanetValues } from "../models/planet";

/** Id used to focus the sun, which is not a planet and lives outside the list. */
export const SUN_ID = "sun";

type PlanetsState = {
  planets: Planet[];
  /** The body the camera is centred on: `SUN_ID`, a planet id, or none. */
  focusedBodyId: string | null;
  addPlanet: (values: PlanetValues) => Planet;
  removePlanet: (id: string) => void;
  clearPlanets: () => void;
  focusBody: (id: string | null) => void;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const usePlanetsStore = create<PlanetsState>((set) => ({
  planets: [],
  focusedBodyId: null,
  addPlanet: (values) => {
    const planet: Planet = {
      ...values,
      id: createId(),
      createdAt: Date.now(),
    };
    set((state) => ({ planets: [...state.planets, planet] }));
    return planet;
  },
  removePlanet: (id) =>
    set((state) => ({
      planets: state.planets.filter((planet) => planet.id !== id),
      focusedBodyId: state.focusedBodyId === id ? null : state.focusedBodyId,
    })),
  clearPlanets: () => set({ planets: [], focusedBodyId: null }),
  focusBody: (id) => set({ focusedBodyId: id }),
}));
