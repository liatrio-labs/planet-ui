import ReactThreeTestRenderer from "@react-three/test-renderer";
import { DoubleSide, type Mesh, type MeshBasicMaterial, type RingGeometry } from "three";

import { OrbitRing } from "./orbit-ring";

describe("OrbitRing", () => {
  it("renders a thin flat ring centred on the given radius", async () => {
    const renderer = await ReactThreeTestRenderer.create(<OrbitRing radius={10} />);
    const mesh = renderer.scene.children[0];
    expect(mesh.type).toBe("Mesh");

    const geometry = (mesh.instance as Mesh).geometry as RingGeometry;
    expect(geometry.parameters.innerRadius).toBeCloseTo(9.97);
    expect(geometry.parameters.outerRadius).toBeCloseTo(10.03);
    expect(geometry.parameters.thetaSegments).toBe(160);
  });

  it("lies in the XZ plane", async () => {
    const renderer = await ReactThreeTestRenderer.create(<OrbitRing radius={5} />);
    const mesh = renderer.scene.children[0].instance as Mesh;
    expect(mesh.rotation.x).toBeCloseTo(-Math.PI / 2);
  });

  it("uses a faint, double-sided material that does not write depth", async () => {
    const renderer = await ReactThreeTestRenderer.create(<OrbitRing radius={5} />);
    const material = (renderer.scene.children[0].instance as Mesh)
      .material as MeshBasicMaterial;
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBeCloseTo(0.12);
    expect(material.side).toBe(DoubleSide);
    expect(material.depthWrite).toBe(false);
    expect(material.color.getHexString()).toBe("ffffff");
  });
});
