import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PLANET_ECCENTRICITY, PLANET_SIZE } from "../models/planet";
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
    expect(screen.getByLabelText("Orbit Shape")).toHaveValue("0");
    expect(screen.getByText("0.00")).toBeInTheDocument();
    expect(screen.getByText("A perfect circle.")).toBeInTheDocument();
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

  it("constrains the eccentricity slider to PLANET_ECCENTRICITY bounds", () => {
    setup();
    const slider = screen.getByLabelText("Orbit Shape");
    expect(slider).toHaveAttribute("min", String(PLANET_ECCENTRICITY.min));
    expect(slider).toHaveAttribute("max", String(PLANET_ECCENTRICITY.max));
    expect(slider).toHaveAttribute("step", String(PLANET_ECCENTRICITY.step));
  });

  it("reports the periapsis and apoapsis once distance and eccentricity are set", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Distance from Sun (AU)"), "1");
    fireEvent.change(screen.getByLabelText("Orbit Shape"), {
      target: { value: "0.3" },
    });

    expect(screen.getByText("0.30")).toBeInTheDocument();
    expect(
      screen.getByText("Ranges from 0.7 AU to 1.3 AU."),
    ).toBeInTheDocument();
  });

  it("submits the collected values", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText("Name"), "Kepler");
    await user.type(screen.getByLabelText("Description"), "Ocean world");
    await user.type(screen.getByLabelText("Distance from Sun (AU)"), "1.5");
    fireEvent.change(screen.getByLabelText("Size"), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText("Orbit Shape"), {
      target: { value: "0.25" },
    });
    await user.click(screen.getByRole("button", { name: "Oceans" }));
    await user.click(screen.getByRole("button", { name: "Ringed" }));

    await user.click(screen.getByRole("button", { name: "Save Planet" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Kepler",
      description: "Ocean world",
      distanceAu: 1.5,
      size: 7,
      eccentricity: 0.25,
      characteristics: ["oceans", "ringed"],
    });
  });

  it("submits NaN distance when the distance field is left blank", async () => {
    const { user, onSubmit } = setup();
    await user.click(screen.getByRole("button", { name: "Save Planet" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].distanceAu).toBeNaN();
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
