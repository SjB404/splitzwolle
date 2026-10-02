import { fireEvent, screen, waitFor } from "@testing-library/react";
import HomePage from "../../../src/pages/homePage.tsx";
import { ROUTE_PREVIEW_COUNT } from "../../../src/data/routes.ts";
import { renderWithRouter } from "../helpers.tsx";

const POI_PREVIEW_COUNT = 5;

/* a card that leaves the grid keeps its place in the dom until motion's fade has run, so list counts are awaited */
const cardCount = () => screen.getAllByRole("heading", { level: 3 }).length;

describe("HomePage", () => {
  it("opens with the hero's own headline", () => {
    renderWithRouter(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Ontdek Zwolle/ }),
    ).toBeInTheDocument();
  });

  it("names the page in the tab", () => {
    renderWithRouter(<HomePage />);

    expect(document.title).toBe("Ontdek Zwolle toen en nu · Zwolle Routes");
  });

  it("opens on the historic map, at the Toen end of the track", () => {
    renderWithRouter(<HomePage />);

    const slider = screen.getByRole("slider", {
      name: /Schakel tussen de historische kaart van 1652/,
    });

    expect((slider as HTMLInputElement).value).toBe("0");
    expect(screen.getByRole("button", { name: "Toen" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Nu" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("switches to today's map with one word", () => {
    renderWithRouter(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Nu" }));

    expect(screen.getByRole("button", { name: "Nu" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Toen" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      (
        screen.getByRole("slider", {
          name: /Schakel tussen de historische kaart/,
        }) as HTMLInputElement
      ).value,
    ).toBe("100");
  });

  it("previews three routes and five places", () => {
    renderWithRouter(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Populaire routes" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      ROUTE_PREVIEW_COUNT,
    );
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Bezienswaardigheden in Zwolle",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(POI_PREVIEW_COUNT);
  });

  it("keeps the popular badge off the home strip", () => {
    renderWithRouter(<HomePage />);

    expect(screen.queryByText("Populair")).toBeNull();
  });

  it("searches the route strip and says how many matched", async () => {
    renderWithRouter(<HomePage />);
    const search = screen.getByRole("searchbox", {
      name: "Zoek in de populaire routes",
    });

    fireEvent.change(search, { target: { value: "peperbus" } });

    expect(screen.getByText("3 routes")).toHaveAttribute("aria-live", "polite");
    await waitFor(() => expect(cardCount()).toBe(3));
  });

  it("keeps a strip of the matches and reports the full count", async () => {
    renderWithRouter(<HomePage />);
    const search = screen.getByRole("searchbox", {
      name: "Zoek in de populaire routes",
    });

    /* "singel" is in two titles and in the area Buitensingel of two more, so four match but three are shown */
    fireEvent.change(search, { target: { value: "singel" } });

    expect(screen.getByText("4 routes")).toBeInTheDocument();
    await waitFor(() => expect(cardCount()).toBe(ROUTE_PREVIEW_COUNT));
  });

  it("says so when the route search matches nothing", () => {
    renderWithRouter(<HomePage />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Zoek in de populaire routes" }),
      {
        target: { value: "kayak" },
      },
    );

    expect(screen.getByText("0 routes")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Geen routes gevonden" }),
    ).toBeInTheDocument();
  });

  it("searches the places strip", () => {
    renderWithRouter(<HomePage />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Zoek in de bezienswaardigheden" }),
      {
        target: { value: "eten" },
      },
    );

    expect(screen.getByText("2 bezienswaardigheden")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("says so when the place search matches nothing", () => {
    renderWithRouter(<HomePage />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Zoek in de bezienswaardigheden" }),
      {
        target: { value: "kayak" },
      },
    );

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Geen bezienswaardigheden gevonden",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("0 bezienswaardigheden")).toBeInTheDocument();
  });

  it("links both strips at their own page", () => {
    renderWithRouter(<HomePage />);

    expect(
      screen.getByRole("link", { name: "Alle routes bekijken" }),
    ).toHaveAttribute("href", "/routes");
    expect(
      screen.getByRole("link", { name: "Alle bezienswaardigheden bekijken" }),
    ).toHaveAttribute("href", "/points-of-interest");
  });
});
