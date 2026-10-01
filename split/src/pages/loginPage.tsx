import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./css/loginPage.css";
import {
  API_BASE,
  ALERT_STYLES,
  ROUTE_POINTS,
  GOOGLE_ICON_PATHS,
  TEXT,
} from "../data/loginData.ts";

const POST_LOGIN_PATH = "/routes";

const SESSION_CHECK_PATH = "/auth/me";
const LOGOUT_PATH = "/auth/logout";

type Mode = "login" | "register";
type AlertTone = keyof typeof ALERT_STYLES;
type GoogleStatus = "success" | "error" | null;
type Session = "checking" | "authed" | "anon";

interface ApiError {
  error?: string;
  detail?: string;
  message?: string;
}

interface User {
  id?: string | number;
  name?: string;
  email?: string;
}

interface LoginResponse extends ApiError {
  twoFactorRequired?: boolean;
  user?: User;
}

interface RegisterResponse extends ApiError {
  qrCode?: string;
}

interface ApiResult<T> {
  status: number;
  body: T | null;
}
interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  id: string;
  label: string;
}

async function apiPost<T extends ApiError>(
  path: string,
  body: unknown
): Promise<ApiResult<T>> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  try {
    const res = await fetch(`${API_BASE}${cleanPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    let json: T | null = null;
    try {
      json = (await res.json()) as T;
    } catch {
      json = null;
    }

    return { status: res.status, body: json };
  } catch (err) {
    return {
      status: 0,
      body: {
        error:
          err instanceof Error ? err.message : "cannot connect to server",
      } as T,
    };
  }
}

async function apiGet<T extends ApiError>(
  path: string
): Promise<ApiResult<T>> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  try {
    const res = await fetch(`${API_BASE}${cleanPath}`, {
      method: "GET",
      credentials: "include",
    });

    let json: T | null = null;
    try {
      json = (await res.json()) as T;
    } catch {
      json = null;
    }

    return { status: res.status, body: json };
  } catch (err) {
    return {
      status: 0,
      body: {
        error:
          err instanceof Error ? err.message : "cannot connect to server",
      } as T,
    };
  }
}


function Toggle({ checked, onChange, id, label }: ToggleProps) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        role="switch"
        id={id}
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span />
    </label>
  );
}


interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function Field({
  id,
  label,
  className = "",
  placeholder,
  ...props
}: FieldProps) {
  return (
    <div className={className}>
      <div className="field label border round">
        <input id={id} className="active" placeholder=" " {...props} />
        <label htmlFor={id} className="active">{label}</label>
        {placeholder && <span className="helper">{placeholder}</span>}
      </div>
    </div>
  );
}

interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
}
function Alert({ tone = "error", children }: AlertProps) {
  const { color, icon } = ALERT_STYLES[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`row round small-padding middle-align ${color}`}
    >
      <i>{icon}</i>
      <div className="max small-text">{children}</div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      {GOOGLE_ICON_PATHS.map((p) => (
        <path key={p.fill} fill={p.fill} d={p.d} />
      ))}
    </svg>
  );
}

function RouteMap() {
  const points = ROUTE_POINTS;
  const path = points.map((p) => p.join(",")).join(" ");

  return (
    <div className="relative round border surface-container-high p-6">
      <svg viewBox="0 0 320 300" className="h-64 w-full">
        <polyline
          points={path}
          fill="none"
          style={{ stroke: "var(--primary)" }}
          strokeWidth="2.5"
          strokeDasharray="7 6"
          strokeLinecap="round"
        />
        {points.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={6}
            style={{ fill: "var(--primary)" }}
          />
        ))}
      </svg>
      <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border surface text-sm font-semibold">
        N
      </div>
    </div>
  );
}

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
}

function SubmitButton({
  onClick,
  disabled,
  loading,
  children,
}: SubmitButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cta responsive large round"
    >
      {loading && <progress className="circle small" />}
      <span>{children}</span>
    </button>
  );
}

function OrDivider() {
  return (
    <div className="row middle-align">
      <hr className="max" />
      <span className="small-text">{TEXT.common.or}</span>
      <hr className="max" />
    </div>
  );
}


export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState<boolean>(false);

  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginToken, setLoginToken] = useState<string>("");
  const [tokenRequired, setTokenRequired] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [loginUser, setLoginUser] = useState<User | null>(null);
  const [forgotNotice, setForgotNotice] = useState<boolean>(false);

  const [regName, setRegName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regTwofa, setRegTwofa] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regResult, setRegResult] = useState<RegisterResponse | null>(null);

  const [googleStatus, setGoogleStatus] = useState<GoogleStatus>(null);

  const [session, setSession] = useState<Session>("checking");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth") === "success") {
      navigate(POST_LOGIN_PATH, { replace: true });
      return;
    } else if (params.get("error") === "google_oauth_failed") {
      setGoogleStatus("error");
    } else {
      return;
    }
    window.history.replaceState({}, "", window.location.pathname);
  }, [navigate]);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status, body } = await apiGet<LoginResponse>(SESSION_CHECK_PATH);
      if (cancelled) return;
      if (status >= 200 && status < 300) {
        setCurrentUser(body?.user ?? null);
        setSession("authed");
      } else {
        setSession("anon");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const switchMode = (next: Mode) => {
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

    const payload = {
      email: loginEmail,
      password: loginPassword,
      token: loginToken.trim(),
    };

    const { status, body } = await apiPost<LoginResponse>(
      "/auth/login",
      payload
    );
    setLoading(false);

    if (body?.twoFactorRequired) {
      setTokenRequired(true);
      setLoginNotice(TEXT.login.twoFactorNotice);
      return;
    }

    if (status >= 200 && status < 300) {
      setLoginUser(body?.user ?? null);
      navigate(POST_LOGIN_PATH, { replace: true });
      return;
    }

    setLoginError(
      body?.error ||
        body?.detail ||
        body?.message ||
        TEXT.login.failed
    );
  };

  const handleLogout = async () => {
    setLoading(true);
    setLogoutError(null);

    const { status, body } = await apiPost<ApiError>(LOGOUT_PATH, {});
    setLoading(false);

    if (status >= 200 && status < 300) {
      setSession("anon");
      setCurrentUser(null);
      setLoginUser(null);
      setLoginPassword("");
      setLoginToken("");
      setTokenRequired(false);
      setGoogleStatus(null);
      setMode("login");
    } else {
      setLogoutError(
        body?.error || body?.detail || body?.message || "Could not log out."
      );
    }
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

    const { status, body } = await apiPost<RegisterResponse>(
      "/users/register",
      payload
    );
    setLoading(false);

    if (status >= 200 && status < 300) {
      setRegResult(body ?? {});
      setLoginEmail(regEmail);
      setLoginPassword(regPassword);
    } else {
      setRegError(
        body?.error ||
          body?.detail ||
          body?.message ||
          TEXT.register.failed
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col font-sans md:flex-row">

      <div className="inverse-surface flex w-full flex-col justify-between px-8 py-12 md:w-1/2 md:px-16 md:py-16">
        <div>
          <p className="inverse-primary-text text-xs font-semibold tracking-widest">
            {TEXT.hero.eyebrow}
          </p>
          <h1 className="font-heading mt-3 text-3xl font-bold sm:text-4xl">
            {TEXT.hero.title}
          </h1>

          <div className="mt-8 max-w-md">
            <RouteMap />
            <p className="mt-3 text-sm opacity-70">
              {TEXT.hero.mapCaption}
            </p>
          </div>

          <p className="mt-8 max-w-sm leading-relaxed opacity-80">
            {TEXT.hero.description}
          </p>
        </div>

        <p className="mt-12 text-xs opacity-60">
          {TEXT.hero.footer}
        </p>
      </div>


      <div className="right-panel flex w-full flex-1 items-center justify-center px-6 py-12 md:w-1/2">
        <div className="auth-card w-full max-w-md">
          {session === "checking" ? (
            <div className="center-align" aria-busy="true">
              <progress className="circle" />
            </div>
          ) : session === "authed" ? (
            <>
              <div className="auth-badge"><i>logout</i></div>
              <h2 className="font-heading text-3xl font-bold">
                You're already logged in
              </h2>
              <p className="mt-2 text-sm opacity-70">
                {currentUser?.name || currentUser?.email
                  ? `Signed in as ${currentUser.name || currentUser.email}.`
                  : "You have an active session."}
              </p>

              <div className="mt-8 space-y-4">
                {logoutError && <Alert tone="error">{logoutError}</Alert>}

                <SubmitButton
                  onClick={handleLogout}
                  disabled={loading}
                  loading={loading}
                >
                  {loading ? "Logging out..." : "Log out"}
                </SubmitButton>
              </div>
            </>
          ) : mode === "login" ? (
            <>
              <div className="auth-badge"><i>route</i></div>
              <h2 className="font-heading text-3xl font-bold">{TEXT.login.title}</h2>
              <p className="mt-2 text-sm opacity-70">
                {TEXT.login.subtitle}
              </p>

              <div className="mt-8 space-y-4">
                {googleStatus === "success" && (
                  <Alert tone="success">{TEXT.google.success}</Alert>
                )}
                {googleStatus === "error" && (
                  <Alert tone="error">{TEXT.google.error}</Alert>
                )}

                <Field
                  id="login-email"
                  label={TEXT.login.emailLabel}
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                />

                <div>
                  <Field
                    id="login-password"
                    label={TEXT.login.passwordLabel}
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotNotice(true)}
                      className="transparent small"
                    >
                      {TEXT.login.forgotPassword}
                    </button>
                  </div>
                  {forgotNotice && (
                    <p className="mt-1 text-xs opacity-70">
                      {TEXT.login.forgotNotice}
                    </p>
                  )}
                </div>

                {tokenRequired && (
                  <Field
                    id="login-token"
                    label={TEXT.login.tokenLabel}
                    inputMode="numeric"
                    maxLength={6}
                    value={loginToken}
                    onChange={(e) => setLoginToken(e.target.value)}
                    autoFocus
                  />
                )}

                {loginNotice && <Alert tone="info">{loginNotice}</Alert>}
                {loginError && <Alert tone="error">{loginError}</Alert>}
                {loginUser && (
                  <Alert tone="success">
                    {TEXT.login.success} {loginUser.name || loginUser.email}.
                  </Alert>
                )}

                <SubmitButton
                  onClick={handleLogin}
                  disabled={loading || !loginEmail || !loginPassword}
                  loading={loading}
                >
                  {loading ? TEXT.login.submitLoading : TEXT.login.submit}
                </SubmitButton>

                <OrDivider />

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="google responsive large round border"
                >
                  <GoogleIcon />
                  <span>{TEXT.login.google}</span>
                </button>
              </div>

              <div className="row center-align middle-align mt-8">
                <span className="small-text opacity-70">{TEXT.login.noAccount}</span>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="transparent small"
                >
                  {TEXT.login.switchToRegister}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-badge"><i>person_add</i></div>
              <h2 className="font-heading text-3xl font-bold">{TEXT.register.title}</h2>
              <p className="mt-2 text-sm opacity-70">
                {TEXT.register.subtitle}
              </p>

              {regResult ? (
                <div className="mt-8 space-y-4">
                  <Alert tone="success">
                    {TEXT.register.success}
                  </Alert>

                  {regResult.qrCode && (
                    <div className="flex flex-col items-center gap-3 round border surface-container p-4 text-center">
                      <img
                        src={regResult.qrCode}
                        alt={TEXT.register.qrAlt}
                        className="h-40 w-40 rounded-lg bg-white p-2"
                      />
                      <p className="text-xs opacity-70">
                        {TEXT.register.qrHint}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="responsive large round"
                  >
                    {TEXT.register.continueToLogin}
                  </button>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  <Field
                    id="reg-name"
                    label={TEXT.register.nameLabel}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    autoComplete="name"
                  />
                  <Field
                    id="reg-email"
                    label={TEXT.register.emailLabel}
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <Field
                    id="reg-password"
                    label={TEXT.register.passwordLabel}
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                  />

                  {regError && <Alert tone="error">{regError}</Alert>}

                  <div className="round primary-container p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full primary text-xs font-bold">
                        2FA
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {TEXT.register.twofaTitle}
                        </p>
                        <p className="text-xs opacity-70">
                          {TEXT.register.twofaDescription}
                        </p>
                      </div>
                      <Toggle
                        id="reg-2fa"
                        label={TEXT.register.twofaToggleLabel}
                        checked={regTwofa}
                        onChange={setRegTwofa}
                      />
                    </div>
                  </div>

                  <SubmitButton
                    onClick={handleRegister}
                    disabled={loading || !regName || !regEmail || !regPassword}
                    loading={loading}
                  >
                    {loading ? TEXT.register.submitLoading : TEXT.register.submit}
                  </SubmitButton>

                  <OrDivider />

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="google responsive large round border"
                  >
                    <GoogleIcon />
                    <span>{TEXT.register.google}</span>
                  </button>
                </div>
              )}

              <div className="row center-align middle-align mt-8">
                <span className="small-text opacity-70">{TEXT.register.haveAccount}</span>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="transparent small"
                >
                  {TEXT.register.switchToLogin}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
