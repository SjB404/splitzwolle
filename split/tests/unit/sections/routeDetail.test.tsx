import { fireEvent, screen } from "@testing-library/react";
import RouteFacts from "../../../src/sections/routeDetail/routeFacts.tsx";
import RouteStops from "../../../src/sections/routeDetail/routeStops.tsx";
import RouteStory from "../../../src/sections/routeDetail/routeStory.tsx";
import RouteSummary from "../../../src/sections/routeDetail/routeSummary.tsx";
import RouteReviews from "../../../src/sections/routeDetail/routeReviews.tsx";
import RatingBreakdown from "../../../src/sections/routeDetail/ratingBreakdown.tsx";
import ReviewCard from "../../../src/sections/routeDetail/reviewCard.tsx";
import ReviewForm from "../../../src/sections/routeDetail/reviewForm.tsx";
import RelatedRoutes from "../../../src/sections/routeDetail/relatedRoutes.tsx";
import {
  ROUTES,
  ROUTE_REVIEWS,
  buildReviewBreakdown,
  getRelatedRoutes,
  routePoints,
  routeStart,
} from "../../../src/data/routes.ts";
import { renderWithRouter } from "../helpers.tsx";

const ROUTE = ROUTES[0];
const PLACES = routePoints(ROUTE);

describe("RouteFacts", () => {
  it("prints the four facts of the route", () => {
    renderWithRouter(<RouteFacts route={ROUTE} />);

    expect(screen.getByText("Afstand")).toBeInTheDocument();
    expect(screen.getByText("1,1 km")).toBeInTheDocument();
    expect(screen.getByText("Duur")).toBeInTheDocument();
    expect(screen.getByText("20 min")).toBeInTheDocument();
    expect(screen.getByText("Moeilijkheid")).toBeInTheDocument();
    expect(screen.getByText("Makkelijk")).toBeInTheDocument();
    expect(screen.getByText("Hoogteverschil")).toBeInTheDocument();
    expect(screen.getByText("3 m")).toBeInTheDocument();
  });
});

describe("RouteStops", () => {
  it("lists one numbered stop per place, in visit order", () => {
    renderWithRouter(<RouteStops route={ROUTE} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Onderweg" }),
    ).toBeInTheDocument();

    const stops = screen.getAllByRole("listitem");

    expect(stops).toHaveLength(PLACES.length);
    expect(stops[0]).toHaveTextContent(PLACES[0].name);
    expect(stops[PLACES.length - 1]).toHaveTextContent(
      PLACES[PLACES.length - 1].name,
    );
  });

  it("gives each stop its category and its era", () => {
    renderWithRouter(<RouteStops route={ROUTE} />);

    const stops = screen.getAllByRole("listitem");

    for (const [index, place] of PLACES.entries()) {
      expect(stops[index]).toHaveTextContent(
        `${place.category} · ${place.era}`,
      );
    }
  });
});

describe("RouteStory", () => {
  it("tells the route's own story", () => {
    renderWithRouter(<RouteStory route={ROUTE} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Over deze route" }),
    ).toBeInTheDocument();
    expect(screen.getByText(ROUTE.description)).toBeInTheDocument();
  });

  it("sums the route up in one line", () => {
    renderWithRouter(<RouteStory route={ROUTE} />);

    expect(
      screen.getByText(
        new RegExp(
          `De route is 1,1 km lang en duurt ongeveer 20 min\\. Onderweg kom je langs ${PLACES.length} stopplaatsen`,
        ),
      ),
    ).toBeInTheDocument();
  });
});

describe("RouteSummary", () => {
  it("prints the start, the type and the number of stops", () => {
    renderWithRouter(<RouteSummary route={ROUTE} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Plan deze route" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Startpunt")).toBeInTheDocument();
    expect(screen.getByText(routeStart(ROUTE)!.name)).toBeInTheDocument();
    expect(screen.getByText("Stopplaatsen")).toBeInTheDocument();
    expect(screen.getByText(String(PLACES.length))).toBeInTheDocument();
  });

  it("tags the route with its theme, difficulty and area", () => {
    renderWithRouter(<RouteSummary route={ROUTE} />);

    expect(screen.getByText(ROUTE.difficulty)).toBeInTheDocument();
    expect(screen.getByText(ROUTE.area)).toBeInTheDocument();
  });

  it("sends the reader to the planner", () => {
    renderWithRouter(<RouteSummary route={ROUTE} />);

    expect(
      screen.getByRole("link", { name: "Plan deze route" }),
    ).toHaveAttribute("href", "/planning");
  });
});

describe("RatingBreakdown", () => {
  const breakdown = buildReviewBreakdown(ROUTE.reviews);

  it("prints the score and how many people gave it", () => {
    renderWithRouter(
      <RatingBreakdown
        rating={ROUTE.rating}
        reviewCount={ROUTE.reviews}
        breakdown={breakdown}
      />,
    );

    expect(screen.getByText("4,9")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "4,9 van 5 sterren",
    );
    expect(
      screen.getByText(`${ROUTE.reviews} beoordelingen`),
    ).toBeInTheDocument();
  });

  it("draws one bar per star, scaled to the total", () => {
    const { container } = renderWithRouter(
      <RatingBreakdown
        rating={ROUTE.rating}
        reviewCount={ROUTE.reviews}
        breakdown={breakdown}
      />,
    );

    const bars = [...container.querySelectorAll("progress")];

    expect(bars).toHaveLength(5);
    expect(bars.map((bar) => bar.getAttribute("value"))).toEqual([
      "144",
      "39",
      "12",
      "6",
      "2",
    ]);
    expect(bars.every((bar) => bar.getAttribute("max") === "203")).toBe(true);
  });

  it("keeps the bars out of the accessibility tree, since the numbers beside them say it", () => {
    const { container } = renderWithRouter(
      <RatingBreakdown
        rating={ROUTE.rating}
        reviewCount={ROUTE.reviews}
        breakdown={breakdown}
      />,
    );

    expect(container.querySelector("progress")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("pins the current wording for a single review", () => {
    renderWithRouter(
      <RatingBreakdown
        rating={5}
        reviewCount={1}
        breakdown={buildReviewBreakdown(1)}
      />,
    );

    /* no singular form: this is what the component prints today */
    expect(screen.getByText("1 beoordelingen")).toBeInTheDocument();
  });
});

describe("ReviewCard", () => {
  const review = ROUTE_REVIEWS[0];

  it("prints who wrote it, when, what they said and how they scored it", () => {
    renderWithRouter(<ReviewCard review={review} />);

    expect(screen.getByText(review.initials)).toBeInTheDocument();
    expect(screen.getByText(review.author)).toBeInTheDocument();
    expect(screen.getByText(review.date)).toBeInTheDocument();
    expect(screen.getByText(review.text)).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "4,5 van 5 sterren",
    );
    expect(screen.getByText("4,5")).toBeInTheDocument();
  });
});

describe("ReviewForm", () => {
  it("starts at five stars and says so", () => {
    renderWithRouter(<ReviewForm />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Schrijf een review" }),
    ).toBeInTheDocument();
    expect(screen.getByText("5 van 5 sterren")).toBeInTheDocument();
  });

  it("runs from one to five in whole stars", () => {
    renderWithRouter(<ReviewForm />);
    const slider = screen.getByRole("slider", {
      name: /Kies een beoordeling tussen 1 en 5 sterren/,
    });

    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "1");
    expect(slider).toHaveAttribute("max", "5");
    expect(slider).toHaveAttribute("step", "1");
  });

  it("follows the slider", () => {
    renderWithRouter(<ReviewForm />);
    const slider = screen.getByRole("slider", {
      name: /Kies een beoordeling tussen 1 en 5 sterren/,
    });

    fireEvent.change(slider, { target: { value: "3" } });

    expect(screen.getByText("3 van 5 sterren")).toBeInTheDocument();
  });

  it("binds the text field's label to it", () => {
    renderWithRouter(<ReviewForm />);

    expect(screen.getByLabelText("Jouw ervaring")).toHaveAttribute(
      "id",
      "review-text",
    );
  });

  it("has a submit button, and submitting stores nothing", () => {
    const { container } = renderWithRouter(<ReviewForm />);
    const text = screen.getByLabelText("Jouw ervaring");

    fireEvent.change(text, { target: { value: "Mooie route!" } });

    expect(
      screen.getByRole("button", { name: "Review plaatsen" }),
    ).toHaveAttribute("type", "submit");

    fireEvent.submit(container.querySelector("form")!);

    /* the form only prevents the default: there is no api to post to yet */
    expect(screen.getByLabelText("Jouw ervaring")).toHaveValue("Mooie route!");
    expect(screen.getByText("5 van 5 sterren")).toBeInTheDocument();
  });
});

describe("RouteReviews", () => {
  it("heads the section with the route's own review total", () => {
    renderWithRouter(<RouteReviews route={ROUTE} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: `Reviews (${ROUTE.reviews})`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Wat andere wandelaars en fietsers van deze route vonden.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the sample reviews and the breakdown", () => {
    const { container } = renderWithRouter(<RouteReviews route={ROUTE} />);

    for (const review of ROUTE_REVIEWS) {
      expect(screen.getByText(review.author)).toBeInTheDocument();
    }

    expect(container.querySelectorAll("progress")).toHaveLength(5);
    expect(
      screen.getByText(`${ROUTE.reviews} beoordelingen`),
    ).toBeInTheDocument();
  });
});

describe("RelatedRoutes", () => {
  it("shows comparable routes and the way to the whole list", () => {
    const related = getRelatedRoutes(ROUTE);
    renderWithRouter(<RelatedRoutes routes={related} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Vergelijkbare routes" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      related.length,
    );
    expect(
      screen.getByRole("link", { name: "Alle routes bekijken" }),
    ).toHaveAttribute("href", "/routes");
  });

  it("never lists the route it is on", () => {
    renderWithRouter(<RelatedRoutes routes={getRelatedRoutes(ROUTE)} />);

    expect(
      screen.queryByRole("heading", { level: 3, name: ROUTE.title }),
    ).toBeNull();
  });
});
