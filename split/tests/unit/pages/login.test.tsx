import { screen } from "@testing-library/react";
import LoginPage from "../../../src/pages/loginPage.tsx";
import { TEXT } from "../../../src/data/loginData.ts";
import { renderWithRouter } from "../helpers.tsx";

/* the page checks the session on mount; an offline fetch keeps it on its forms */
function renderLogin(hash: string) {
  window.location.hash = hash;
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

  return renderWithRouter(<LoginPage />);
}

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("LoginPage", () => {
  it("opens the login form when the url carries no hash", async () => {
    renderLogin("");

    expect(
      await screen.findByRole("heading", { level: 2, name: TEXT.login.title }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: TEXT.register.title }),
    ).not.toBeInTheDocument();
  });

  it("opens the register form when the url says #registreren", async () => {
    renderLogin("#registreren");

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: TEXT.register.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: TEXT.login.title }),
    ).not.toBeInTheDocument();
  });
});
