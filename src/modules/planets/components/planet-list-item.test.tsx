import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { derivePlanetAppearance } from "../lib/planet-appearance";
import type { Planet } from "../models/planet";
import { PlanetListItem } from "./planet-list-item";

const planet: Planet = {
  id: "p-1",
  createdAt: 0,
  name: "Kepler-442b",
  description: "A tidally locked world.",
  distanceAu: 1.5,
  size: 6,
  characteristics: ["oceans", "ringed"],
};

const renderItem = (override: Partial<Planet> = {}) => {
  const onRemove = vi.fn();
  const utils = render(
    <ul>
      <PlanetListItem planet={{ ...planet, ...override }} onRemove={onRemove} />
    </ul>,
  );
  return { ...utils, onRemove };
};

describe("PlanetListItem", () => {
  it("renders the planet name as a heading", () => {
    renderItem();
    expect(
      screen.getByRole("heading", { name: "Kepler-442b" }),
    ).toBeInTheDocument();
  });

  it("renders distance in AU, km and the size", () => {
    renderItem();
    expect(
      screen.getByText("1.5 AU · 224,396,806 km · size 6"),
    ).toBeInTheDocument();
  });

  it("renders the description when present", () => {
    renderItem();
    expect(screen.getByText("A tidally locked world.")).toBeInTheDocument();
  });

  it("omits the description paragraph when empty", () => {
    renderItem({ description: "" });
    expect(
      screen.queryByText("A tidally locked world."),
    ).not.toBeInTheDocument();
  });

  it("renders a badge for each characteristic", () => {
    renderItem();
    expect(screen.getByText("Oceans")).toBeInTheDocument();
    expect(screen.getByText("Ringed")).toBeInTheDocument();
  });

  it("renders no badges when the planet has no characteristics", () => {
    renderItem({ characteristics: [] });
    expect(screen.queryByText("Oceans")).not.toBeInTheDocument();
  });

  it("colors the swatch from the derived appearance", () => {
    const { container } = renderItem();
    const swatch = container.querySelector("li button > span") as HTMLElement;
    const expected = derivePlanetAppearance(planet.characteristics).color;
    // jsdom normalises hex to rgb(); compare through a scratch element.
    const probe = document.createElement("div");
    probe.style.backgroundColor = expected;
    expect(swatch.style.backgroundColor).toBe(probe.style.backgroundColor);
  });

  it("calls onRemove with the planet id when the remove button is clicked", async () => {
    const user = userEvent.setup();
    const { onRemove } = renderItem();
    await user.click(
      screen.getByRole("button", { name: "Remove Kepler-442b" }),
    );
    expect(onRemove).toHaveBeenCalledWith("p-1");
  });
});

describe("PlanetListItem selection", () => {
  it("exposes a focus button that reports the planet id when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ul>
        <PlanetListItem planet={planet} onSelect={onSelect} onRemove={vi.fn()} />
      </ul>,
    );
    const button = screen.getByRole("button", {
      name: "Focus camera on Kepler-442b",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(onSelect).toHaveBeenCalledWith("p-1");
  });

  it("marks the focus button pressed when selected", () => {
    render(
      <ul>
        <PlanetListItem planet={planet} isSelected onRemove={vi.fn()} />
      </ul>,
    );
    expect(
      screen.getByRole("button", { name: "Focus camera on Kepler-442b" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("does not trigger selection when the remove button is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ul>
        <PlanetListItem planet={planet} onSelect={onSelect} onRemove={vi.fn()} />
      </ul>,
    );
    await user.click(screen.getByRole("button", { name: "Remove Kepler-442b" }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
