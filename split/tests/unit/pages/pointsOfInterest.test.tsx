import { fireEvent, screen, within } from "@testing-library/react";
import PointsOfInterestPage from "../../../src/pages/pointsOfInterestPage.tsx";
import { POINTS_OF_INTEREST } from "../../../src/data/pointsOfInterest.ts";
import {
  builderPath,
  pointOfInterestAnchor,
  pointOfInterestPath,
} from "../../../src/data/navigation.ts";
import { renderWithRouter } from "../helpers.tsx";

const placeLinks = () => screen.getAllByRole("link", { name: "In een route" });

/* every .chip on the page, the map's own chip included */
const chipTexts = () =>
  [...document.querySelectorAll(".chip")].map(
    (chip) => chip.textContent?.trim() ?? "",
  );

describe("PointsOfInterestPage", () => {
  it("heads the page", () => {
    renderWithRouter(<PointsOfInterestPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Bezienswaardigheden in Zwolle",
      }),
    ).toBeInTheDocument();
    expect(document.title).toBe(
      "Bezienswaardigheden in Zwolle · Zwolle Routes",
    );
  });

  it("lists every place, with a link into the route builder", () => {
    renderWithRouter(<PointsOfInterestPage />);

    expect(placeLinks()).toHaveLength(POINTS_OF_INTEREST.length);
    expect(chipTexts()).toContain("Alle bezienswaardigheden");
    expect(screen.getByText("9 bezienswaardigheden")).toBeInTheDocument();
  });

  it("narrows the list and the count with a category chip", () => {
    renderWithRouter(<PointsOfInterestPage />);

    fireEvent.click(screen.getByRole("button", { name: "Musea" }));

    expect(screen.getByRole("button", { name: "Musea" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(placeLinks()).toHaveLength(3);
    expect(screen.getByText("3 bezienswaardigheden")).toBeInTheDocument();
  });

  it("searches on name, area and category", () => {
    renderWithRouter(<PointsOfInterestPage />);

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Zoek op naam, wijk of categorie",
      }),
      {
        target: { value: "kerk" },
      },
    );

    expect(placeLinks()).toHaveLength(1);
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Academiehuis de Grote Kerk",
      }),
    ).toBeInTheDocument();
  });

  it("says so when nothing matches", () => {
    renderWithRouter(<PointsOfInterestPage />);

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Zoek op naam, wijk of categorie",
      }),
      {
        target: { value: "kayak" },
      },
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Niets gevonden" }),
    ).toBeInTheDocument();
    expect(screen.getByText("0 bezienswaardigheden")).toBeInTheDocument();
  });

  it("sorts by distance and by name", () => {
    renderWithRouter(<PointsOfInterestPage />);
    const select = screen.getByLabelText("Sorteer op");

    fireEvent.change(select, { target: { value: "distance" } });
    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
      "Grote Kerk",
    );

    fireEvent.change(select, { target: { value: "name" } });
    expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
      "Academiehuis de Grote Kerk",
    );
  });

  it("puts the place you pick on the map", () => {
    renderWithRouter(<PointsOfInterestPage />);
    const card = screen
      .getByRole("heading", { level: 3, name: "Sassenpoort" })
      .closest("article")!;

    fireEvent.click(
      within(card).getByRole("button", { name: "Toon op kaart" }),
    );

    expect(
      within(card).getByRole("button", { name: "Op de kaart" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(chipTexts()).toContain("Sassenpoort");

    /* a pick gets the tone only; the flash is for a url landing */
    expect(card).toHaveClass("secondary-container");
    expect(card).not.toHaveClass("animate-flash");
  });

  it("opens on the place the url names, and flashes its edge", () => {
    const place = POINTS_OF_INTEREST[0];

    renderWithRouter(<PointsOfInterestPage />, pointOfInterestPath(place.id));

    const card = screen
      .getByRole("heading", { level: 3, name: place.name })
      .closest("article")!;

    /* the anchor id is what a url fragment resolves to */
    expect(card).toHaveAttribute("id", pointOfInterestAnchor(place.id));
    expect(
      within(card).getByRole("button", { name: "Op de kaart" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(chipTexts()).toContain(place.name);

    /* a card the url named flashes its edge instead of taking the pick tone */
    expect(card).toHaveClass("animate-flash");
    expect(card).not.toHaveClass("secondary-container");
  });

  it("drops the selection when the place is filtered away", () => {
    renderWithRouter(<PointsOfInterestPage />);
    const card = screen
      .getByRole("heading", { level: 3, name: "Sassenpoort" })
      .closest("article")!;

    fireEvent.click(
      within(card).getByRole("button", { name: "Toon op kaart" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Musea" }));

    expect(chipTexts()).toContain("Alle bezienswaardigheden");
    expect(screen.queryByRole("button", { name: "Op de kaart" })).toBeNull();
  });

  it("resets the filters to the whole list", () => {
    renderWithRouter(<PointsOfInterestPage />);

    fireEvent.click(screen.getByRole("button", { name: "Culinair" }));
    expect(placeLinks()).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Filters wissen" }));

    expect(placeLinks()).toHaveLength(POINTS_OF_INTEREST.length);
    expect(screen.getByText("9 bezienswaardigheden")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters wissen" })).toBeNull();
  });

  it("hands a place to the route builder by url", () => {
    renderWithRouter(<PointsOfInterestPage />);
    const card = screen
      .getByRole("heading", { level: 3, name: "De Peperbus" })
      .closest("article")!;

    expect(
      within(card).getByRole("link", { name: "In een route" }),
    ).toHaveAttribute("href", builderPath(["peperbus"]));
  });
});
