/* the form half of the account screen — one form in two modes; the page owns the mode, because the url decides it, and nothing is submitted (no api yet) */

import { useState } from "react";
import Icon from "../../shared/primitives/icon.tsx";
import TextButton from "../../shared/primitives/textButton.tsx";

/* the two things this panel can be; the page owns the value, because the url decides it */
export type AuthMode = "login" | "register";

interface LoginFormPanelProps {
  mode: AuthMode;
  /* the mode's own union, so a typo cannot switch a form nobody has */
  onModeChange: (mode: AuthMode) => void;
}

export default function LoginFormPanel({
  mode,
  onModeChange,
}: LoginFormPanelProps) {
  const [twoFactor, setTwoFactor] = useState(true);
  const isRegister = mode === "register";

  /* role="main" because this page has no <main>: it opts out of the shell that would provide one */
  return (
    <div role="main" className="s12 l6 surface flex items-center p-8 sm:p-12">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {isRegister ? "Account aanmaken" : "Inloggen"}
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted">
          {isRegister
            ? "Maak een account aan om je routes en planning te bewaren."
            : "Vul je gegevens in om verder te gaan."}
        </p>

        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={(event) => event.preventDefault()}
        >
          {/* the name field only exists while registering: one form with a mode is what keeps the two screens from drifting apart */}
          {isRegister && (
            <div className="field round border label prefix">
              <Icon name="person" />
              <input
                id="login-name"
                type="text"
                placeholder=" "
                autoComplete="name"
              />
              <label htmlFor="login-name">Naam</label>
            </div>
          )}

          <div className="field round border label prefix">
            <Icon name="mail" />
            <input
              id="login-email"
              type="email"
              placeholder=" "
              autoComplete="email"
            />
            <label htmlFor="login-email">E-mailadres</label>
          </div>

          <div className="field round border label prefix">
            <Icon name="lock" />
            <input
              id="login-password"
              type="password"
              placeholder=" "
              /* the browser's password manager gets the right hint */
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
            <label htmlFor="login-password">Wachtwoord</label>
          </div>

          {!isRegister && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="checkbox">
                <input
                  type="checkbox"
                  defaultChecked
                  aria-label="Onthoud mij"
                />
                <span>Onthoud mij</span>
              </label>

              <TextButton className="text-sm">Wachtwoord vergeten?</TextButton>
            </div>
          )}

          <button type="submit" className="ripple">
            {isRegister ? "Account aanmaken" : "Inloggen"}
          </button>

          {!isRegister && (
            <>
              {/* a hairline rule with the word in it; the design has no gradients, so the divider is two borders and a label */}
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="flex-1 border-t border-line" />
                <span className="text-xs uppercase tracking-wider text-ink-muted">
                  of
                </span>
                <span className="flex-1 border-t border-line" />
              </div>

              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    Tweestapsverificatie (2FA)
                  </p>
                  <p className="text-xs text-ink-muted">
                    Vraag een code uit je authenticator-app bij het inloggen.
                  </p>
                </div>

                {/* beerCSS's switch: the input is the invisible hit area and the span draws the track, so the input's own label names it */}
                <label className="switch flex-none">
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(event) =>
                      setTwoFactor(event.currentTarget.checked)
                    }
                    aria-label="Tweestapsverificatie gebruiken bij het inloggen"
                  />
                  <span aria-hidden="true" />
                </label>
              </div>
            </>
          )}

          <p className="text-sm text-ink-muted">
            {isRegister ? "Heb je al een account?" : "Nog geen account?"}{" "}
            <TextButton
              onClick={() => onModeChange(isRegister ? "login" : "register")}
            >
              {isRegister ? "Log hier in" : "Registreer hier"}
            </TextButton>
          </p>
        </form>
      </div>
    </div>
  );
}
