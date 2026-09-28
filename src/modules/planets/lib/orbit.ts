/**
 * Maps real-world planet inputs to scene-space quantities and provides the
 * Keplerian helpers used to seed the physics simulation.
 */

import { PLANET_ECCENTRICITY, type Planet } from "../models/planet";

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

/** Closest approach to the sun for a semi-major axis a and eccentricity e. */
export const periapsisDistance = (a: number, e: number) => a * (1 - e);

/** Furthest point from the sun for a semi-major axis a and eccentricity e. */
export const apoapsisDistance = (a: number, e: number) => a * (1 + e);

/** Semi-minor axis b = a * sqrt(1 - e^2). */
export const semiMinorAxis = (a: number, e: number) =>
  a * Math.sqrt(1 - e * e);

/**
 * Speed at periapsis from the vis-viva equation
 * (v^2 = mu * (2 / r - 1 / a) evaluated at r = a * (1 - e)).
 * Reduces to `circularOrbitSpeed(a)` when e = 0.
 */
export const periapsisSpeed = (a: number, e: number) =>
  Math.sqrt((GRAVITATIONAL_PARAMETER / a) * ((1 + e) / (1 - e)));

/** Seconds for one full revolution of an orbit with semi-major axis a. */
export const orbitalPeriodSeconds = (a: number) =>
  2 * Math.PI * Math.sqrt((a * a * a) / GRAVITATIONAL_PARAMETER);

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

export type ResolvedOrbit = {
  semiMajorAxis: number;
  semiMinorAxis: number;
  eccentricity: number;
  /** Argument of periapsis, radians, in the XZ plane. */
  argumentOfPeriapsis: number;
  /** Scene position of the periapsis (where the body is seeded). */
  periapsisPosition: [number, number, number];
  /** Velocity at periapsis, tangent to the orbit. */
  periapsisVelocity: [number, number, number];
  /** Ellipse centre = sun focus offset by a*e away from periapsis. */
  center: [number, number, number];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Single source of truth for a planet's orbit. Both the drawn path and the
 * seeded rigid body go through this, so the two can never disagree.
 */
export const resolveOrbit = (
  planet: Pick<Planet, "id" | "size" | "distanceAu" | "eccentricity">,
): ResolvedOrbit => {
  const eccentricity = clamp(
    planet.eccentricity ?? 0,
    PLANET_ECCENTRICITY.min,
    PLANET_ECCENTRICITY.max,
  );

  // Clamp the *periapsis*, not the semi-major axis: an eccentric orbit whose
  // `a` clears the sun can still dive into it at closest approach.
  const a = Math.max(
    auToSceneDistance(planet.distanceAu),
    minOrbitRadius(sizeToRadius(planet.size)) / (1 - eccentricity),
  );
  const b = semiMinorAxis(a, eccentricity);
  const rp = periapsisDistance(a, eccentricity);
  const vp = periapsisSpeed(a, eccentricity);
  const omega = startAngleFromId(planet.id);
  const cos = Math.cos(omega);
  const sin = Math.sin(omega);

  return {
    semiMajorAxis: a,
    semiMinorAxis: b,
    eccentricity,
    argumentOfPeriapsis: omega,
    periapsisPosition: [cos * rp, 0, sin * rp],
    // Tangent to the orbit (counter-clockwise when viewed from above).
    periapsisVelocity: [sin * vp, 0, -cos * vp],
    // The sun sits at a focus, so the ellipse centre is a*e toward apoapsis.
    center: [-cos * a * eccentricity, 0, -sin * a * eccentricity],
  };
};
