import ReactThreeTestRenderer from "@react-three/test-renderer";
import type { Group } from "three";

import { resolveOrbit } from "~/modules/planets/lib/orbit";
import type { Planet } from "~/modules/planets/models/planet";
import {
  ellipsePathPoints,
  ORBIT_PATH_SEGMENTS,
  OrbitPath,
} from "./orbit-path";

describe("ellipsePathPoints", () => {
  it("traces a closed ellipse in the XZ plane", () => {
    const points = ellipsePathPoints(10, 6);

    expect(points).toHaveLength(ORBIT_PATH_SEGMENTS + 1);
    expect(points.every((point) => point.y === 0)).toBe(true);

    const maxX = Math.max(...points.map((point) => Math.abs(point.x)));
    const maxZ = Math.max(...points.map((point) => Math.abs(point.z)));
    expect(maxX).toBeCloseTo(10);
    expect(maxZ).toBeCloseTo(6);

    // Closed loop: last point returns to the first.
    expect(points.at(-1)!.distanceTo(points[0])).toBeCloseTo(0);
  });

  it("starts at periapsis along local +x", () => {
    const [first] = ellipsePathPoints(10, 6);
    expect(first.x).toBeCloseTo(10);
    expect(first.z).toBeCloseTo(0);
  });

  it("every point satisfies the ellipse equation", () => {
    const a = 12;
    const b = 5;
    for (const point of ellipsePathPoints(a, b, 12)) {
      expect((point.x / a) ** 2 + (point.z / b) ** 2).toBeCloseTo(1);
    }
  });

  it("degenerates to a circle when both axes match", () => {
    const radii = ellipsePathPoints(8, 8, 24).map((point) =>
      Math.hypot(point.x, point.z),
    );
    for (const radius of radii) expect(radius).toBeCloseTo(8);
  });
});

describe("OrbitPath", () => {
  it("offsets and rotates the ellipse so the sun sits on a focus", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <OrbitPath
        semiMajorAxis={10}
        semiMinorAxis={8}
        rotation={Math.PI / 3}
        center={[-2.5, 0, -4]}
      />,
    );

    const group = renderer.scene.children[0].instance as Group;
    expect(group.position.x).toBeCloseTo(-2.5);
    expect(group.position.y).toBeCloseTo(0);
    expect(group.position.z).toBeCloseTo(-4);
    // Negated: a scene angle about +Y maps to -rotation for the XZ curve.
    expect(group.rotation.y).toBeCloseTo(-Math.PI / 3);
  });

  it("draws a line through the ellipse points", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <OrbitPath
        semiMajorAxis={10}
        semiMinorAxis={8}
        rotation={0}
        center={[0, 0, 0]}
      />,
    );

    const group = renderer.scene.children[0].instance as Group;
    expect(group.children.length).toBeGreaterThan(0);
  });

  it("draws the path the body actually follows: sun on a focus, body at periapsis", async () => {
    const planet: Planet = {
      id: "eccentric-1",
      createdAt: 0,
      name: "Halley",
      description: "",
      distanceAu: 3,
      size: 4,
      eccentricity: 0.6,
      characteristics: [],
    };
    const orbit = resolveOrbit(planet);

    const renderer = await ReactThreeTestRenderer.create(
      <OrbitPath
        semiMajorAxis={orbit.semiMajorAxis}
        semiMinorAxis={orbit.semiMinorAxis}
        rotation={orbit.argumentOfPeriapsis}
        center={orbit.center}
      />,
    );
    const group = renderer.scene.children[0].instance as Group;
    group.updateMatrixWorld(true);

    // The local curve points, placed into world space by the group transform.
    const world = ellipsePathPoints(
      orbit.semiMajorAxis,
      orbit.semiMinorAxis,
    ).map((point) => point.clone().applyMatrix4(group.matrixWorld));

    // The curve starts at periapsis, exactly where the body is seeded.
    const [px, , pz] = orbit.periapsisPosition;
    expect(world[0].x).toBeCloseTo(px);
    expect(world[0].z).toBeCloseTo(pz);

    // The sun (origin) is a focus, so distances span periapsis to apoapsis.
    const distances = world.map((point) => Math.hypot(point.x, point.z));
    expect(Math.min(...distances)).toBeCloseTo(
      orbit.semiMajorAxis * (1 - orbit.eccentricity),
    );
    expect(Math.max(...distances)).toBeCloseTo(
      orbit.semiMajorAxis * (1 + orbit.eccentricity),
    );
  });
});
