/*
loginformpanel — the form half of the account screen.

one form, two modes: logging in and registering. mode comes from the page, because
the url decides it (/inloggen#registreren is where the footer's "Registreren" link
points). a mode held here could disagree with the address bar.

nothing is submitted: there is no api yet, and the backend belongs to somebody
else. the fields are uncontrolled because nothing reads them back.

the 2fa switch is the exception. it is a real toggle the reader can flip, so it
holds its own state, and the input's own label names it.
*/

import { useState } from "react";
import Icon from "../components/icon.jsx";
import TextButton from "../components/textButton.jsx";

export default function LoginFormPanel({ mode, onModeChange }) {
  const [twoFactor, setTwoFactor] = useState(true);
  const isRegister = mode === "register";

  return (
    <div role="main" className="s12 l6 surface flex items-center p-8 sm:p-12">
      {/* role="main" is here because this page has no <main>: it opts out of the shell
          that would provide one */}
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
          {/* the name field only exists while registering: one form with a mode is what
              keeps the two screens from drifting apart */}
          {isRegister && (
            <div className="field round border label prefix">
              <Icon name="person" />
              <input id="login-name" type="text" placeholder=" " autoComplete="name" />
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
              /* the browser's password manager gets the right hint: a new password
                 while registering, the current one while logging in */
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
            <label htmlFor="login-password">Wachtwoord</label>
          </div>

          {!isRegister && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="checkbox">
                <input type="checkbox" defaultChecked aria-label="Onthoud mij" />
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
              {/* a hairline rule with the word in it. the design has no gradients, so the
                  divider is two borders and a label */}
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

                {/* beerCSS's switch: the input is the invisible hit area and the span
                    next to it draws the track and the knob. the span holds only a
                    decorative ligature, so the input's own label names it. */}
                <label className="switch flex-none">
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(event) => setTwoFactor(event.currentTarget.checked)}
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
