import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  PLANET_CHARACTERISTICS,
  planetCharacteristicMeta,
} from "../models/planet-characteristic";
import { CharacteristicPicker } from "./characteristic-picker";

describe("CharacteristicPicker", () => {
  it("renders one toggle button per characteristic inside a group", () => {
    render(<CharacteristicPicker value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(
      PLANET_CHARACTERISTICS.length,
    );
    for (const characteristic of PLANET_CHARACTERISTICS) {
      expect(
        screen.getByRole("button", {
          name: planetCharacteristicMeta[characteristic].label,
        }),
      ).toBeInTheDocument();
    }
  });

  it("marks selected characteristics with aria-pressed", () => {
    render(
      <CharacteristicPicker value={["rocky", "icy"]} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Rocky" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Icy" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Oceans" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("uses the description as the button title", () => {
    render(<CharacteristicPicker value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Toxic" })).toHaveAttribute(
      "title",
      planetCharacteristicMeta.toxic.description,
    );
  });

  it("adds a characteristic when an unselected one is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CharacteristicPicker value={["rocky"]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Oceans" }));
    expect(onChange).toHaveBeenCalledWith(["rocky", "oceans"]);
  });

  it("removes a characteristic when a selected one is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CharacteristicPicker value={["rocky", "oceans"]} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Rocky" }));
    expect(onChange).toHaveBeenCalledWith(["oceans"]);
  });

  it("uses type=button so it never submits an enclosing form", () => {
    render(<CharacteristicPicker value={[]} onChange={vi.fn()} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type", "button");
    }
  });
});
