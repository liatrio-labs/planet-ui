import type { Entity } from "~/modules/shared/models/entity";
import type { PlanetCharacteristic } from "./planet-characteristic";

/** Distance from the sun in astronomical units (1 AU = Earth's orbit). */
export const PLANET_DISTANCE_AU = { min: 0.1, max: 10, step: 0.1 } as const;

export const PLANET_SIZE = { min: 1, max: 10, step: 1 } as const;

export type PlanetValues = {
  name: string;
  description: string;
  distanceAu: number;
  size: number;
  characteristics: PlanetCharacteristic[];
};

export type Planet = Entity & PlanetValues;

export const defaultPlanetFormValues: PlanetValues = {
  name: "",
  description: "",
  // Intentionally empty so the number input starts blank.
  distanceAu: undefined as unknown as number,
  size: 4,
  characteristics: [],
};
