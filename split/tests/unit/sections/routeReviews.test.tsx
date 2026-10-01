import { fireEvent, screen } from "@testing-library/react";
import RatingBreakdown from "../../../src/sections/routes/ratingBreakdown.tsx";
import ReviewCard from "../../../src/sections/routes/reviewCard.tsx";
import ReviewForm from "../../../src/sections/routes/reviewForm.tsx";
import RouteReviews from "../../../src/sections/routes/routeReviews.tsx";
import RouteReviewsPanel from "../../../src/sections/routes/routeReviewsPanel.tsx";
import {
  ROUTES,
  ROUTE_REVIEWS,
  buildReviewBreakdown,
} from "../../../src/data/routes.ts";
import { renderWithRouter } from "../helpers.tsx";

const ROUTE = ROUTES[0];

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
  it("shows the breakdown, every review and the form — and no heading of its own", () => {
    const { container } = renderWithRouter(<RouteReviews route={ROUTE} />);

    /* the panel around it owns the heading, so the band and the section title stay out of here */
    expect(
      screen.queryByRole("heading", { name: /^Reviews \(/ }),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll("progress")).toHaveLength(5);
    expect(screen.getByText(ROUTE_REVIEWS[0].text)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Review plaatsen" }),
    ).toBeInTheDocument();
  });
});

describe("RouteReviewsPanel", () => {
  it("opens with the average and the count, and nothing to read yet", () => {
    renderWithRouter(<RouteReviewsPanel route={ROUTE} />);

    const toggle = screen.getByRole("button", { name: /Reviews bekijken/ });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByText(new RegExp(`\\(${ROUTE.reviews} beoordelingen\\)`)),
    ).toBeInTheDocument();
    expect(screen.queryByText(ROUTE_REVIEWS[0].text)).not.toBeInTheDocument();
  });

  it("folds the reviews out and back in again", () => {
    renderWithRouter(<RouteReviewsPanel route={ROUTE} />);

    fireEvent.click(screen.getByRole("button", { name: /Reviews bekijken/ }));

    expect(screen.getByText(ROUTE_REVIEWS[0].text)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: `Reviews (${ROUTE.reviews})`,
      }),
    ).toBeInTheDocument();

    const close = screen.getByRole("button", { name: /Reviews verbergen/ });

    expect(close).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(close);

    expect(screen.queryByText(ROUTE_REVIEWS[0].text)).not.toBeInTheDocument();
  });
});
