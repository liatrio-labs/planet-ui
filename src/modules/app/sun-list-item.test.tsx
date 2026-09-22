import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SUN_ID, usePlanetsStore } from "~/modules/planets/store/planets.store";
import { SunListItem } from "./sun-list-item";

describe("SunListItem", () => {
  beforeEach(() => {
    usePlanetsStore.setState({ planets: [], focusedBodyId: null });
  });

  it("renders the sun heading and caption inside a focus button", () => {
    render(<SunListItem />);
    const button = screen.getByRole("button", { name: "Focus camera on Sun" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("heading", { name: "Sun" })).toBeInTheDocument();
    expect(screen.getByText("Fixed at the center")).toBeInTheDocument();
  });

  it("focuses the sun when clicked", async () => {
    const user = userEvent.setup();
    render(<SunListItem />);
    await user.click(screen.getByRole("button", { name: "Focus camera on Sun" }));
    expect(usePlanetsStore.getState().focusedBodyId).toBe(SUN_ID);
    expect(
      screen.getByRole("button", { name: "Focus camera on Sun" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
