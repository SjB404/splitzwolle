/* the real router, not a MemoryRouter: this is the only test that proves the paths in data/navigation.ts
   are wired to the pages, and that the shell wraps all of them. */

import { render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.tsx";
import {
  LOGIN_PATH,
  PLANNING_PATH,
  POI_PATH,
  ROUTES_PATH,
} from "../../src/data/navigation.ts";
import { ROUTES } from "../../src/data/routes.ts";

/** App brings its own BrowserRouter, so the url is set in the history before it mounts */
function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("the router", () => {
  it("serves the home page inside the shell", async () => {
    renderAt("/");

    expect(
      await screen.findByRole("heading", { level: 1, name: /Ontdek Zwolle/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it.each([
    [ROUTES_PATH, /Stel je route samen/],
    [PLANNING_PATH, /Stel je route samen/],
    [POI_PATH, /Bezienswaardigheden in Zwolle/],
  ])("serves %s", async (path, heading) => {
    renderAt(path);

    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
  });

  it.each(ROUTES.map((route) => [route.id, route.title] as const))(
    "serves the page of %s",
    async (id, title) => {
      renderAt(`${ROUTES_PATH}/${id}`);

      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
          title,
        ),
      );
    },
  );

  it("answers an unknown path with the catch-all page", async () => {
    renderAt("/dit-bestaat-niet");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Deze pagina bestaat niet",
      }),
    ).toBeInTheDocument();
  });

  it("pins the account path, which has no page of its own yet", async () => {
    renderAt(LOGIN_PATH);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Deze pagina bestaat niet",
      }),
    ).toBeInTheDocument();
  });

  it("scrolls to the top on a normal route change", async () => {
    window.scrollTo = vi.fn();
    renderAt("/routes");

    await screen.findByRole("heading", {
      level: 1,
      name: /Stel je route samen/,
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("scrolls to the band a hash names, instead of the top", async () => {
    const target = document.createElement("div");
    target.id = "contact";
    target.scrollIntoView = vi.fn();
    document.body.append(target);

    renderAt("/#contact");

    await screen.findByRole("heading", { level: 1, name: /Ontdek Zwolle/ });

    expect(target.scrollIntoView).toHaveBeenCalled();
    target.remove();
  });
});
