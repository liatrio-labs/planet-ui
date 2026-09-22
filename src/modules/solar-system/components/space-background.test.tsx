import ReactThreeTestRenderer from "@react-three/test-renderer";
import { Color, type Scene } from "three";

import { SpaceBackground } from "./space-background";

const starsProps = vi.fn();

vi.mock("@react-three/drei", () => ({
  Stars: (props: Record<string, unknown>) => {
    starsProps(props);
    return <group name="stars" />;
  },
}));

describe("SpaceBackground", () => {
  beforeEach(() => {
    starsProps.mockClear();
  });

  it("paints the scene background near-black", async () => {
    const renderer = await ReactThreeTestRenderer.create(<SpaceBackground />);
    const background = (renderer.scene.instance as Scene).background as Color;
    expect(background).toBeInstanceOf(Color);
    expect(background.getHexString()).toBe("02020a");
  });

  it("renders a dense, desaturated, slowly drifting star field", async () => {
    const renderer = await ReactThreeTestRenderer.create(<SpaceBackground />);
    expect(renderer.scene.findAll((n) => n.instance.name === "stars")).toHaveLength(1);
    expect(starsProps).toHaveBeenCalledWith(
      expect.objectContaining({
        radius: 300,
        depth: 80,
        count: 6000,
        factor: 4,
        saturation: 0,
        fade: true,
        speed: 0.4,
      }),
    );
  });
});
