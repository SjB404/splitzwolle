import { fireEvent, screen, within } from "@testing-library/react";
import RouteReviewsPanel from "../../../src/components/routeReviewsPanel.tsx";
import { ROUTES, ROUTE_REVIEWS } from "../../../src/data/routes.ts";
import { renderWithRouter } from "../helpers.tsx";

const ROUTE = ROUTES[0];

/* the fold is the only way to the content; open it first */
const renderPanel = () => {
  const view = renderWithRouter(<RouteReviewsPanel route={ROUTE} />);

  fireEvent.click(screen.getByRole("button", { name: /Reviews bekijken/ }));

  return view;
};

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

  it("pins the wording for a single review, as the count always has", () => {
    renderWithRouter(<RouteReviewsPanel route={{ ...ROUTE, reviews: 1 }} />);

    expect(screen.getByText(/\(1 beoordelingen\)/)).toBeInTheDocument();
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

  it("draws one bar per star, scaled to the total, and keeps them out of the accessibility tree", () => {
    const { container } = renderPanel();

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
    expect(bars[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("prints the score and how many people gave it", () => {
    renderPanel();

    /* the score is in the toggle row and again over the breakdown */
    expect(screen.getAllByText("4,9").length).toBeGreaterThan(1);
    expect(
      screen.getByText(`${ROUTE.reviews} beoordelingen`),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("img", { name: "4,9 van 5 sterren" }).length,
    ).toBeGreaterThan(0);
  });

  it("prints who wrote each review, when, what they said and how they scored it", () => {
    renderPanel();
    const review = ROUTE_REVIEWS[0];
    const card = screen.getByText(review.text).closest("article")!;

    expect(within(card).getByText(review.initials)).toBeInTheDocument();
    expect(within(card).getByText(review.author)).toBeInTheDocument();
    expect(within(card).getByText(review.date)).toBeInTheDocument();
    expect(within(card).getByText("4,5")).toBeInTheDocument();
    expect(
      within(card).getByRole("img", { name: "4,5 van 5 sterren" }),
    ).toBeInTheDocument();
  });

  it("offers the form: a rating slider that follows, a labelled box and a submit that stores nothing", () => {
    const { container } = renderPanel();

    expect(
      screen.getByRole("heading", { level: 3, name: "Schrijf een review" }),
    ).toBeInTheDocument();
    expect(screen.getByText("5 van 5 sterren")).toBeInTheDocument();

    const slider = screen.getByRole("slider", {
      name: /Kies een beoordeling tussen 1 en 5 sterren/,
    });

    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "1");
    expect(slider).toHaveAttribute("max", "5");
    expect(slider).toHaveAttribute("step", "1");

    fireEvent.change(slider, { target: { value: "3" } });

    expect(screen.getByText("3 van 5 sterren")).toBeInTheDocument();

    const text = screen.getByLabelText("Jouw ervaring");

    expect(text).toHaveAttribute("id", "review-text");

    fireEvent.change(text, { target: { value: "Mooie route!" } });

    expect(
      screen.getByRole("button", { name: "Review plaatsen" }),
    ).toHaveAttribute("type", "submit");

    fireEvent.submit(container.querySelector("form")!);

    /* the form only prevents default; nothing is stored */
    expect(screen.getByLabelText("Jouw ervaring")).toHaveValue("Mooie route!");
    expect(screen.getByText("3 van 5 sterren")).toBeInTheDocument();
  });
});
