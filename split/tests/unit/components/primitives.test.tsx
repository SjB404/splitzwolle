import { fireEvent, render, screen } from "@testing-library/react";
import Icon from "../../../src/components/icon.tsx";
import StarRating from "../../../src/components/starRating.tsx";
import EmptyState from "../../../src/components/emptyState.tsx";
import ClearFiltersButton from "../../../src/components/clearFiltersButton.tsx";

describe("Icon", () => {
  it("renders the glyph name as text, hidden from screen readers", () => {
    const { container } = render(<Icon name="star" />);
    const glyph = container.querySelector("i");

    expect(glyph?.textContent).toBe("star");
    expect(glyph).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards the class name it is given", () => {
    const { container } = render(<Icon name="place" className="text-base" />);

    expect(container.querySelector("i")).toHaveClass("text-base");
  });

  it("works without a class name", () => {
    const { container } = render(<Icon name="place" />);

    expect(container.querySelector("i")).toBeInTheDocument();
  });
});

describe("StarRating", () => {
  it("announces the score in dutch", () => {
    render(<StarRating value={4.9} />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "4,9 van 5 sterren",
    );
  });

  it("always draws five stars", () => {
    const { container } = render(<StarRating value={2} />);

    expect(container.querySelectorAll("i")).toHaveLength(5);
  });

  it("rounds the score to the number of filled stars", () => {
    const { container } = render(<StarRating value={3.5} />);

    expect(container.querySelectorAll("i.fill")).toHaveLength(4);
  });

  it("fills none of them for a zero score", () => {
    const { container } = render(<StarRating value={0} />);

    expect(container.querySelectorAll("i.fill")).toHaveLength(0);
    expect(container.querySelectorAll("i.text-ink-muted")).toHaveLength(5);
  });

  it("fills all of them for a perfect score", () => {
    const { container } = render(<StarRating value={5} />);

    expect(container.querySelectorAll("i.fill")).toHaveLength(5);
  });

  it("takes a class name for its own spacing", () => {
    render(<StarRating value={4} className="mt-2" />);

    expect(screen.getByRole("img")).toHaveClass("mt-2");
  });
});

describe("EmptyState", () => {
  it("renders its icon, title and description", () => {
    const { container } = render(
      <EmptyState
        icon="search"
        title="Geen routes"
        description="Probeer iets anders."
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Geen routes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Probeer iets anders.")).toBeInTheDocument();
    expect(container.querySelector("i")?.textContent).toBe("search");
  });

  it("uses a third level heading inside a section", () => {
    render(
      <EmptyState
        icon="place"
        title="Niets gevonden"
        description="…"
        titleLevel={3}
      />,
    );

    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(
      screen.getByRole("heading", { level: 3, name: "Niets gevonden" }),
    ).toBeInTheDocument();
  });

  it("renders the action it is handed", () => {
    render(
      <EmptyState
        icon="place"
        title="Niets gevonden"
        description="…"
        action={<button type="button">Filters wissen</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Filters wissen" }),
    ).toBeInTheDocument();
  });
});

describe("ClearFiltersButton", () => {
  it("says what it does and calls back", () => {
    const onClick = vi.fn();
    render(<ClearFiltersButton onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Filters wissen" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("takes a class name for its own placement", () => {
    render(<ClearFiltersButton onClick={() => {}} className="ml-auto" />);

    expect(screen.getByRole("button")).toHaveClass("ml-auto");
  });
});
