import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import RouteShareButton from "../../../src/sections/routes/routeShareButton.tsx";
import { builderPath } from "../../../src/data/navigation.ts";
import { renderWithRouter } from "../helpers.tsx";

const PLACES = ["peperbus", "melkmarkt"];

/* jsdom ships no clipboard, so the test lends it one and takes it back */
function lendClipboard() {
  const writeText = vi.fn(() => Promise.resolve());

  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });

  return writeText;
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("RouteShareButton", () => {
  it("is an icon button with a spoken name", () => {
    const { container } = renderWithRouter(
      <RouteShareButton placeIds={PLACES} />,
    );

    expect(
      screen.getByRole("button", { name: "Deel deze route" }),
    ).toBeInTheDocument();
    expect(container.querySelector("i")?.textContent).toBe("share");
  });

  it("waits for a second place, because one place is not a route", () => {
    renderWithRouter(<RouteShareButton placeIds={["peperbus"]} />);

    expect(
      screen.getByRole("button", { name: "Deel deze route" }),
    ).toBeDisabled();
  });

  it("says nothing until it is asked", () => {
    renderWithRouter(<RouteShareButton placeIds={PLACES} />);

    expect(screen.queryByText(/Link gekopieerd/)).toBeNull();
    expect(screen.queryByText(/Kopieer de link/)).toBeNull();
  });

  /* the route is already in the url, so sharing it is copying that url — places and order and all */
  it("copies the route's own url, in a live region", async () => {
    const writeText = lendClipboard();
    renderWithRouter(<RouteShareButton placeIds={PLACES} />);

    fireEvent.click(screen.getByRole("button", { name: "Deel deze route" }));

    const expected = `${window.location.origin}${builderPath(PLACES)}`;

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expected));

    const note = screen.getByText("Link gekopieerd. Plak hem waar je wilt.");

    expect(note).toHaveAttribute("aria-live", "polite");
  });

  it("hands the link over as text when the browser has no clipboard for it", async () => {
    renderWithRouter(<RouteShareButton placeIds={PLACES} />);

    fireEvent.click(screen.getByRole("button", { name: "Deel deze route" }));

    expect(
      await screen.findByText(
        `Kopieer de link: ${window.location.origin}${builderPath(PLACES)}`,
      ),
    ).toBeInTheDocument();
  });
});
