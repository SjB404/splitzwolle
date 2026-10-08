import { screen, within } from "@testing-library/react";
import PopularRoutesPreview from "../../../src/components/popularRoutesPreview.tsx";
import { ROUTES, ROUTE_PREVIEW_COUNT } from "../../../src/data/routes.ts";
import { publicRoutePath } from "../../../src/data/navigation.ts";
import { formatDistance, formatDuration, formatRating } from "../../../src/format.ts";
import { renderWithRouter } from "../helpers.tsx";

const SHOWN = ROUTES.slice(0, ROUTE_PREVIEW_COUNT);
const CARD = SHOWN[0];

const card = () =>
  screen.getByRole("heading", { level: 3, name: CARD.title }).closest("article")!;

describe("PopularRoutesPreview", () => {
  it("shows one card per route in the slice", () => {
    renderWithRouter(<PopularRoutesPreview />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      ROUTE_PREVIEW_COUNT,
    );
  });

  it("links each card's title at the route's own page", () => {
    renderWithRouter(<PopularRoutesPreview />);

    expect(
      screen.getByRole("link", { name: `Open de route ${CARD.title}` }),
    ).toHaveAttribute("href", publicRoutePath(CARD.id));
    expect(
      screen.getByRole("heading", { level: 3, name: CARD.title }),
    ).toBeInTheDocument();
  });

  it("prints the distance and the duration in dutch", () => {
    renderWithRouter(<PopularRoutesPreview />);

    const body = card();

    expect(
      within(body).getByText(new RegExp(formatDistance(CARD.distanceKm))),
    ).toBeInTheDocument();
    expect(
      within(body).getByText(new RegExp(formatDuration(CARD.durationMinutes))),
    ).toBeInTheDocument();
  });

  it("prints the score and how many people gave it", () => {
    renderWithRouter(<PopularRoutesPreview />);

    const body = card();

    expect(within(body).getByText(formatRating(CARD.rating))).toBeInTheDocument();
    expect(
      within(body).getByText(`(${CARD.reviews} beoordelingen)`),
    ).toBeInTheDocument();
  });

  it("labels the card with the area and the theme", () => {
    renderWithRouter(<PopularRoutesPreview />);

    const body = card();

    expect(within(body).getByText(CARD.area)).toBeInTheDocument();
    expect(within(body).getByText(CARD.theme)).toBeInTheDocument();
  });

  it("draws each route from its own coordinates when there is no map picture", () => {
    const { container } = renderWithRouter(<PopularRoutesPreview />);

    expect(container.querySelectorAll("polyline")).toHaveLength(
      ROUTE_PREVIEW_COUNT * 2,
    ); /* a casing and a line per card */
    expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);
  });

  it("leaves the popular badge off every card, because the section title says it", () => {
    const { container } = renderWithRouter(<PopularRoutesPreview />);

    expect(screen.queryByText("Populair")).toBeNull();
    expect(container.querySelectorAll("article")).toHaveLength(
      ROUTE_PREVIEW_COUNT,
    );
    expect(screen.getAllByText("Bekijk")).toHaveLength(ROUTE_PREVIEW_COUNT);
  });
});
