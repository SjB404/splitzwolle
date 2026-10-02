import { fireEvent, render, screen } from "@testing-library/react";
import FilterSelect from "../../../src/components/filterSelect.tsx";
import SearchField from "../../../src/components/searchField.tsx";
import SectionSearchBar from "../../../src/components/sectionSearchBar.tsx";

describe("FilterSelect", () => {
  const options = [
    { value: "all" as const, label: "Alle thema's" },
    { value: "Wandel" as const, label: "Wandel" },
    { value: "Fiets" as const, label: "Fiets" },
  ];

  it("binds its label to the select and shows the options in order", () => {
    render(
      <FilterSelect
        id="route-theme"
        label="Type route"
        value="all"
        options={options}
        onChange={() => {}}
      />,
    );

    const select = screen.getByLabelText("Type route");

    expect(select).toHaveAttribute("id", "route-theme");
    expect(select).toHaveValue("all");
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Alle thema's", "Wandel", "Fiets"]);
  });

  it("answers with the chosen value", () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        id="route-theme"
        label="Type route"
        value="all"
        options={options}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Type route"), {
      target: { value: "Fiets" },
    });

    expect(onChange).toHaveBeenCalledWith("Fiets");
  });

  it("takes a class name for its grid column", () => {
    const { container } = render(
      <FilterSelect
        id="route-theme"
        label="Type route"
        value="all"
        options={options}
        onChange={() => {}}
        className="s12 m6 l3"
      />,
    );

    expect(container.querySelector(".field")).toHaveClass("s12", "m6", "l3");
  });
});

describe("SearchField", () => {
  it("is a search box whose name comes from the sr-only label", () => {
    render(
      <SearchField
        id="route-search"
        label="Zoek op titel, wijk of thema"
        placeholder="Zoek op titel, wijk of thema…"
        value=""
        onChange={() => {}}
      />,
    );

    const input = screen.getByRole("searchbox", {
      name: "Zoek op titel, wijk of thema",
    });

    expect(input).toHaveAttribute("id", "route-search");
    expect(input).toHaveAttribute(
      "placeholder",
      "Zoek op titel, wijk of thema…",
    );
  });

  it("puts the icon first, as beerCSS requires inside a field", () => {
    const { container } = render(
      <SearchField
        id="x"
        label="Zoek"
        placeholder="Zoek…"
        value=""
        onChange={() => {}}
      />,
    );

    expect(container.querySelector(".field")?.firstElementChild?.tagName).toBe(
      "I",
    );
  });

  it("reports every keystroke", () => {
    const onChange = vi.fn();
    render(
      <SearchField
        id="x"
        label="Zoek"
        placeholder="Zoek…"
        value=""
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "peperbus" },
    });

    expect(onChange).toHaveBeenCalledWith("peperbus");
  });

  it("renders the action slot it is given, and nothing without one", () => {
    const { rerender } = render(
      <SearchField
        id="x"
        label="Zoek"
        placeholder="Zoek…"
        value=""
        onChange={() => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "Wissen" })).toBeNull();

    rerender(
      <SearchField
        id="x"
        label="Zoek"
        placeholder="Zoek…"
        value=""
        onChange={() => {}}
        action={<button type="button">Wissen</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Wissen" })).toBeInTheDocument();
  });
});

describe("SectionSearchBar", () => {
  it("lays out the field, the live count and the action", () => {
    render(
      <SectionSearchBar
        id="home-route-search"
        label="Zoek in de populaire routes"
        placeholder="Zoek op titel, wijk of thema…"
        value=""
        onChange={() => {}}
        resultLabel="3 routes"
        action={<a href="/routes">Alle routes bekijken</a>}
      />,
    );

    expect(
      screen.getByRole("searchbox", { name: "Zoek in de populaire routes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 routes")).toHaveAttribute("aria-live", "polite");
    expect(
      screen.getByRole("link", { name: "Alle routes bekijken" }),
    ).toHaveAttribute("href", "/routes");
  });

  it("reports what is typed", () => {
    const onChange = vi.fn();
    render(
      <SectionSearchBar
        id="home-poi-search"
        label="Zoek in de bezienswaardigheden"
        placeholder="Zoek op naam, wijk of categorie…"
        value=""
        onChange={onChange}
        resultLabel="9 bezienswaardigheden"
        action={null}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "eten" },
    });

    expect(onChange).toHaveBeenCalledWith("eten");
  });
});
