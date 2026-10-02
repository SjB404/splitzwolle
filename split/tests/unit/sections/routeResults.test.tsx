import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import RouteResults from "../../../src/components/routeResults.tsx";
import { ROUTES } from "../../../src/data/routes.ts";
import { publicRoutePath } from "../../../src/data/navigation.ts";
import { renderWithRouter } from "../helpers.tsx";

const POPULAR = ROUTES.find((route) => route.popular)!;
const QUIET = ROUTES.find((route) => !route.popular)!;

/* the wide card is written out in RouteResults, so the list is what renders it */
const render = (
  route = POPULAR,
  onBuild = () => {},
  saved = false,
  onToggleSave = () => {},
) =>
  renderWithRouter(
    <RouteResults
      routes={[route]}
      showAll
      onShowAll={() => {}}
      onReset={() => {}}
      onBuild={onBuild}
      savedIds={saved ? [route.id] : []}
      onToggleSave={onToggleSave}
    />,
  );

describe("RouteResults' cards", () => {
  it("names the route and tells it in a line", () => {
    render();

    expect(
      screen.getByRole("heading", { level: 3, name: POPULAR.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(POPULAR.description)).toBeInTheDocument();
  });

  it("prints the average score with the stars behind it", () => {
    const { container } = render();

    expect(screen.getByText("4,9")).toBeInTheDocument();
    expect(
      screen.getByText(`(${POPULAR.reviews} beoordelingen)`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "4,9 van 5 sterren" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("i.fill")).not.toHaveLength(0);
  });

  it("labels the card with the area and the theme", () => {
    render();

    expect(screen.getByText(POPULAR.area)).toBeInTheDocument();
    expect(screen.getByText(POPULAR.theme)).toBeInTheDocument();
  });

  it("marks a popular route, and leaves the badge off one nobody called popular", () => {
    const { unmount } = render();

    expect(screen.getByText("Populair")).toBeInTheDocument();

    unmount();
    render(QUIET);

    expect(screen.queryByText("Populair")).toBeNull();
  });

  it("draws the route when there is no map picture to ask for", () => {
    const { container } = render();

    expect(container.querySelector("polyline")).toBeInTheDocument();
  });

  it("loads the route into the builder from its title", () => {
    const onBuild = vi.fn();
    render(POPULAR, onBuild);

    fireEvent.click(screen.getByRole("button", { name: POPULAR.title }));

    expect(onBuild).toHaveBeenCalledWith(POPULAR);
  });

  it("opens the route's own page from the arrow in the bottom corner", () => {
    render();

    expect(
      screen.getByRole("link", { name: `Open de route ${POPULAR.title}` }),
    ).toHaveAttribute("href", publicRoutePath(POPULAR.id));
  });

  it("saves the route from the bookmark, and says which state that is", () => {
    const onToggleSave = vi.fn();
    render(POPULAR, () => {}, false, onToggleSave);

    const bookmark = screen.getByRole("button", {
      name: `Bewaar ${POPULAR.title} bij je opgeslagen routes`,
    });

    expect(bookmark).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("Opgeslagen")).toBeNull();

    fireEvent.click(bookmark);

    expect(onToggleSave).toHaveBeenCalledWith(POPULAR);
  });

  it("marks a route the reader saved, and offers to take it back", () => {
    render(POPULAR, () => {}, true);

    expect(screen.getByText("Opgeslagen")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `Haal ${POPULAR.title} uit je opgeslagen routes`,
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the arrow out of the title button, because a control inside a control is not html", () => {
    const { container } = render();

    expect(container.querySelectorAll("button button")).toHaveLength(0);
    expect(container.querySelectorAll("a button")).toHaveLength(0);
    /* the title and the bookmark are the card's two buttons; the arrow is a link of its own */
    expect(container.querySelectorAll("button")).toHaveLength(2);
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });
});
