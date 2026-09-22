import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { SolarSystemCanvas } from "./solar-system-canvas";

const canvasProps = vi.fn();

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children, ...props }: { children: ReactNode }) => {
    canvasProps(props);
    return <div data-testid="canvas">{children}</div>;
  },
}));

vi.mock("./solar-system-scene", () => ({
  SolarSystemScene: () => <div data-testid="scene" />,
}));

describe("SolarSystemCanvas", () => {
  beforeEach(() => {
    canvasProps.mockClear();
  });

  it("renders the scene inside the canvas", () => {
    render(<SolarSystemCanvas />);
    expect(screen.getByTestId("canvas")).toContainElement(
      screen.getByTestId("scene"),
    );
  });

  it("configures the camera and renderer for the solar system view", () => {
    render(<SolarSystemCanvas />);
    expect(canvasProps).toHaveBeenCalledWith(
      expect.objectContaining({
        dpr: [1, 2],
        camera: { position: [0, 42, 78], fov: 50, near: 0.1, far: 2000 },
        gl: { antialias: true },
        className: "size-full",
      }),
    );
  });
});
