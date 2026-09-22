import ReactThreeTestRenderer from "@react-three/test-renderer";
import { forwardRef, useImperativeHandle, type ReactNode } from "react";
import type { Mesh, MeshStandardMaterial, SphereGeometry } from "three";

import {
  auToSceneDistance,
  circularOrbitSpeed,
  GRAVITATIONAL_PARAMETER,
  minOrbitRadius,
  sizeToRadius,
  startAngleFromId,
} from "~/modules/planets/lib/orbit";
import { derivePlanetAppearance } from "~/modules/planets/lib/planet-appearance";
import type { Planet } from "~/modules/planets/models/planet";
import { PlanetBody } from "./planet-body";

type Vec3 = { x: number; y: number; z: number };

// A minimal stand-in for a Rapier rigid body so the gravity step can be
// exercised without loading the physics WASM.
const fakeBody = {
  position: { x: 10, y: 0, z: 0 } as Vec3,
  translation() {
    return this.position;
  },
  mass: vi.fn(() => 5),
  resetForces: vi.fn(),
  addForce: vi.fn(),
};

let physicsStep: (() => void) | null = null;
const rigidBodyProps = vi.fn();
const colliderProps = vi.fn();
const labelProps = vi.fn();

vi.mock("@react-three/rapier", () => ({
  RigidBody: forwardRef<unknown, { children: ReactNode }>(
    ({ children, ...props }, ref) => {
      rigidBodyProps(props);
      useImperativeHandle(ref, () => fakeBody);
      return <group name="rigid-body">{children}</group>;
    },
  ),
  BallCollider: (props: { args: [number]; mass: number }) => {
    colliderProps(props);
    return <group name="ball-collider" />;
  },
  useBeforePhysicsStep: (callback: () => void) => {
    physicsStep = callback;
  },
}));

vi.mock("./planet-label", () => ({
  PlanetLabel: (props: { name: string; planetRadius: number }) => {
    labelProps(props);
    return <group name="planet-label" />;
  },
}));

const basePlanet: Planet = {
  id: "planet-1",
  createdAt: 0,
  name: "Kepler",
  description: "",
  distanceAu: 1,
  size: 5,
  characteristics: ["rocky"],
};

const create = (override: Partial<Planet> = {}) =>
  ReactThreeTestRenderer.create(
    <PlanetBody planet={{ ...basePlanet, ...override }} />,
  );

const findNamed = (
  renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>,
  name: string,
) => renderer.scene.findAll((node) => node.instance.name === name);

describe("PlanetBody", () => {
  beforeEach(() => {
    physicsStep = null;
    rigidBodyProps.mockClear();
    colliderProps.mockClear();
    labelProps.mockClear();
    fakeBody.mass.mockClear();
    fakeBody.resetForces.mockClear();
    fakeBody.addForce.mockClear();
    fakeBody.position = { x: 10, y: 0, z: 0 };
  });

  it("seeds a dynamic, undamped rigid body on a circular orbit", async () => {
    await create();

    const radius = sizeToRadius(basePlanet.size);
    const orbitRadius = Math.max(
      auToSceneDistance(basePlanet.distanceAu),
      minOrbitRadius(radius),
    );
    const angle = startAngleFromId(basePlanet.id);
    const speed = circularOrbitSpeed(orbitRadius);

    expect(rigidBodyProps).toHaveBeenCalledTimes(1);
    const props = rigidBodyProps.mock.calls[0][0];
    expect(props).toMatchObject({
      type: "dynamic",
      colliders: false,
      linearDamping: 0,
      angularDamping: 0,
      canSleep: false,
    });

    const [px, py, pz] = props.position;
    expect(px).toBeCloseTo(Math.cos(angle) * orbitRadius);
    expect(py).toBe(0);
    expect(pz).toBeCloseTo(Math.sin(angle) * orbitRadius);

    const [vx, vy, vz] = props.linearVelocity;
    expect(vx).toBeCloseTo(Math.sin(angle) * speed);
    expect(vy).toBe(0);
    expect(vz).toBeCloseTo(-Math.cos(angle) * speed);

    // Velocity is tangent to the orbit: perpendicular to the position vector.
    expect(px * vx + pz * vz).toBeCloseTo(0);
    expect(Math.hypot(vx, vz)).toBeCloseTo(speed);
  });

  it("spins faster for larger planets", async () => {
    await create({ size: 2 });
    await create({ size: 10 });
    const [small, large] = rigidBodyProps.mock.calls.map(
      (call) => call[0].angularVelocity[1],
    );
    expect(small).toBeCloseTo(0.5);
    expect(large).toBeCloseTo(0.9);
  });

  it("never spawns inside the sun even at tiny distances", async () => {
    await create({ distanceAu: 0.0001, size: 10 });
    const [px, , pz] = rigidBodyProps.mock.calls[0][0].position;
    const radius = sizeToRadius(10);
    expect(Math.hypot(px, pz)).toBeCloseTo(minOrbitRadius(radius));
  });

  it("uses a ball collider whose radius follows size and whose mass is the size", async () => {
    await create({ size: 3 });
    expect(colliderProps).toHaveBeenCalledWith({
      args: [sizeToRadius(3)],
      mass: 3,
    });
  });

  it("renders the surface mesh with the derived appearance", async () => {
    const renderer = await create({ characteristics: ["volcanic", "glowing"] });
    const appearance = derivePlanetAppearance(["volcanic", "glowing"]);
    const radius = sizeToRadius(basePlanet.size);

    const surface = renderer.scene
      .findAllByType("Mesh")
      .map((node) => node.instance as Mesh)
      .find(
        (mesh) =>
          Math.abs((mesh.geometry as SphereGeometry).parameters.radius - radius) <
          1e-6,
      );
    expect(surface).toBeDefined();
    expect(surface!.castShadow).toBe(true);
    expect(surface!.receiveShadow).toBe(true);

    const material = surface!.material as MeshStandardMaterial;
    expect(`#${material.color.getHexString()}`).toBe(appearance.color);
    expect(`#${material.emissive.getHexString()}`).toBe(appearance.emissive);
    expect(material.emissiveIntensity).toBeCloseTo(appearance.emissiveIntensity);
    expect(material.roughness).toBeCloseTo(appearance.roughness);
    expect(material.metalness).toBeCloseTo(appearance.metalness);
  });

  it("adds an atmosphere shell only when the appearance has one", async () => {
    const bare = await create({ characteristics: ["rocky"] });
    const withAtmosphere = await create({ characteristics: ["oceans"] });

    const radius = sizeToRadius(basePlanet.size);
    const shells = (renderer: typeof bare) =>
      renderer.scene
        .findAllByType("Mesh")
        .map((node) => node.instance as Mesh)
        .filter(
          (mesh) =>
            Math.abs(
              (mesh.geometry as SphereGeometry).parameters.radius - radius * 1.12,
            ) < 1e-6,
        );

    expect(shells(bare)).toHaveLength(0);
    expect(shells(withAtmosphere)).toHaveLength(1);
  });

  it("adds rings only for ringed planets", async () => {
    const plain = await create({ characteristics: ["rocky"] });
    const ringed = await create({ characteristics: ["rocky", "ringed"] });

    const rings = (renderer: typeof plain) =>
      renderer.scene
        .findAllByType("Mesh")
        .filter((node) => (node.instance as Mesh).geometry.type === "RingGeometry");

    expect(rings(plain)).toHaveLength(0);
    expect(rings(ringed)).toHaveLength(1);
  });

  it("labels the planet with its name above the surface", async () => {
    await create({ name: "Nova", size: 4 });
    expect(labelProps).toHaveBeenCalledWith({
      name: "Nova",
      planetRadius: sizeToRadius(4),
    });
  });

  it("pulls the body toward the sun with a = mu / r^2 each physics step", async () => {
    await create();
    expect(physicsStep).not.toBeNull();

    fakeBody.position = { x: 0, y: 0, z: 6 };
    physicsStep!();

    expect(fakeBody.resetForces).toHaveBeenCalledWith(true);
    expect(fakeBody.addForce).toHaveBeenCalledTimes(1);
    const [force, wake] = fakeBody.addForce.mock.calls[0];
    const expectedMagnitude = (GRAVITATIONAL_PARAMETER / 36) * 5;
    expect(force.x).toBeCloseTo(0);
    expect(force.y).toBeCloseTo(0);
    expect(force.z).toBeCloseTo(-expectedMagnitude);
    expect(wake).toBe(true);
  });

  it("points the force along the position vector for off-axis positions", async () => {
    await create();
    fakeBody.position = { x: 3, y: 0, z: 4 };
    physicsStep!();

    const [force] = fakeBody.addForce.mock.calls[0];
    const magnitude = (GRAVITATIONAL_PARAMETER / 25) * 5;
    expect(force.x).toBeCloseTo(-(3 / 5) * magnitude);
    expect(force.z).toBeCloseTo(-(4 / 5) * magnitude);
  });

  it("skips the gravity step when the body sits on the sun's centre", async () => {
    await create();
    fakeBody.position = { x: 0, y: 0, z: 0 };
    physicsStep!();
    expect(fakeBody.resetForces).not.toHaveBeenCalled();
    expect(fakeBody.addForce).not.toHaveBeenCalled();
  });
});
