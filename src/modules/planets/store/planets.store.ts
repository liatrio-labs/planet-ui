import { create } from "zustand";

import type { Planet, PlanetValues } from "../models/planet";

type PlanetsState = {
  planets: Planet[];
  addPlanet: (values: PlanetValues) => Planet;
  removePlanet: (id: string) => void;
  clearPlanets: () => void;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const usePlanetsStore = create<PlanetsState>((set) => ({
  planets: [],
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
    })),
  clearPlanets: () => set({ planets: [] }),
}));
