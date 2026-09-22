import ReactThreeTestRenderer from "@react-three/test-renderer";
import type { ReactNode } from "react";
import type { AmbientLight } from "three";

import {
  auToSceneDistance,
  minOrbitRadius,
  sizeToRadius,
} from "~/modules/planets/lib/orbit";
import type { Planet } from "~/modules/planets/models/planet";
import { usePlanetsStore } from "~/modules/planets/store/planets.store";
import { SolarSystemScene } from "./solar-system-scene";

const physicsProps = vi.fn();
const orbitControlsProps = vi.fn();
const orbitRingProps = vi.fn();
const planetBodyProps = vi.fn();

vi.mock("@react-three/rapier", () => ({
  Physics: ({ children, ...props }: { children: ReactNode }) => {
    physicsProps(props);
    return <group name="physics">{children}</group>;
  },
}));

vi.mock("@react-three/drei", () => ({
  OrbitControls: (props: Record<string, unknown>) => {
    orbitControlsProps(props);
    return <group name="orbit-controls" />;
  },
}));

vi.mock("./space-background", () => ({
  SpaceBackground: () => <group name="space-background" />,
}));

vi.mock("./sun", () => ({
  Sun: () => <group name="sun" />,
}));

vi.mock("./orbit-ring", () => ({
  OrbitRing: (props: { radius: number }) => {
    orbitRingProps(props);
    return <group name="orbit-ring" />;
  },
}));

vi.mock("./planet-body", () => ({
  PlanetBody: (props: { planet: Planet }) => {
    planetBodyProps(props);
    return <group name="planet-body" />;
  },
}));

const makePlanet = (id: string, distanceAu: number, size: number): Planet => ({
  id,
  createdAt: 0,
  name: id,
  description: "",
  distanceAu,
  size,
  characteristics: [],
});

const findNamed = (
  renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>,
  name: string,
) => renderer.scene.findAll((node) => node.instance.name === name);

describe("SolarSystemScene", () => {
  beforeEach(() => {
    usePlanetsStore.setState({ planets: [] });
    physicsProps.mockClear();
    orbitControlsProps.mockClear();
    orbitRingProps.mockClear();
    planetBodyProps.mockClear();
  });

  it("always renders the background, ambient light, sun and controls", async () => {
    const renderer = await ReactThreeTestRenderer.create(<SolarSystemScene />);
    expect(findNamed(renderer, "space-background")).toHaveLength(1);
    expect(findNamed(renderer, "sun")).toHaveLength(1);
    expect(findNamed(renderer, "orbit-controls")).toHaveLength(1);

    const lights = renderer.scene.findAllByType("AmbientLight");
    expect(lights).toHaveLength(1);
    expect((lights[0].instance as AmbientLight).intensity).toBeCloseTo(0.35);
  });

  it("disables world gravity so only the sun's pull acts on planets", async () => {
    await ReactThreeTestRenderer.create(<SolarSystemScene />);
    expect(physicsProps).toHaveBeenCalledWith(
      expect.objectContaining({ gravity: [0, 0, 0] }),
    );
  });

  it("configures orbit controls to keep the camera in bounds", async () => {
    await ReactThreeTestRenderer.create(<SolarSystemScene />);
    expect(orbitControlsProps).toHaveBeenCalledWith(
      expect.objectContaining({
        makeDefault: true,
        enablePan: false,
        minDistance: 8,
        maxDistance: 260,
        maxPolarAngle: Math.PI * 0.85,
      }),
    );
  });

  it("renders nothing planet-related when the store is empty", async () => {
    const renderer = await ReactThreeTestRenderer.create(<SolarSystemScene />);
    expect(findNamed(renderer, "orbit-ring")).toHaveLength(0);
    expect(findNamed(renderer, "planet-body")).toHaveLength(0);
  });

  it("renders one orbit ring and one body per planet, bodies inside physics", async () => {
    const planets = [makePlanet("a", 1, 3), makePlanet("b", 4, 8)];
    usePlanetsStore.setState({ planets });
    const renderer = await ReactThreeTestRenderer.create(<SolarSystemScene />);

    expect(findNamed(renderer, "orbit-ring")).toHaveLength(2);
    expect(findNamed(renderer, "planet-body")).toHaveLength(2);

    const physics = findNamed(renderer, "physics")[0];
    expect(physics.findAll((node) => node.instance.name === "planet-body")).toHaveLength(2);
    expect(physics.findAll((node) => node.instance.name === "orbit-ring")).toHaveLength(0);

    // The mock may be invoked more than once per planet across React renders,
    // so compare the distinct planets that were handed to it.
    const seen = new Map<string, Planet>(
      planetBodyProps.mock.calls.map((call) => [call[0].planet.id, call[0].planet]),
    );
    expect([...seen.values()]).toEqual(planets);
  });

  it("matches each orbit ring radius to the body's actual orbit", async () => {
    usePlanetsStore.setState({
      planets: [makePlanet("far", 4, 2), makePlanet("near", 0.0001, 10)],
    });
    await ReactThreeTestRenderer.create(<SolarSystemScene />);

    const radii = orbitRingProps.mock.calls.map((call) => call[0].radius);
    expect(radii[0]).toBeCloseTo(auToSceneDistance(4));
    // Too close to the sun: clamped to the minimum safe orbit.
    expect(radii[1]).toBeCloseTo(minOrbitRadius(sizeToRadius(10)));
  });
});
