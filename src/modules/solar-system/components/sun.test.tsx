import ReactThreeTestRenderer from "@react-three/test-renderer";
import type { ReactNode } from "react";
import type {
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
} from "three";

import { SUN_RADIUS } from "~/modules/planets/lib/orbit";
import { Sun } from "./sun";

type FrameCallback = (state: unknown, delta: number) => void;
let frameCallback: FrameCallback | null = null;
const colliderProps = vi.fn();

vi.mock("@react-three/fiber", async () => {
  const actual =
    await vi.importActual<typeof import("@react-three/fiber")>(
      "@react-three/fiber",
    );
  return {
    ...actual,
    useFrame: (callback: FrameCallback) => {
      frameCallback = callback;
    },
  };
});

vi.mock("@react-three/rapier", () => ({
  RigidBody: ({
    children,
    ...props
  }: {
    children: ReactNode;
    type: string;
  }) => (
    <group name="rigid-body" userData={props}>
      {children}
    </group>
  ),
  BallCollider: (props: { args: [number] }) => {
    colliderProps(props);
    return <group name="ball-collider" />;
  },
}));

const meshes = (renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>) =>
  renderer.scene.findAllByType("Mesh").map((node) => node.instance as Mesh);

describe("Sun", () => {
  beforeEach(() => {
    frameCallback = null;
    colliderProps.mockClear();
  });

  it("is a fixed rigid body with a collider matching the sun radius", async () => {
    const renderer = await ReactThreeTestRenderer.create(<Sun />);
    const body = renderer.scene.findAll((n) => n.instance.name === "rigid-body");
    expect(body).toHaveLength(1);
    expect(body[0].instance.userData).toMatchObject({
      type: "fixed",
      colliders: false,
    });
    expect(colliderProps).toHaveBeenCalledWith({ args: [SUN_RADIUS] });
  });

  it("renders an emissive surface sphere at SUN_RADIUS", async () => {
    const renderer = await ReactThreeTestRenderer.create(<Sun />);
    const surface = meshes(renderer).find(
      (mesh) => (mesh.geometry as SphereGeometry).parameters.radius === SUN_RADIUS,
    );
    expect(surface).toBeDefined();
    const material = surface!.material as MeshStandardMaterial;
    expect(material.color.getHexString()).toBe("ffb347");
    expect(material.emissive.getHexString()).toBe("ff8a00");
    expect(material.emissiveIntensity).toBeCloseTo(2.2);
    expect(material.toneMapped).toBe(false);
  });

  it("renders a translucent corona halo around the surface", async () => {
    const renderer = await ReactThreeTestRenderer.create(<Sun />);
    const halo = meshes(renderer).find(
      (mesh) =>
        Math.abs(
          (mesh.geometry as SphereGeometry).parameters.radius - SUN_RADIUS * 1.25,
        ) < 1e-6,
    );
    expect(halo).toBeDefined();
    const material = halo!.material as MeshBasicMaterial;
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBeCloseTo(0.12);
    expect(material.depthWrite).toBe(false);
  });

  it("emits a warm point light with no distance falloff", async () => {
    const renderer = await ReactThreeTestRenderer.create(<Sun />);
    const lights = renderer.scene.findAllByType("PointLight");
    expect(lights).toHaveLength(1);
    const light = lights[0].instance as PointLight;
    expect(light.intensity).toBeCloseTo(3.5);
    expect(light.decay).toBe(0);
    expect(light.color.getHexString()).toBe("fff1d6");
  });

  it("slowly rotates the surface every frame", async () => {
    const renderer = await ReactThreeTestRenderer.create(<Sun />);
    const surface = meshes(renderer).find(
      (mesh) => (mesh.geometry as SphereGeometry).parameters.radius === SUN_RADIUS,
    )!;
    expect(frameCallback).not.toBeNull();
    expect(surface.rotation.y).toBe(0);

    frameCallback!({}, 2);
    expect(surface.rotation.y).toBeCloseTo(0.1);

    frameCallback!({}, 1);
    expect(surface.rotation.y).toBeCloseTo(0.15);
  });
});
