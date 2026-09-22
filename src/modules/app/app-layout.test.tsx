import { render, screen } from "@testing-library/react";

import { usePlanetsStore } from "~/modules/planets/store/planets.store";
import { AppLayout } from "./app-layout";

vi.mock("~/modules/solar-system/components/solar-system-canvas", () => ({
  SolarSystemCanvas: () => <div data-testid="solar-system-canvas" />,
}));

describe("AppLayout", () => {
  beforeEach(() => {
    usePlanetsStore.setState({ planets: [] });
  });

  it("renders the side pane and the canvas inside main", () => {
    render(<AppLayout />);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    const main = screen.getByRole("main");
    expect(main).toContainElement(screen.getByTestId("solar-system-canvas"));
  });

  it("shows the camera controls hint without intercepting pointer events", () => {
    render(<AppLayout />);
    expect(screen.getByText("Click a body to focus · drag to orbit · scroll to zoom")).toHaveClass(
      "pointer-events-none",
    );
  });
});
