import type { Planet } from "../models/planet";
import {
  apoapsisDistance,
  auToSceneDistance,
  circularOrbitSpeed,
  GRAVITATIONAL_PARAMETER,
  minOrbitRadius,
  orbitalPeriodSeconds,
  periapsisDistance,
  periapsisSpeed,
  resolveOrbit,
  semiMinorAxis,
  sizeToRadius,
  startAngleFromId,
} from "./orbit";

const makePlanet = (override: Partial<Planet> = {}): Planet => ({
  id: "planet-1",
  createdAt: 0,
  name: "Kepler",
  description: "",
  distanceAu: 1,
  size: 5,
  eccentricity: 0,
  characteristics: [],
  ...override,
});

describe("orbit helpers", () => {
  it("places periapsis and apoapsis either side of the semi-major axis", () => {
    expect(periapsisDistance(10, 0.4)).toBeCloseTo(6);
    expect(apoapsisDistance(10, 0.4)).toBeCloseTo(14);
    // Their mean is the semi-major axis.
    expect((periapsisDistance(10, 0.4) + apoapsisDistance(10, 0.4)) / 2).toBeCloseTo(10);
  });

  it("collapses to a circle at e = 0", () => {
    expect(semiMinorAxis(10, 0)).toBeCloseTo(10);
    expect(periapsisSpeed(10, 0)).toBeCloseTo(circularOrbitSpeed(10));
  });

  it("needs more speed at periapsis than a circular orbit of the same a", () => {
    expect(periapsisSpeed(10, 0.5)).toBeGreaterThan(circularOrbitSpeed(10));
  });

  it("keeps the old orbital period for circular orbits", () => {
    const r = 12;
    expect(orbitalPeriodSeconds(r)).toBeCloseTo(
      (2 * Math.PI * r) / circularOrbitSpeed(r),
    );
  });
});

describe("resolveOrbit", () => {
  it("reproduces the circular orbit exactly at e = 0", () => {
    const planet = makePlanet();
    const orbit = resolveOrbit(planet);

    const expectedRadius = auToSceneDistance(planet.distanceAu);
    const angle = startAngleFromId(planet.id);

    expect(orbit.semiMajorAxis).toBeCloseTo(expectedRadius);
    expect(orbit.semiMinorAxis).toBeCloseTo(expectedRadius);
    // No focal offset: the sun is the centre.
    expect(Math.hypot(orbit.center[0], orbit.center[2])).toBe(0);

    const [px, py, pz] = orbit.periapsisPosition;
    expect(Math.hypot(px, pz)).toBeCloseTo(expectedRadius);
    expect(py).toBe(0);
    expect(px).toBeCloseTo(Math.cos(angle) * expectedRadius);
    expect(pz).toBeCloseTo(Math.sin(angle) * expectedRadius);

    const [vx, vy, vz] = orbit.periapsisVelocity;
    expect(Math.hypot(vx, vz)).toBeCloseTo(circularOrbitSpeed(expectedRadius));
    expect(vy).toBe(0);
    expect(vx).toBeCloseTo(Math.sin(angle) * circularOrbitSpeed(expectedRadius));
    expect(vz).toBeCloseTo(-Math.cos(angle) * circularOrbitSpeed(expectedRadius));
  });

  it("seeds an eccentric orbit at periapsis with the vis-viva speed", () => {
    const orbit = resolveOrbit(makePlanet({ eccentricity: 0.6 }));
    const a = auToSceneDistance(1);

    expect(orbit.semiMajorAxis).toBeCloseTo(a);
    expect(orbit.semiMinorAxis).toBeCloseTo(a * Math.sqrt(1 - 0.36));

    const [px, , pz] = orbit.periapsisPosition;
    expect(Math.hypot(px, pz)).toBeCloseTo(a * 0.4);

    const [vx, , vz] = orbit.periapsisVelocity;
    expect(Math.hypot(vx, vz)).toBeCloseTo(periapsisSpeed(a, 0.6));
    expect(Math.hypot(vx, vz)).toBeGreaterThan(circularOrbitSpeed(a));
  });

  it("puts the ellipse centre a*e away from the sun, opposite periapsis", () => {
    const orbit = resolveOrbit(makePlanet({ eccentricity: 0.5 }));
    const [cx, cy, cz] = orbit.center;
    const [px, , pz] = orbit.periapsisPosition;

    expect(cy).toBe(0);
    expect(Math.hypot(cx, cz)).toBeCloseTo(orbit.semiMajorAxis * 0.5);
    // Centre points away from periapsis.
    expect(cx * px + cz * pz).toBeLessThan(0);
  });

  it("conserves the expected specific orbital energy at periapsis", () => {
    const orbit = resolveOrbit(makePlanet({ eccentricity: 0.45 }));
    const [px, , pz] = orbit.periapsisPosition;
    const [vx, , vz] = orbit.periapsisVelocity;

    const r = Math.hypot(px, pz);
    const vSquared = vx * vx + vz * vz;
    expect(vSquared / 2 - GRAVITATIONAL_PARAMETER / r).toBeCloseTo(
      -GRAVITATIONAL_PARAMETER / (2 * orbit.semiMajorAxis),
    );
  });

  it("keeps periapsis (not just a) clear of the sun for eccentric orbits", () => {
    const orbit = resolveOrbit(
      makePlanet({ distanceAu: 0.1, size: 10, eccentricity: 0.8 }),
    );
    const [px, , pz] = orbit.periapsisPosition;
    const safe = minOrbitRadius(sizeToRadius(10));

    expect(Math.hypot(px, pz)).toBeGreaterThanOrEqual(safe - 1e-9);
    expect(Math.hypot(px, pz)).toBeCloseTo(safe);
  });

  it("launches perpendicular to the sun-planet line", () => {
    const orbit = resolveOrbit(makePlanet({ eccentricity: 0.7 }));
    const [px, , pz] = orbit.periapsisPosition;
    const [vx, , vz] = orbit.periapsisVelocity;
    expect(px * vx + pz * vz).toBeCloseTo(0);
  });

  it("clamps eccentricity into the supported range", () => {
    expect(resolveOrbit(makePlanet({ eccentricity: 5 })).eccentricity).toBe(0.8);
    expect(resolveOrbit(makePlanet({ eccentricity: -2 })).eccentricity).toBe(0);
  });

  it("treats a planet created before eccentricity existed as circular", () => {
    const legacy = makePlanet();
    delete (legacy as Partial<Planet>).eccentricity;
    expect(resolveOrbit(legacy).eccentricity).toBe(0);
  });
});
