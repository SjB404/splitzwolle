import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar, {
  NAV_LINKS,
  THEME_STORAGE_KEY,
} from "../../../src/components/navbar.tsx";
import Footer, {
  CONTACT_DETAILS,
  FOOTER_COLUMNS,
} from "../../../src/components/footer.tsx";
import PageTitle from "../../../src/components/pageTitle.tsx";
import Container from "../../../src/components/container.tsx";
import SectionHeading from "../../../src/components/sectionHeading.tsx";
import { LOGIN_PATH } from "../../../src/data/navigation.ts";
import { renderWithRouter } from "../helpers.tsx";

describe("the bar's theme switch", () => {
  const themeButton = () =>
    screen.getByRole("button", { name: /Schakel naar (donker|licht) thema/ });

  function renderBar(route = "/routes") {
    return renderWithRouter(<Navbar />, route);
  }

  it("starts light and says what a click will do", () => {
    renderBar();
    const button = themeButton();

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAccessibleName("Schakel naar donker thema");
    expect(document.body.classList.contains("light")).toBe(true);
  });

  it("flips the palette on <body> and remembers the choice", () => {
    renderBar();
    const button = themeButton();

    fireEvent.click(button);

    expect(document.body.classList.contains("dark")).toBe(true);
    expect(document.body.classList.contains("light")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAccessibleName("Schakel naar licht thema");
  });

  it("flips back on a second click", () => {
    renderBar();
    const button = themeButton();

    fireEvent.click(button);
    fireEvent.click(button);

    expect(document.body.classList.contains("light")).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("starts dark when that is what was stored", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    renderBar();

    expect(document.body.classList.contains("dark")).toBe(true);
    expect(themeButton()).toHaveAttribute("aria-pressed", "true");
  });

  it("falls back to light for a value it does not know", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "paars");

    renderBar();

    expect(document.body.classList.contains("light")).toBe(true);
  });
});

describe("PageTitle", () => {
  it("writes the page title with the site's suffix", () => {
    render(<PageTitle title="Stel je route samen" />);

    expect(document.title).toBe("Stel je route samen · Zwolle Routes");
  });

  it("replaces the previous title", () => {
    const { rerender } = render(<PageTitle title="Home" />);
    expect(document.title).toBe("Home · Zwolle Routes");

    rerender(<PageTitle title="Routes" />);
    expect(document.title).toBe("Routes · Zwolle Routes");
  });

  it("renders nothing of its own", () => {
    const { container } = render(<PageTitle title="Home" />);

    expect(container.firstChild).toBeNull();
  });
});

describe("Container and SectionHeading", () => {
  it("puts the page gutter on its children", () => {
    const { container } = render(
      <Container className="extra">inhoud</Container>,
    );

    expect(container.firstElementChild).toHaveClass(
      "px-gutter",
      "mx-auto",
      "extra",
    );
    expect(container.firstElementChild).toHaveTextContent("inhoud");
  });

  it("renders a second level heading with its eyebrow, text and action", () => {
    render(
      <SectionHeading
        eyebrow="Kant-en-klaar"
        title="Routes door de binnenstad"
        description="Rondjes die anderen al liepen."
        action={<a href="/routes">Alles</a>}
      />,
    );

    expect(screen.getByText("Kant-en-klaar")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Routes door de binnenstad",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Alles" })).toBeInTheDocument();
  });

  it("leaves out what it was not given", () => {
    render(<SectionHeading title="Alleen een titel" />);

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Alleen een titel",
    );
  });
});

describe("Navbar", () => {
  function renderNavbar(route = "/routes") {
    return renderWithRouter(<Navbar />, route);
  }

  it("links the brand name at the home page", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: "Zwolle Routes" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("shows every nav link", () => {
    renderNavbar();

    for (const link of NAV_LINKS) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.to,
      );
    }
  });

  it("marks the page you are on, and only that one", () => {
    renderNavbar("/points-of-interest");

    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");

    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName("Bezienswaardigheden");
  });

  it("keeps the parent link active on a route's own page", () => {
    renderNavbar("/routes/binnenstad-highlights");

    expect(screen.getByRole("link", { name: "Routes" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("offers a search link and the account link, both with a spoken name", () => {
    renderNavbar();

    expect(
      screen.getByRole("link", { name: "Zoek een route" }),
    ).toHaveAttribute("href", "/routes");
    expect(
      screen.getByRole("link", { name: "Inloggen op je account" }),
    ).toHaveAttribute("href", LOGIN_PATH);
  });

  it("opens and closes the mobile menu, reporting its state", () => {
    renderNavbar();
    const menu = screen.getByRole("button", { name: "Menu" });

    expect(menu).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("link", { name: "Routes" })).toHaveLength(1);

    fireEvent.click(menu);

    expect(menu).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: "Routes" })).toHaveLength(2);

    /* the panel unmounts only after motion's exit frame; the state is the contract here */
    fireEvent.click(menu);

    expect(menu).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the mobile menu after a link is followed", () => {
    renderNavbar();
    const menu = screen.getByRole("button", { name: "Menu" });
    const target = NAV_LINKS.filter((link) => !link.to.includes("#")).at(-1)!;

    fireEvent.click(menu);
    fireEvent.click(screen.getAllByRole("link", { name: target.label })[1]);

    expect(menu).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Footer", () => {
  function renderFooter() {
    return renderWithRouter(<Footer />, "/");
  }

  it("is the contact band the #contact hash still lands on", () => {
    const { container } = renderFooter();

    expect(container.querySelector("footer#contact")).toBeInTheDocument();
  });

  it("groups its links under spoken headings", () => {
    renderFooter();

    expect(
      screen.getByRole("navigation", { name: "Navigatie" }),
    ).toBeInTheDocument();

    const account = screen.getByRole("navigation", { name: "Account" });

    expect(
      within(account)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(FOOTER_COLUMNS[1].links.map((link) => link.to));
  });

  it("prints reachable contact details", () => {
    renderFooter();

    expect(
      screen.getByRole("link", { name: CONTACT_DETAILS.email }),
    ).toHaveAttribute("href", `mailto:${CONTACT_DETAILS.email}`);
    expect(
      screen.getByRole("link", { name: CONTACT_DETAILS.phone }),
    ).toHaveAttribute("href", `tel:${CONTACT_DETAILS.phoneHref}`);
    expect(screen.getByText(CONTACT_DETAILS.address)).toBeInTheDocument();
  });

  it("carries the year in its copyright line", () => {
    renderFooter();

    expect(
      screen.getByText(
        new RegExp(`© ${new Date().getFullYear()} Zwolle Routes`),
      ),
    ).toBeInTheDocument();
  });

  it("names the brand and what the site is for", () => {
    renderFooter();

    expect(screen.getByText("Zwolle Routes")).toBeInTheDocument();
    expect(
      screen.getByText(/historische kaartlaag naast de actuele plattegrond/),
    ).toBeInTheDocument();
  });
});

describe("MemoryRouter sanity", () => {
  it("renders the router it is given", () => {
    render(
      <MemoryRouter initialEntries={["/routes"]}>
        <p>routes</p>
      </MemoryRouter>,
    );

    expect(screen.getByText("routes")).toBeInTheDocument();
  });
});
