import { render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.tsx";
import {
  LOGIN_PATH,
  PLANNING_PATH,
  POI_PATH,
  ROUTES_PATH,
  publicRoutePath,
} from "../../src/data/navigation.ts";
import { ROUTES } from "../../src/data/routes.ts";

/* App brings its own BrowserRouter; set the url before it mounts */
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
    [POI_PATH, /Bezienswaardigheden in Zwolle/],
  ])("serves %s", async (path, heading) => {
    renderAt(path);

    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
  });

  it("sends the old planning url to the builder", async () => {
    renderAt(PLANNING_PATH);

    await screen.findByRole("heading", {
      level: 1,
      name: /Stel je route samen/,
    });

    expect(window.location.pathname).toBe(ROUTES_PATH);
  });

  it.each(ROUTES.map((route) => [route.id, route.title] as const))(
    "serves the page of %s",
    async (id, title) => {
      renderAt(publicRoutePath(id));

      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
          title,
        ),
      );
    },
  );

  it("sends a route's old url to its own page, so an old link still lands", async () => {
    const route = ROUTES[0];
    renderAt(`${ROUTES_PATH}/${route.id}`);

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        route.title,
      ),
    );
    expect(window.location.pathname).toBe(publicRoutePath(route.id));
  });

  it("answers an unknown path with the catch-all page", async () => {
    renderAt("/dit-bestaat-niet");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Deze pagina bestaat niet",
      }),
    ).toBeInTheDocument();
  });

  it("pins the account path to the login screen", async () => {
    /* offline: the session check must fall through to the form, not hang */
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    try {
      renderAt(LOGIN_PATH);

      expect(
        await screen.findByRole("heading", { level: 1, name: "Zwolle Routes" }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("heading", { level: 2, name: "Inloggen" }),
      ).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
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
