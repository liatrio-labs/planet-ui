import ReactThreeTestRenderer from "@react-three/test-renderer";
import {
  BackSide,
  type Mesh,
  type MeshStandardMaterial,
  type SphereGeometry,
} from "three";

import { PlanetAtmosphere } from "./planet-atmosphere";

describe("PlanetAtmosphere", () => {
  it("renders a sphere slightly larger than the planet", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <PlanetAtmosphere planetRadius={2} color="#7ab8ff" opacity={0.18} />,
    );
    const mesh = renderer.scene.children[0];
    expect(mesh.type).toBe("Mesh");
    const geometry = (mesh.instance as Mesh).geometry as SphereGeometry;
    expect(geometry.parameters.radius).toBeCloseTo(2.24);
    expect(geometry.parameters.widthSegments).toBe(32);
    expect(geometry.parameters.heightSegments).toBe(32);
  });

  it("applies the given color and opacity to a back-side, non-depth-writing material", async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <PlanetAtmosphere planetRadius={1} color="#b6ff5c" opacity={0.25} />,
    );
    const material = (renderer.scene.children[0].instance as Mesh)
      .material as MeshStandardMaterial;
    expect(material.color.getHexString()).toBe("b6ff5c");
    expect(material.opacity).toBeCloseTo(0.25);
    expect(material.transparent).toBe(true);
    expect(material.side).toBe(BackSide);
    expect(material.depthWrite).toBe(false);
    expect(material.roughness).toBe(1);
  });
});
