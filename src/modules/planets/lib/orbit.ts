/**
 * Maps real-world planet inputs to scene-space quantities and provides the
 * Keplerian helpers used to seed the physics simulation.
 */

/** Radius of the sun in scene units. */
export const SUN_RADIUS = 3;

/** Standard gravitational parameter (G * M) of the sun in scene units^3 / s^2. */
export const GRAVITATIONAL_PARAMETER = 180;

/**
 * Map AU to scene units with a square-root curve so 0.1 AU and 10 AU both stay
 * on screen (0.1 AU ~ 8.2, 1 AU ~ 15, 10 AU ~ 36.6 units).
 */
export const auToSceneDistance = (au: number) => 5 + Math.sqrt(au) * 10;

export const sizeToRadius = (size: number) => 0.3 + size * 0.14;

/** Speed required for a circular orbit at radius r (v = sqrt(mu / r)). */
export const circularOrbitSpeed = (r: number) =>
  Math.sqrt(GRAVITATIONAL_PARAMETER / r);

/** Seconds for one full revolution at radius r. */
export const orbitalPeriodSeconds = (r: number) =>
  (2 * Math.PI * r) / circularOrbitSpeed(r);

/** Closest safe starting distance so a planet never spawns inside the sun. */
export const minOrbitRadius = (planetRadius: number) =>
  SUN_RADIUS + planetRadius + 1;

/**
 * Deterministic starting angle derived from an id so planets do not all spawn
 * in a straight line off the sun.
 */
export const startAngleFromId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return ((hash >>> 0) % 360) * (Math.PI / 180);
};
