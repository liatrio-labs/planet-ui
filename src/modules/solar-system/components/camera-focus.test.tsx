import ReactThreeTestRenderer from "@react-three/test-renderer";
import { Vector3 } from "three";

import { SUN_ID, usePlanetsStore } from "~/modules/planets/store/planets.store";
import { clearBodyRegistry, registerBody } from "../lib/body-registry";
import { CameraFocus } from "./camera-focus";

type FrameCallback = (state: unknown, delta: number) => void;
let frameCallback: FrameCallback | null = null;

const camera = { position: new Vector3(0, 42, 78) };
const controls = { target: new Vector3(), update: vi.fn() };

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
    useThree: (selector: (state: unknown) => unknown) =>
      selector({ camera, controls }),
  };
});

/** Run enough frames for the exponential glide to converge. */
const settle = () => {
  for (let i = 0; i < 60; i += 1) frameCallback!({}, 1 / 10);
};

describe("CameraFocus", () => {
  beforeEach(() => {
    frameCallback = null;
    clearBodyRegistry();
    usePlanetsStore.setState({ planets: [], focusedBodyId: null });
    camera.position.set(0, 42, 78);
    controls.target.set(0, 0, 0);
    controls.update.mockClear();
  });

  it("leaves the camera alone when nothing is focused", async () => {
    await ReactThreeTestRenderer.create(<CameraFocus />);
    controls.target.set(5, 0, 0);
    frameCallback!({}, 0.1);
    expect(controls.target.x).toBe(5);
    expect(controls.update).not.toHaveBeenCalled();
  });

  it("glides the target onto a focused planet and carries the camera with it", async () => {
    registerBody("p", () => ({ x: 20, y: 0, z: 10 }));
    usePlanetsStore.setState({ focusedBodyId: "p" });
    await ReactThreeTestRenderer.create(<CameraFocus />);

    const offset = camera.position.clone().sub(controls.target);
    frameCallback!({}, 0.1);
    // Smoothed: moved toward the target, but not all the way.
    expect(controls.target.x).toBeGreaterThan(0);
    expect(controls.target.x).toBeLessThan(20);
    expect(controls.update).toHaveBeenCalled();

    settle();
    expect(controls.target.x).toBeCloseTo(20, 3);
    expect(controls.target.z).toBeCloseTo(10, 3);
    // Zoom and angle are preserved: camera keeps its offset from the target.
    expect(
      camera.position.clone().sub(controls.target).distanceTo(offset),
    ).toBeCloseTo(0, 3);
  });

  it("follows a body as it moves", async () => {
    const position = { x: 10, y: 0, z: 0 };
    registerBody("p", () => position);
    usePlanetsStore.setState({ focusedBodyId: "p" });
    await ReactThreeTestRenderer.create(<CameraFocus />);
    settle();
    expect(controls.target.x).toBeCloseTo(10, 3);

    position.x = 0;
    position.z = 10;
    settle();
    expect(controls.target.x).toBeCloseTo(0, 3);
    expect(controls.target.z).toBeCloseTo(10, 3);
  });

  it("returns to the origin when the sun is focused", async () => {
    usePlanetsStore.setState({ focusedBodyId: SUN_ID });
    await ReactThreeTestRenderer.create(<CameraFocus />);
    controls.target.set(15, 0, 15);
    settle();
    expect(controls.target.length()).toBeCloseTo(0, 3);
  });

  it("does nothing when the focused body has not registered yet", async () => {
    usePlanetsStore.setState({ focusedBodyId: "missing" });
    await ReactThreeTestRenderer.create(<CameraFocus />);
    frameCallback!({}, 0.1);
    expect(controls.update).not.toHaveBeenCalled();
  });
});
