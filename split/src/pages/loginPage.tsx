/* the account screen, the only page outside the shell — neither half is a <main>, or beerCSS's :has(> main) shell would fight its grid */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import PageTitle from "../components/pageTitle.tsx";
import ThemeToggle from "../components/themeToggle.tsx";
import LoginBrandPanel from "../sections/loginBrandPanel.tsx";
import LoginFormPanel, { type AuthMode } from "../sections/loginFormPanel.tsx";

export default function LoginPage() {
  const { hash } = useLocation();
  /* the url decides the mode: the footer's "Registreren" link points at #registreren */
  const [mode, setMode] = useState<AuthMode>(
    hash === "#registreren" ? "register" : "login",
  );
  const isRegister = mode === "register";

  return (
    <div className="relative">
      <PageTitle title={isRegister ? "Account aanmaken" : "Inloggen"} />

      {/* the shell would normally provide this control, so the page brings its own */}
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
