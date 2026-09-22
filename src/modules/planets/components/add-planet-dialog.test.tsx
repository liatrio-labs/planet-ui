import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { usePlanetsStore } from "../store/planets.store";
import { AddPlanetDialog } from "./add-planet-dialog";

const getDialog = () => document.querySelector("dialog") as HTMLDialogElement;

describe("AddPlanetDialog", () => {
  beforeEach(() => {
    usePlanetsStore.setState({ planets: [] });
  });

  it("renders a trigger button and a closed dialog", () => {
    render(<AddPlanetDialog />);
    expect(
      screen.getByRole("button", { name: "Add Planet" }),
    ).toBeInTheDocument();
    expect(getDialog()).not.toHaveAttribute("open");
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("opens the dialog with the form when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<AddPlanetDialog />);
    await user.click(screen.getByRole("button", { name: "Add Planet" }));

    expect(getDialog()).toHaveAttribute("open");
    expect(
      screen.getByRole("heading", { name: "Add Planet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Describe a new world/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("closes without adding when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<AddPlanetDialog />);
    await user.click(screen.getByRole("button", { name: "Add Planet" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(getDialog()).not.toHaveAttribute("open");
    expect(usePlanetsStore.getState().planets).toHaveLength(0);
  });

  it("closes when the header close button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddPlanetDialog />);
    await user.click(screen.getByRole("button", { name: "Add Planet" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(getDialog()).not.toHaveAttribute("open");
  });

  it("adds the planet to the store and closes on submit", async () => {
    const user = userEvent.setup();
    render(<AddPlanetDialog />);
    await user.click(screen.getByRole("button", { name: "Add Planet" }));

    await user.type(screen.getByLabelText("Name"), "Nova");
    await user.type(screen.getByLabelText("Distance from Sun (AU)"), "2");
    await user.click(screen.getByRole("button", { name: "Icy" }));
    await user.click(screen.getByRole("button", { name: "Save Planet" }));

    const { planets } = usePlanetsStore.getState();
    expect(planets).toHaveLength(1);
    expect(planets[0]).toMatchObject({
      name: "Nova",
      distanceAu: 2,
      size: 4,
      characteristics: ["icy"],
    });
    expect(planets[0].id).toEqual(expect.any(String));
    expect(getDialog()).not.toHaveAttribute("open");
  });

  it("resets the form each time the dialog is reopened", async () => {
    const user = userEvent.setup();
    render(<AddPlanetDialog />);
    await user.click(screen.getByRole("button", { name: "Add Planet" }));
    await user.type(screen.getByLabelText("Name"), "Draft");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await user.click(screen.getByRole("button", { name: "Add Planet" }));
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });
});
