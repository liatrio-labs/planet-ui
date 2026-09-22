import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PLANET_SIZE } from "../models/planet";
import { PlanetForm } from "./planet-form";

const setup = () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(<PlanetForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { onSubmit, onCancel, user: userEvent.setup() };
};

describe("PlanetForm", () => {
  it("renders all fields with their defaults", () => {
    setup();
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(screen.getByLabelText("Distance from Sun (AU)")).toHaveValue(null);
    expect(screen.getByLabelText("Size")).toHaveValue("4");
    expect(screen.getByText(`4 / ${PLANET_SIZE.max}`)).toBeInTheDocument();
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("shows the generic distance hint until a distance is entered", async () => {
    const { user } = setup();
    expect(
      screen.getByText(/1 AU is Earth's distance from the sun/),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Distance from Sun (AU)"), "1");
    expect(screen.getByText("About 149,597,871 km.")).toBeInTheDocument();
  });

  it("updates the size readout as the range input moves", () => {
    setup();
    fireEvent.change(screen.getByLabelText("Size"), { target: { value: "9" } });
    expect(screen.getByText(`9 / ${PLANET_SIZE.max}`)).toBeInTheDocument();
  });

  it("constrains the size slider to PLANET_SIZE bounds", () => {
    setup();
    const slider = screen.getByLabelText("Size");
    expect(slider).toHaveAttribute("min", String(PLANET_SIZE.min));
    expect(slider).toHaveAttribute("max", String(PLANET_SIZE.max));
    expect(slider).toHaveAttribute("step", String(PLANET_SIZE.step));
  });

  it("submits the collected values", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText("Name"), "Kepler");
    await user.type(screen.getByLabelText("Description"), "Ocean world");
    await user.type(screen.getByLabelText("Distance from Sun (AU)"), "1.5");
    fireEvent.change(screen.getByLabelText("Size"), { target: { value: "7" } });
    await user.click(screen.getByRole("button", { name: "Oceans" }));
    await user.click(screen.getByRole("button", { name: "Ringed" }));

    await user.click(screen.getByRole("button", { name: "Save Planet" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Kepler",
      description: "Ocean world",
      distanceAu: 1.5,
      size: 7,
      characteristics: ["oceans", "ringed"],
    });
  });

  it("blocks submission and shows errors when required fields are missing", async () => {
    const { user, onSubmit } = setup();
    await user.click(screen.getByRole("button", { name: "Save Planet" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Distance is required.")).toBeInTheDocument();
  });

  it("blocks submission when the distance is outside the allowed range", async () => {
    const { user, onSubmit } = setup();
    await user.type(screen.getByLabelText("Name"), "Kepler");
    await user.type(screen.getByLabelText("Distance from Sun (AU)"), "42");

    await user.click(screen.getByRole("button", { name: "Save Planet" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Enter a distance between 0.1 and 10 AU."),
    ).toBeInTheDocument();
  });

  it("clears a field's error as soon as it is corrected", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Save Planet" }));
    expect(screen.getByText("Name is required.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "Kepler");
    expect(screen.queryByText("Name is required.")).not.toBeInTheDocument();
  });

  it("trims whitespace from name and description before submitting", async () => {
    const { user, onSubmit } = setup();
    await user.type(screen.getByLabelText("Name"), "  Kepler  ");
    await user.type(
      screen.getByLabelText("Description"),
      "  Ocean world  ",
    );
    await user.type(screen.getByLabelText("Distance from Sun (AU)"), "1.5");

    await user.click(screen.getByRole("button", { name: "Save Planet" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Kepler", description: "Ocean world" }),
    );
  });

  it("calls onCancel without submitting when Cancel is clicked", async () => {
    const { user, onSubmit, onCancel } = setup();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("only the save button has type=submit", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Save Planet" }),
    ).toHaveAttribute("type", "submit");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
      "type",
      "button",
    );
  });
});
