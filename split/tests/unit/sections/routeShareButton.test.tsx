import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import RouteShareButton from "../../../src/components/routeShareButton.tsx";
import { builderPath } from "../../../src/data/navigation.ts";
import { renderWithRouter } from "../helpers.tsx";

const PLACES = ["peperbus", "melkmarkt"];

/* jsdom has no clipboard; the test lends one and takes it back */
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

  it("stays clickable without a route, so the popup can explain the wait", () => {
    renderWithRouter(<RouteShareButton placeIds={[]} />);

    expect(
      screen.getByRole("button", { name: "Deel deze route" }),
    ).toBeEnabled();
  });

  it("says nothing until it is asked", () => {
    renderWithRouter(<RouteShareButton placeIds={PLACES} />);

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText(/Link gekopieerd/)).toBeNull();
    expect(screen.queryByText(/Kopieer de link/)).toBeNull();
  });

  it("opens a popup instead of copying when there is no route yet", () => {
    renderWithRouter(<RouteShareButton placeIds={["peperbus"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Deel deze route" }));

    const bubble = screen.getByRole("alert");

    expect(bubble).toHaveTextContent("Kies eerst twee plekken op de kaart.");

    /* the bubble opens upwards; below the button it would fall outside the map */
    expect(bubble.className).toContain("bottom-full");
  });

  it("closes the popup with its own action", () => {
    renderWithRouter(<RouteShareButton placeIds={["peperbus"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Deel deze route" }));
    fireEvent.click(screen.getByRole("button", { name: "Sluiten" }));

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("closes the popup on escape", () => {
    renderWithRouter(<RouteShareButton placeIds={["peperbus"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Deel deze route" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("closes the popup when the click lands outside it", () => {
    renderWithRouter(<RouteShareButton placeIds={["peperbus"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Deel deze route" }));
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("closes the popup once a second place makes a route", async () => {
    function Harness() {
      const [ids, setIds] = useState<string[]>(["peperbus"]);

      return (
        <>
          <RouteShareButton placeIds={ids} />
          <button
            type="button"
            onClick={() => setIds(["peperbus", "melkmarkt"])}
          >
            plek erbij
          </button>
        </>
      );
    }

    renderWithRouter(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Deel deze route" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "plek erbij" }));

    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

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
