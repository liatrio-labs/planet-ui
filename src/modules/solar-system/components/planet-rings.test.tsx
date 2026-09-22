import ReactThreeTestRenderer from "@react-three/test-renderer";
import {
  DoubleSide,
  type Mesh,
  type MeshStandardMaterial,
  type RingGeometry,
} from "three";

import { PlanetRings } from "./planet-rings";

describe("PlanetRings", () => {
  it("scales the ring band with the planet radius", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <PlanetRings planetRadius={2} color="#c8b89a" />,
    );
    const mesh = renderer.scene.children[0];
    expect(mesh.type).toBe("Mesh");
    const geometry = (mesh.instance as Mesh).geometry as RingGeometry;
    expect(geometry.parameters.innerRadius).toBeCloseTo(3);
    expect(geometry.parameters.outerRadius).toBeCloseTo(4.8);
    expect(geometry.parameters.thetaSegments).toBe(96);
  });

  it("tilts the rings off the orbital plane", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <PlanetRings planetRadius={1} color="#c8b89a" />,
    );
    const mesh = renderer.scene.children[0].instance as Mesh;
    expect(mesh.rotation.x).toBeCloseTo(-Math.PI / 2.4);
  });

  it("uses a translucent, double-sided material in the given color", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <PlanetRings planetRadius={1} color="#ff0000" />,
    );
    const material = (renderer.scene.children[0].instance as Mesh)
      .material as MeshStandardMaterial;
    expect(material.color.getHexString()).toBe("ff0000");
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBeCloseTo(0.6);
    expect(material.side).toBe(DoubleSide);
    expect(material.roughness).toBeCloseTo(0.9);
  });
});
