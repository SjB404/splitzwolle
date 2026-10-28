import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import RouteReviewsPanel from "../../../src/components/routeReviewsPanel.tsx";
import { ROUTES, ROUTE_REVIEWS } from "../../../src/data/routes.ts";
import { renderWithRouter } from "../helpers.tsx";

const ROUTE = ROUTES[0];

/* no api in tests: every request fails unless a test queues an answer */
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it("folds the reviews out and back in again", async () => {
    renderWithRouter(<RouteReviewsPanel route={ROUTE} />);

    fireEvent.click(screen.getByRole("button", { name: /Reviews bekijken/ }));

    expect(await screen.findByText(ROUTE_REVIEWS[0].text)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Schrijf een review",
      }),
    ).toBeInTheDocument();

    const close = screen.getByRole("button", { name: /Reviews verbergen/ });

    expect(close).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(close);

    await waitFor(() =>
      expect(screen.queryByText(ROUTE_REVIEWS[0].text)).not.toBeInTheDocument(),
    );
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

  it("falls back to the sample reviews when the api can't be reached", async () => {
    renderPanel();
    const review = ROUTE_REVIEWS[0];
    const card = (await screen.findByText(review.text)).closest("article")!;

    expect(within(card).getByText(review.initials)).toBeInTheDocument();
    expect(within(card).getByText(review.author)).toBeInTheDocument();
    expect(within(card).getByText(review.date)).toBeInTheDocument();
    expect(within(card).getByText("4,5")).toBeInTheDocument();
    expect(
      within(card).getByRole("img", { name: "4,5 van 5 sterren" }),
    ).toBeInTheDocument();
  });

  it("shows the api's own reviews when it answers", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([{ id: 1, rating: 4, comment: "Echt leuk" }]),
      ),
    );
    renderPanel();

    expect(await screen.findByText("Echt leuk")).toBeInTheDocument();
    expect(screen.queryByText(ROUTE_REVIEWS[0].text)).not.toBeInTheDocument();
  });

  it("only allows a review with stars and text, then posts it", async () => {
    renderPanel();
    await screen.findByText(ROUTE_REVIEWS[0].text);

    const submit = screen.getByRole("button", { name: "Review plaatsen" });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: "4 van 5 sterren" }));
    expect(
      screen.getByRole("radio", { name: "4 van 5 sterren" }),
    ).toHaveAttribute("aria-checked", "true");
    fireEvent.change(screen.getByLabelText("Jouw ervaring"), {
      target: { value: "Mooie route!" },
    });
    expect(submit).toBeEnabled();

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Review added" })),
    );
    fireEvent.click(submit);

    expect(
      await screen.findByText("Bedankt voor je review!"),
    ).toBeInTheDocument();
    expect(screen.getByText("Mooie route!")).toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls.at(-1)!;
    expect(String(url)).toMatch(/\/reviews$/);
    expect(JSON.parse(String(init?.body))).toEqual({
      routeID: ROUTE.id,
      rating: 4,
      comment: "Mooie route!",
    });
  });

  it("asks you to log in when the api refuses the review", async () => {
    renderPanel();
    await screen.findByText(ROUTE_REVIEWS[0].text);

    fireEvent.click(screen.getByRole("radio", { name: "5 van 5 sterren" }));
    fireEvent.change(screen.getByLabelText("Jouw ervaring"), {
      target: { value: "Top" },
    });
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 }));
    fireEvent.click(screen.getByRole("button", { name: "Review plaatsen" }));

    expect(
      await screen.findByRole("link", { name: "Log in" }),
    ).toBeInTheDocument();
  });
});
