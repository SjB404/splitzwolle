import { fireEvent, screen, waitFor } from "@testing-library/react";
import RoutesPage from "../../../src/pages/routesPage.tsx";
import { renderWithRouter } from "../helpers.tsx";

/* the cards are the only links into a route's own page on this screen */
const cardLinks = () =>
  screen
    .queryAllByRole("link")
    .filter((link) => (link.getAttribute("href") ?? "").startsWith("/routes/"));

describe("RoutesPage", () => {
  it("heads the page and explains what the area covers", () => {
    renderWithRouter(<RoutesPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Stel je route samen" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Stel je route samen · Zwolle Routes");
  });

  it("offers every place in the area and the two ways of travelling", () => {
    renderWithRouter(<RoutesPage />);

    expect(screen.getByRole("button", { name: "Lopen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fietsen" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sassenpoort" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "De Librije" }),
    ).toBeInTheDocument();
  });

  it("asks for a second place before it draws anything", () => {
    renderWithRouter(<RoutesPage />);

    expect(
      screen.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeInTheDocument();
    expect(screen.getByText("9 plekken in de binnenstad")).toBeInTheDocument();
  });

  it("falls back to a panel when the map api is off", () => {
    const { container } = renderWithRouter(<RoutesPage />);

    expect(
      screen.getByText(/De kaart kon niet geladen worden/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Probeer het later opnieuw/)).toBeInTheDocument();
    /* no google dom anywhere on the page */
    expect(container.querySelector('[class*="gm-style"]')).toBeNull();
  });

  it("shows a page of ready-made routes", () => {
    renderWithRouter(<RoutesPage />);

    expect(cardLinks()).toHaveLength(6);
    expect(screen.getByText("6 van 8 routes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Toon meer routes" }),
    ).toBeInTheDocument();
  });

  it("expands the list on demand", () => {
    renderWithRouter(<RoutesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Toon meer routes" }));

    expect(cardLinks()).toHaveLength(8);
    expect(
      screen.queryByRole("button", { name: "Toon meer routes" }),
    ).toBeNull();
  });

  it("filters the list and collapses it again", async () => {
    renderWithRouter(<RoutesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Toon meer routes" }));
    expect(cardLinks()).toHaveLength(8);

    fireEvent.change(screen.getByLabelText("Moeilijkheid"), {
      target: { value: "Gemiddeld" },
    });

    expect(screen.getByText("3 routes gevonden")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Toon meer routes" }),
    ).toBeNull();
    await waitFor(() => expect(cardLinks()).toHaveLength(3));
  });

  it("resets the filters back to every route", async () => {
    renderWithRouter(<RoutesPage />);

    fireEvent.change(screen.getByLabelText("Type route"), {
      target: { value: "Natuur" },
    });
    await waitFor(() => expect(cardLinks()).toHaveLength(1));

    fireEvent.click(screen.getByRole("button", { name: "Filters wissen" }));

    expect(screen.getByText("8 routes gevonden")).toBeInTheDocument();
    await waitFor(() => expect(cardLinks()).toHaveLength(6));
  });

  it("adds a place to the route and numbers it on the map", () => {
    renderWithRouter(<RoutesPage />);

    fireEvent.click(screen.getByRole("button", { name: "De Peperbus" }));

    expect(screen.getByText("1 van 9 plekken")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "1. De Peperbus" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Kies nog een plek: een route heeft minstens twee stopplaatsen.",
      ),
    ).toBeInTheDocument();
  });

  it("works the route out as soon as there are two places", async () => {
    renderWithRouter(<RoutesPage />);

    fireEvent.click(screen.getByRole("button", { name: "De Peperbus" }));
    fireEvent.click(screen.getByRole("button", { name: "Sassenpoort" }));

    expect(
      screen.getByRole("heading", { level: 3, name: "2 stopplaatsen, lopen" }),
    ).toBeInTheDocument();

    /* the routes api is not reachable in the tests, so the summary says the numbers are an estimate */
    expect(await screen.findByText(/Hemelsbreed geschat/)).toBeInTheDocument();
    expect(screen.getByText("2 van 9 plekken")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open in Google Maps" }),
    ).toBeInTheDocument();
  });

  it("switches the way of travelling", async () => {
    renderWithRouter(<RoutesPage />);

    fireEvent.click(screen.getByRole("button", { name: "De Peperbus" }));
    fireEvent.click(screen.getByRole("button", { name: "Melkmarkt" }));
    fireEvent.click(screen.getByRole("button", { name: "Fietsen" }));

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "2 stopplaatsen, fietsen",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fietsen" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await screen.findByText(/Hemelsbreed geschat/)).toBeInTheDocument();
  });

  it("clears the picked places again", () => {
    renderWithRouter(<RoutesPage />);

    fireEvent.click(screen.getByRole("button", { name: "De Peperbus" }));
    fireEvent.click(screen.getByRole("button", { name: "Sassenpoort" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "Selectie wissen" })[0],
    );

    expect(
      screen.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeInTheDocument();
    expect(screen.getByText("9 plekken in de binnenstad")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Selectie wissen" }),
    ).toBeNull();
  });

  it("seeds the route with the places handed over in the url", () => {
    renderWithRouter(<RoutesPage />, "/routes?plek=peperbus&plek=melkmarkt");

    expect(screen.getByText("2 van 9 plekken")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "1. De Peperbus" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "2. Melkmarkt" }),
    ).toBeInTheDocument();
  });

  it("ignores a place in the url that does not exist", () => {
    renderWithRouter(<RoutesPage />, "/routes?plek=kayakverhuur");

    expect(
      screen.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Selectie wissen" }),
    ).toBeNull();
  });
});
