import type { Entity } from "~/modules/shared/models/entity";
import type { PlanetCharacteristic } from "./planet-characteristic";

/**
 * Semi-major axis of the orbit in astronomical units (1 AU = Earth's orbit).
 * For a circular orbit (eccentricity 0) this is simply the orbit radius; for an
 * eccentric orbit it is the average of the periapsis and apoapsis distances.
 */
export const PLANET_DISTANCE_AU = { min: 0.1, max: 10, step: 0.1 } as const;

export const PLANET_SIZE = { min: 1, max: 10, step: 1 } as const;

/**
 * Orbital eccentricity: 0 is a perfect circle, higher values stretch the orbit
 * into an ellipse. Capped below 1 (0.8) so the fixed physics timestep stays
 * accurate through the fast periapsis pass.
 */
export const PLANET_ECCENTRICITY = { min: 0, max: 0.8, step: 0.05 } as const;

export type PlanetValues = {
  name: string;
  description: string;
  distanceAu: number;
  size: number;
  eccentricity: number;
  characteristics: PlanetCharacteristic[];
};

export type Planet = Entity & PlanetValues;
