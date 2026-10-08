export const API_BASE = "http://localhost:3000/api";

export const ALERT_STYLES = {
  error: { color: "error-container", icon: "error" },
  success: { color: "tertiary-container", icon: "check_circle" },
  info: { color: "primary-container", icon: "info" },
} as const;


export const ROUTE_POINTS: [number, number][] = [
  [60, 150],
  [150, 60],
  [230, 110],
  [260, 230],
  [110, 255],
];

export const GOOGLE_ICON_PATHS = [
  {
    fill: "#4285F4",
    d: "M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z",
  },
  {
    fill: "#34A853",
    d: "M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z",
  },
  {
    fill: "#FBBC05",
    d: "M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33Z",
  },
  {
    fill: "#EA4335",
    d: "M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 9 0 9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z",
  },
];

export const TEXT = {
  hero: {
    eyebrow: "Swolla — Zwolle",
    title: "Zwolle Routes",
    mapCaption: "Historische kaart & huidige route-laag",
    description:
      "Ontdek routes langs de mooiste plekken van Zwolle — van de historische Swolla tot de moderne stad. Maak, deel en beleef routes samen met andere gebruikers.",
    footer: "© 2026 Zwolle Routes · Studentproject Deltion College",
  },
  login: {
    title: "Inloggen",
    subtitle: "Welkom terug! Log in om je opgeslagen routes te bekijken.",
    emailLabel: "E-mailadres",
    passwordLabel: "Wachtwoord",
    tokenLabel: "Verificatiecode",
    forgotPassword: "Wachtwoord vergeten?",
    forgotNotice:
      "Neem contact op met je docent om je wachtwoord te laten resetten.",
    submit: "Inloggen",
    submitLoading: "Bezig met inloggen…",
    google: "Inloggen met Google",
    noAccount: "Nog geen account?",
    switchToRegister: "Registreren",
    twoFactorNotice:
      "Dit account heeft 2FA ingeschakeld. Voer je verificatiecode in om door te gaan.",
    failed: "Inloggen mislukt. Controleer je gegevens.",
  },
  register: {
    title: "Account aanmaken",
    subtitle: "Maak een account om je eigen routes op te slaan en te delen.",
    nameLabel: "Naam",
    emailLabel: "E-mailadres",
    passwordLabel: "Wachtwoord",
    twofaTitle: "Tweestapsverificatie (2FA)",
    twofaDescription: "Extra beveiliging voor je account inschakelen",
    twofaToggleLabel: "2FA inschakelen bij registratie",
    submit: "Account aanmaken",
    submitLoading: "Bezig…",
    google: "Registreren met Google",
    haveAccount: "Heb je al een account?",
    switchToLogin: "Inloggen",
    success: "Account aangemaakt. Je kunt nu inloggen.",
    qrAlt: "QR-code voor 2FA",
    qrHint: "Scan deze QR-code met je authenticator-app om 2FA in te stellen.",
    continueToLogin: "Doorgaan naar inloggen",
    failed: "Registreren is niet gelukt. Probeer het opnieuw.",
  },
  google: {
    error: "Inloggen met Google is mislukt. Probeer het opnieuw.",
  },
  session: {
    title: "Je bent al ingelogd",
    signedInAs: "Ingelogd als",
    active: "Je hebt een actieve sessie.",
    logout: "Uitloggen",
    loggingOut: "Bezig met uitloggen…",
    logoutFailed: "Uitloggen is niet gelukt.",
  },
  common: {
    or: "of",
    serverUnreachable: "Kan geen verbinding maken met de server.",
  },
  
} as const;