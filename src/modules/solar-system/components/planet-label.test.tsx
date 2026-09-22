import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { PlanetLabel } from "./planet-label";

const htmlProps = vi.fn();

vi.mock("@react-three/drei", () => ({
  Html: ({ children, ...props }: { children: ReactNode }) => {
    htmlProps(props);
    return <div data-testid="html">{children}</div>;
  },
}));

describe("PlanetLabel", () => {
  beforeEach(() => {
    htmlProps.mockClear();
  });

  it("renders the planet name", () => {
    render(<PlanetLabel name="Kepler" planetRadius={1} />);
    expect(screen.getByText("Kepler")).toBeInTheDocument();
  });

  it("positions the label just above the planet surface", () => {
    render(<PlanetLabel name="Kepler" planetRadius={1.5} />);
    expect(htmlProps).toHaveBeenCalledWith(
      expect.objectContaining({
        position: [0, 2.1, 0],
        center: true,
        distanceFactor: 40,
        zIndexRange: [10, 0],
      }),
    );
  });

  it("disables pointer events so the label never blocks orbit controls", () => {
    render(<PlanetLabel name="Kepler" planetRadius={1} />);
    expect(htmlProps).toHaveBeenCalledWith(
      expect.objectContaining({ style: { pointerEvents: "none" } }),
    );
  });
});
