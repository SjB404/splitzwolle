import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:3000/api";

async function apiPost(path: string, body) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  try {
    const res = await fetch(`${API_BASE}${cleanPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    let json = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    return { status: res.status, body: json };
  } catch (err) {
    return {
      status: 0,
      body: {
        error:
          err instanceof Error
            ? err.message
            : "cannot connect to server",
      },
    };
  }
}

function Toggle({ checked, onChange, id, label }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        checked ? "bg-orange-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Field({ id, label, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        {...props}
      />
    </div>
  );
}

function Alert({ tone = "error", children }) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-orange-50 border-orange-200 text-orange-700",
  };
  return (
    <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles[tone]}`}>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 9 0 9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function RouteMap() {
  const points = [
    [60, 150],
    [150, 60],
    [230, 110],
    [260, 230],
    [110, 255],
  ];
  const path = points.map((p) => p.join(",")).join(" ");

  return (
    <div className="relative rounded-2xl border border-orange-900/20 bg-amber-50 p-6">
      <svg viewBox="0 0 320 300" className="h-64 w-full">
        <polyline
          points={path}
          fill="none"
          stroke="#ea580c"
          strokeWidth="2.5"
          strokeDasharray="7 6"
          strokeLinecap="round"
        />
        {points.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={6} fill="#ea580c" />
        ))}
      </svg>
      <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-500 bg-white text-sm font-semibold text-gray-800">
        N
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginToken, setLoginToken] = useState("");
  const [tokenRequired, setTokenRequired] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loginNotice, setLoginNotice] = useState(null);
  const [loginUser, setLoginUser] = useState(null);
  const [forgotNotice, setForgotNotice] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regTwofa, setRegTwofa] = useState(false);
  const [regError, setRegError] = useState(null);
  const [regResult, setRegResult] = useState(null);


  const [googleStatus, setGoogleStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth") === "success") {
      setGoogleStatus("success");
    } else if (params.get("error") === "google_oauth_failed") {
      setGoogleStatus("error");
    } else {
      return;
    }
    // Clean the query string so a refresh doesn't re-trigger the notice
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const switchMode = (next) => {
    setMode(next);
    setLoginError(null);
    setLoginNotice(null);
    setRegError(null);
    setTokenRequired(false);
    setLoginToken("");
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleLogin = async () => {
    setLoading(true);
    setLoginError(null);
    setLoginNotice(null);
    setLoginUser(null);

    const payload = { email: loginEmail, password: loginPassword };
    const token = loginToken.trim();
    if (token) payload.token = token;

    const { status, body } = await apiPost("/auth/login", payload);
    console.log(body)
    setLoading(false);

    if (body?.twoFactorRequired) {
      setTokenRequired(true);
      setLoginNotice(
        "Dit account heeft 2FA ingeschakeld. Voer je verificatiecode in om door te gaan."
      );
      return;
    }

    if (status >= 200 && status < 300) {
      setLoginUser(body?.user || null);
      return;
    }

    setLoginError(
      body?.error || body?.detail || body?.message || "Inloggen mislukt. Controleer je gegevens."
    );
  };

  const handleRegister = async () => {
    setLoading(true);
    setRegError(null);
    setRegResult(null);

    const payload = {
      name: regName,
      email: regEmail,
      password: regPassword,
      twofa: regTwofa,
      role: "user",
    };

    const { status, body } = await apiPost("/users/register", payload);
    setLoading(false);

    if (status >= 200 && status < 300) {
      setRegResult(body);
      setLoginEmail(regEmail);
      setLoginPassword(regPassword);
    } else {
      setRegError(
        body?.error || body?.detail || body?.message || "Registreren is niet gelukt. Probeer het opnieuw."
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 font-sans md:flex-row">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        .font-sans { font-family: 'Inter', system-ui, sans-serif; }
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      {/* Left / brand panel */}
      <div className="flex w-full flex-col justify-between bg-[#131a2e] px-8 py-12 text-white md:w-1/2 md:px-16 md:py-16">
        <div>
          <p className="text-xs font-semibold tracking-widest text-orange-400">
            Swolla — Zwolle
          </p>
          <h1 className="font-serif mt-3 text-3xl font-bold sm:text-4xl">
            Zwolle Routes
          </h1>

          <div className="mt-8 max-w-md">
            <RouteMap />
            <p className="mt-3 text-sm text-slate-400">
              Historische kaart &amp; huidige route-laag
            </p>
          </div>

          <p className="mt-8 max-w-sm leading-relaxed text-slate-300">
            Ontdek routes langs de mooiste plekken van Zwolle — van de historische Swolla tot de moderne stad. Maak, deel en beleef routes samen met andere gebruikers.
          </p>
        </div>

        <p className="mt-12 text-xs text-slate-500">
          © 2026 Zwolle Routes · Studentproject Deltion College
        </p>
      </div>

      {/* Right / form panel */}
      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-sm">
          {mode === "login" ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900">Inloggen</h2>
              <p className="mt-2 text-sm text-gray-500">
                Welkom terug! Log in om je opgeslagen routes te bekijken.
              </p>

              <div className="mt-8 space-y-4">
                {googleStatus === "success" && (
                  <Alert tone="success">Succesvol ingelogd met Google.</Alert>
                )}
                {googleStatus === "error" && (
                  <Alert tone="error">Inloggen met Google is mislukt. Probeer het opnieuw.</Alert>
                )}

                <Field
                  id="login-email"
                  label="E-mailadres"
                  type="email"
                  placeholder="jij@voorbeeld.nl"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                />

                <div>
                  <Field
                    id="login-password"
                    label="Wachtwoord"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setForgotNotice(true)}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      Wachtwoord vergeten?
                    </button>
                  </div>
                  {forgotNotice && (
                    <p className="mt-1 text-xs text-gray-500">
                      Neem contact op met je docent om je wachtwoord te laten resetten.
                    </p>
                  )}
                </div>

                {tokenRequired && (
                  <Field
                    id="login-token"
                    label="Verificatiecode"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={loginToken}
                    onChange={(e) => setLoginToken(e.target.value)}
                    autoFocus
                  />
                )}

                {loginNotice && <Alert tone="info">{loginNotice}</Alert>}
                {loginError && <Alert tone="error">{loginError}</Alert>}
                {loginUser && (
                  <Alert tone="success">
                    Ingelogd! Welkom terug, {loginUser.name || loginUser.email}.
                  </Alert>
                )}

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading || !loginEmail || !loginPassword}
                  className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Bezig met inloggen…" : "Inloggen"}
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs text-gray-400">of</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <GoogleIcon />
                  Inloggen met Google
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-gray-500">
                Nog geen account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Registreren
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900">Account aanmaken</h2>
              <p className="mt-2 text-sm text-gray-500">
                Maak een account om je eigen routes op te slaan en te delen.
              </p>

              {regResult ? (
                <div className="mt-8 space-y-4">
                  <Alert tone="success">
                    Account aangemaakt. Je kunt nu inloggen.
                  </Alert>

                  {regResult.qrCode && (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-orange-200 bg-amber-50 p-4 text-center">
                      <img
                        src={regResult.qrCode}
                        alt="QR-code voor 2FA"
                        className="h-40 w-40 rounded-lg border border-orange-200 bg-white p-2"
                      />
                      <p className="text-xs text-gray-500">
                        Scan deze QR-code met je authenticator-app om 2FA in te stellen.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                  >
                    Doorgaan naar inloggen
                  </button>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  <Field
                    id="reg-name"
                    label="Naam"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                  />
                  <Field
                    id="reg-email"
                    label="E-mailadres"
                    type="email"
                    placeholder="jij@voorbeeld.nl"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <Field
                    id="reg-password"
                    label="Wachtwoord"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                  />

                  {regError && <Alert tone="error">{regError}</Alert>}

                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
                        2FA
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Tweestapsverificatie (2FA)
                        </p>
                        <p className="text-xs text-gray-500">
                          Extra beveiliging voor je account inschakelen
                        </p>
                      </div>
                      <Toggle
                        id="reg-2fa"
                        label="2FA inschakelen bij registratie"
                        checked={regTwofa}
                        onChange={setRegTwofa}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={loading || !regName || !regEmail || !regPassword}
                    className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Bezig…" : "Account aanmaken"}
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">of</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    <GoogleIcon />
                    Registreren met Google
                  </button>
                </div>
              )}

              <p className="mt-8 text-center text-sm text-gray-500">
                Heb je al een account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Inloggen
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
