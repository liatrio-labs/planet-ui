import { render, screen } from "@testing-library/react";

import {
  PLANET_CHARACTERISTICS,
  planetCharacteristicMeta,
} from "../models/planet-characteristic";
import { CharacteristicBadge } from "./characteristic-badge";

describe("CharacteristicBadge", () => {
  it.each(PLANET_CHARACTERISTICS)(
    "renders the label for %s",
    (characteristic) => {
      render(<CharacteristicBadge characteristic={characteristic} />);
      expect(
        screen.getByText(planetCharacteristicMeta[characteristic].label),
      ).toBeInTheDocument();
    },
  );

  it("renders a decorative swatch filled with the characteristic color", () => {
    const { container } = render(
      <CharacteristicBadge characteristic="oceans" />,
    );
    const swatch = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(swatch).not.toBeNull();
    expect(swatch.style.backgroundColor).toBe("rgb(47, 111, 214)");
  });
});
