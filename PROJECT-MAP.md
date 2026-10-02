# Project map — how this codebase actually works

Written for a human taking over AI-generated code. Everything here was verified by reading the
files and running the commands noted. Where something is broken, it says so plainly.

---

## 1. What this is

**splitzwolle / "Zwolle Routes"** — a Dutch-language route planner for walking and cycling through
Zwolle, with a historic map layer beside the present-day map.

Three parts live in this repo, and only the first one is real:

| Part | State | Notes |
| --- | --- | --- |
| React frontend | **Real and complete** | one flat `src/components/` folder, every component in its own file where it earns one; the Vitest + Playwright suites covered it before the current merge, and a handful of tests still describe the pre-merge login/planning urls |
| Express backend | **A stub that cannot even start** | 40 lines, no endpoints, imports two packages that are not installed |
| Docs | **Genuinely good** | `docs/DESIGN.md` is 1700+ lines of real design decisions |

Crucially: **the frontend never talks to the backend.** There is no `fetch`, no API base URL, no
client. All content is hardcoded TypeScript/JSON in `src/data/`. That is why the app works today.

---

## 2. The one thing that confuses everyone first

**The Vite project root is `split/`, not the repo root.**

```
C:\Users\Arch\Documents\Coding\split\   <- repo root == git root == workspace root
├── README.md                           <- the real entry point
├── PROJECT-MAP.md                      <- this file
├── docs/                               <- design system + test plan + backend placeholders
├── .github/                            <- AI instructions (copilot-instructions.md)
└── split/                              <- THE ACTUAL PROJECT
    ├── .env.local                      <- the Google Maps API key (gitignored)
    ├── package.json
    ├── index.html                      <- Vite entry, theme bootstrap
    ├── src/
    │   ├── components/                 <- every component, one flat folder
    │   ├── pages/                      <- one file per route
    │   ├── data/                       <- content + logic (no components)
    │   ├── App.tsx                     <- the router and the shell
    │   └── types.ts                    <- the domain vocabulary
    ├── tests/
    └── backend/index.mjs               <- the Express stub
```

There is only one `package.json`.

Run everything from the **repo root**:

```bash
npm --prefix split install
npm --prefix split run dev        # http://localhost:5173
npm --prefix split run build
npm --prefix split run lint
npm --prefix split run test       # unit + component (vitest)
npm --prefix split run test:e2e   # browser (playwright)
```

> **Trap I hit:** npm resolves `--prefix` **relative to the current working directory**, so
> `split` only works from the repo root. From inside `split/` the path doubles and you get
> `ENOENT ... split\split\package.json`. If a command is failing with a doubled path, check
> where your shell is.

---

## 3. The mental model: one-way data flow

```
types.ts                    <- the domain vocabulary (Route, PointOfInterest, filter state)
    ↑
src/data/*.ts               <- CONTENT + RULES + LOGIC. All hardcoded. No network calls.
    ↑
src/pages/*Page.tsx         <- owns the route, the shared state, the component order
    ↑
src/components/*.tsx        <- every component, one flat folder; a piece used once inside
                               another component is written out in that component's file
```

**Rules that hold everywhere:**

- **Data flows up, never down.** `src/data/` is the only place content is produced. Components
  never hold content.
- **A page is a table of contents.** Look at `homePage.tsx` — 18 lines: set the title, list the
  bands. That is the whole pattern.
- **Bands own markup, pages own state.**
- **A piece earns its own file by being used twice, or by owning a whole band.** One caller: it is
  written out in the caller's file. A second caller: it moves to `src/components/`.
- **The URL is the state** for the route builder — see §5.

### The two files to read first

1. `split/src/types.ts` — 186 lines, defines every concept. Read it top to bottom and you know
   the domain.
2. `split/src/App.tsx` — the whole routing table, plus the shell (bar → `main` → footer) and the
   scroll-to-top effect, both written out in the same file because nothing else uses them.

Then: `split/src/pages/routesPage.tsx` — the most complex page and the best single
example of the architecture.

---

## 4. The real pages

| URL | Page file | What it does |
| --- | --- | --- |
| `/` | `src/pages/homePage.tsx` | hero + two preview strips |
| `/routes` | `src/pages/routesPage.tsx` | route builder + list of ready-made routes |
| `/routes/custom/<place-ids>` | same page | the builder, with places pre-picked |
| `/routes/public/<route-id>` | same page | one ready-made route + its reviews |
| `/points-of-interest` | `src/pages/pointsOfInterestPage.tsx` | filterable place list + shared map |
| anything else | `src/pages/notFoundPage.tsx` | 404 |

`/routes/<id>` (the old shape) redirects. `/planning` redirects. **`/inloggen` has no page** — the
navbar avatar and the footer's Account column both land on the 404. This is a known, documented gap.

---

## 5. The clever bit: the URL is the state

The route builder stores **nothing**. The picked places live in the URL:
`/routes/custom/peperbus,sassenpoort` -> the walk from the Peperbus to the Sassenpoort.

- `src/data/navigation.ts` — **every path in the app**, once. Renaming a URL re-points the router,
  the navbar and the footer together. `builderPath(ids)` writes the URL, `parsePlaceIds(segment)`
  reads it back.
- Picking a place calls `navigate(builderPath(next))`.
- Result: the share button, a copied link, and the browser back button all agree with **zero**
  synchronization code.

The other persisted state is `localStorage`:

- `zwolle-routes:saved` -> saved route ids (`src/data/savedRoutes.ts`, 68 lines, worth reading as a
  clean example of external-store syncing via a window event)
- `zwolle-routes:theme` -> light/dark (`src/components/navbar.tsx`, the bar's own theme switch)

---

## 6. Maps — how they degrade

`src/data/googleMaps.ts` is the only file that touches Google. It owns the script tag, the
key, the options, the colours and the API calls.

**The design rule: every service degrades, never breaks.**

| Situation | What happens |
| --- | --- |
| No `VITE_GOOGLE_MAPS_API_KEY` | every map is replaced by a fallback panel that says so |
| Key rejected / no billing | `gm_authFailure` fires, listeners are told, UI falls back |
| Routes API not enabled on the key | first refusal is remembered for the session; every route becomes a straight line x 1.25 |
| Static Maps API off | cards draw the route shape from its own coordinates instead of a picture |

This is why the tests pass without a key — **the fallback is the tested behaviour**, and the live
tiles are checked by hand at localhost:5173.

---

## 7. Toolchain health (verified just now)

| Command | Result |
| --- | --- |
| `npm run lint` (oxlint) | 0 errors; warnings only — the backend stub's unused vars and one `set-state-in-effect` in `loginPage.tsx`, all expected |
| `npm run build` | `tsc -b` still reports pre-existing type errors: `tsconfig.node.json` type-checks all of `src/**/*.ts` without the DOM lib (so `data/*.ts` fails there), and that project has no declaration for the `*.webp` imports |
| `npm run test` | 433 tests, 7 failing — each one still describes the **pre-merge** login url (`/inloggen`) or nav copy (`Bezienswaardigheden` vs `Points of Interest`); nothing in `src/` depends on them |
| Secrets in git | **clean** — `.env.local` has never been committed, no key in any tracked file |

`npm run lint` proves the whole source tree parses and the imports resolve.

---

## 8. Things that are actually broken

Ordered by how much they matter for someone working by hand.

### 8.1 The backend cannot start — missing dependencies

`split/backend/index.mjs` imports `cors` (line 2) and `bcryptjs` (line 5). **Neither is in
`package.json` and neither is installed.** `node backend/index.mjs` dies instantly with
`ERR_MODULE_NOT_FOUND`.

`express`, `mysql2` and `jsonwebtoken` *are* declared, so someone added some and forgot the others.
Note that `docs/BACKEND.md` lists the fourth import as `bcrypt` when it is really `bcryptjs` — the
doc and the code disagree.

**Fix:** `npm --prefix split install cors bcryptjs`.

### 8.2 The backend has no configuration and no endpoints

- DB pool hardcodes `localhost` / `root` / **empty password** / **empty database name**
- `port = 3001` is hardcoded
- `JWT_SECRET` falls back to the literal `"change_this_to_a_long_random_string"`
- `cors()` with no options = every origin allowed
- `mysql.createPool` fails lazily, so the server prints "API running" and then throws on first query
- **Zero routes are defined.** `asyncHandler` is written and never used.

**Fix:** read `process.env`, then actually write endpoints. `docs/BACKEND.md` is a complete, honest
to-do list of what the API owes the frontend — logins, saved routes, reviews, search, and a `POST`
that persists a built route.

### 8.3 The Google Maps key is live in the working tree

`split/.env.local` contains a real `AIzaSy...` key. It is **gitignored and has never been
committed**, so this is not a leak — but it *is* a live credential sitting in a
plaintext file, and it is currently the only reason the maps work.

**Do:** confirm it is referrer-restricted to `localhost:5173/*` in the Google Cloud console. It is a
browser key, so it is public by nature; the restriction is the actual protection.

### 8.4 Stale comments pointing at files that do not exist — fixed

`split/index.html` line 35 used to say the theme storage key is "kept in sync with
`src/components/themeToggle.jsx`", a path that does not exist. The comments now point at
`src/components/navbar.tsx`, where the switch and the key live. It was harmless, but it is the kind of
thing that makes you distrust the comments, so it is worth a grep whenever a file moves.

### 8.5 Git history is unusable

Commit subjects include `temp`, `temp save`, `env git`, `a303d27 temp`. You cannot read this history
to learn why anything is the way it is. **The docs are the history** — that is why they are so
detailed.

---

## 9. Non-obvious rules that will bite you

These are enforced by tests and will fail loudly (which is the point).

- **UI copy is Dutch; code and comments are English.** A user-facing string change fails a test on
  purpose — that is the contract working.
- **No new UI dependencies.** BeerCSS + Material Symbols only. No icon libraries, no component kits,
  no animation libraries.
- **`m.div`, never `motion.div`.** The root `LazyMotion` is in `strict` mode, so the full `motion.*`
  component throws.
- **Never hardcode a colour.** Two seeds (`--seed-orange`, `--seed-blue`) in `src/index.css` generate
  the whole palette. Never Tailwind's `slate-*`, never `text-orange-*` (it is a fill tone), never a
  gradient, never a shadow — there is no elevation in this design at all.
- **Comment style is enforced by culture, not lint:** one line, lowercase, carries only the
  load-bearing half (the trap, the measured number, the deliberate deviation). Match it or you will
  immediately look like an outsider in this codebase.
- **Adding an icon requires adding its name to the Material Symbols subset URL in `index.html`** or it
  renders as raw text.
- **Two tests are deliberate tripwires** that assert route and place counts. A content change *should*
  fail exactly those, once.
- **Never `import { ... } from "vitest"`** in a test file. Use the globals. Importing breaks the whole
  suite with "Vitest failed to find the current suite."

---

## 10. Where to look when you want to change…

| I want to change… | Touch this |
| --- | --- |
| A route or a place | `src/data/routes.ts` / `pointsOfInterest.ts` + `searchIndex.json`, then the two tripwire counts |
| A URL or the nav/footer links | `src/data/navigation.ts` only — everything reads from it |
| A colour, font or spacing | the two seeds + `@theme` in `src/index.css`, and `docs/DESIGN.md` in the same change |
| The look of a component | copy the canonical markup from `docs/DESIGN.md` §7, don't invent it |
| How filtering works | `filterRoutes` / `filterPointsOfInterest` in `src/data/` |
| A page's contents | its `src/pages/*Page.tsx`, then its components |
| What the API should do | `docs/BACKEND.md`, then `backend/index.mjs` |

---

## 11. Suggested first moves

1. **Get it running.** `npm --prefix split install` then `run dev`, open localhost:5173, click
   through all four pages in both themes. This takes 10 minutes and gives you the ground truth.
2. **Read `types.ts` then `App.tsx`.** After that the codebase stops being a mystery.
3. **Read `routesPage.tsx` with `docs/DESIGN.md` §7 open.** That is where the architecture is densest.
4. **Run `npm --prefix split run test`.** The suite gives you a safety net before you touch anything;
   the 7 red tests are the merge leftovers listed in §7, not your doing.
5. **Decide what "fix it" means** — the frontend is in good shape; the backend is essentially empty.
   Those are very different jobs. See §8.
