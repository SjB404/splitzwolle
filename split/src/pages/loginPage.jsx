/*
loginpage — the account screen, and the only page outside the app shell.

it is a split screen instead of a band above content: LoginBrandPanel is the band the
rest of the app uses for its page headers, LoginFormPanel is the form. at 993px and
up the two halves are 6 + 6 of the 12 column grid; below that they stack, brand
first.

the page owns the one thing they share, which mode the form is in, because the url
decides it: /inloggen#registreren is where the footer's "Registreren" link points, so
opening the page from there has to open the registration form.

neither half is a <main>. beerCSS gives any element that :has(> main) an app shell,
which would fight this page's own grid, so the form half carries role="main" instead
and the landmark still exists.
*/

import { useState } from "react";
import { useLocation } from "react-router-dom";
import PageTitle from "../components/pageTitle.jsx";
import ThemeToggle from "../components/themeToggle.jsx";
import LoginBrandPanel from "../sections/loginBrandPanel.jsx";
import LoginFormPanel from "../sections/loginFormPanel.jsx";

export default function LoginPage() {
  const { hash } = useLocation();
  const [mode, setMode] = useState(hash === "#registreren" ? "register" : "login");
  const isRegister = mode === "register";

  return (
    <div className="relative">
      <PageTitle title={isRegister ? "Account aanmaken" : "Inloggen"} />

      {/* the theme switch is the one control the shell would normally provide, so this
          page brings its own */}
      <div className="absolute right-5 top-5 z-10 text-ink sm:right-8">
        <ThemeToggle />
      </div>

      <div className="grid min-h-svh">
        <LoginBrandPanel />
        <LoginFormPanel mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
}
