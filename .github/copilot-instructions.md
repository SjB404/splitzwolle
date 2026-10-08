# Project Guidelines

**splitzwolle** — "Zwolle Routes", a Dutch route planner for walking and cycling through Zwolle
with a historic map layer beside the present-day map.

## Responses

- **TL;DR by default.** Lead with the answer, then stop. No preamble, no restating the question,
  no summary of what was just said.
- Keep it to a few sentences or a short list. Expand only when asked, or when the detail is
  load-bearing — a trap, a trade-off, a measured number.
- No narration of your own process ("I'll now…", "Let me check…", "Here's what I did").
- Long explanations belong in `docs/DESIGN.md`, where the next reader looks for them.

## Version control

**Never commit or push anything.** Leave every change uncommitted and unstaged in the working tree,
so the user reviews it and lands it themselves. Read-only git is fine (`status`, `diff`, `log`,
`show`); writing commands are not (`commit`, `push`, `add`, `stash`, `reset`, switching branches).

## Design & UI

The design language is **Material 3 (Material You)**, implemented with **BeerCSS**, wearing the
**Deltion school colors: blue · orange · white**. **No gradients anywhere.** Both a **light and a
dark theme** are supported, toggled from the top bar.

All visual conventions live in the design system. **Read `docs/DESIGN.md` before writing UI
code** — do not re-derive styles by scanning the project.

- Source of truth: `docs/DESIGN.md` (BeerCSS/Tailwind wiring, themes, color roles, type, shape,
  component recipes, map artwork, content rules) — §16 lists every deliberate deviation from the
  Material 3 spec.
- Upstream spec digest: `docs/reference/material-3-reference.md` (component metrics, type scale,
  motion curves, accessibility) — consult it for spec numbers, DESIGN.md for decisions.
  Auto-applied rules for `split/src/**/*.{ts,tsx,css}`:
  `.github/instructions/frontend.instructions.md`
- **Keep `docs/DESIGN.md` current, automatically.** If a change touches anything written down there —
  a token, a role, a recipe, a class, a path, a file that moved, a name, a rule, a spec deviation —
  update it in the same change. Never leave the design system describing code that no longer exists.

## Stack

Vite 8 + React 19 + TypeScript, Tailwind CSS v4 via `@tailwindcss/vite`, **BeerCSS 5**
(Material 3 components + Material Symbols icons), **`react-router-dom`** for the client-side pages,
**`motion`** for enter/exit animation, oxlint.
**Google Maps** (the JavaScript API, loaded as a script by `src/data/googleMaps.ts`) draws every
map except the hero's — see `docs/DESIGN.md` §8. The key is `VITE_GOOGLE_MAPS_API_KEY` in
`split/.env.local`; without it every map falls back to the map artwork. What that key is allowed to
cost — free caps, prices, the SKUs to avoid — is in `docs/maps-costs.md`.
Express is a declared dependency for `split/backend/`, the API behind the login and contact flows
(`/api/auth`, `/api/users/register`, `/api/contact`); the reviews and admin-user routers
(`/api/reviews`, `/api/admin/users`) are built and tested too, waiting for their callers. Its own
tsconfig project typechecks it (`tsc -b`), it configures itself from the environment
(`split/.env.example`), and it is covered by its own suite — `test:backend`.

## Project Layout

- **The Vite project root is `split/`**, not the repo root. The short `src/…` paths below
  are relative to **`split/`**; a path written out in full starts at the repo root.
- `src/index.css` — Tailwind import + all `@theme` design tokens, the colour roles and the rules every
  component shares. CSS that only draws one component lives with it (`src/components/hero.css`,
  `areaMap.css`, `filterSelect.css`), imported by that component — see DESIGN.md §2
- `src/main.tsx` — entry, mounts `<App />`
- `src/App.tsx` — the router plus the shell: it maps paths → pages, and the bar / `main` / footer
  around them and the scroll-to-top effect are written out in this file, because nothing else uses
  them. The root `LazyMotion` / `MotionConfig` live here too.
- `src/pages/*.tsx` — one page per route, camelCase file name ending in `Page`, default export.
  A page is a table of contents: it resolves the route, owns the state its components share, and
  lists them in order (`homePage`, `routesPage`, `pointsOfInterestPage`, `notFoundPage`, `loginPage`,
  `contactPage`).
  `routesPage` is the one page serving three urls — `/routes`, `/routes/custom/<place-ids>` and
  `/routes/public/<route-id>` — where **the url is the state**: it is read for the picked places and
  written back on every pick, so a built route is shareable. See `docs/DESIGN.md` §7.
- `src/components/` — **every component, in one flat folder**, one per camelCase file. A piece earns
  its own file by being used in more than one place, or by owning a whole band of a page; a piece
  that only ever appears inside another component is written out there (the bar's links live in
  `navbar.tsx`, the footer's groups in `footer.tsx`, the hero, its map panel and its map pictures in
  `hero.tsx`).
- `src/data/navigation.ts` holds **every path** and the two url builders: `builderPath(placeIds)` →
  `/routes/custom/<ids>` (empty → `/routes`) and `publicRoutePath(routeId)` → `/routes/public/<id>`,
  with `parsePlaceIds` reading the first back. A route's old `/routes/<id>` url redirects to its public
  url, and `/planning` redirects to the builder. The link *lists* are not here: the bar's are in
  `components/navbar.tsx`, the footer's in `components/footer.tsx`.
- `src/data/` — the content and the logic the pages share (`routes.ts`, `pointsOfInterest.ts`,
  `placeImages.ts` — the place pictures, kept out of `pointsOfInterest.ts` so the e2e suite can read
  the data with plain node — `area.ts`, `maps.ts`, `routeGeometry.ts`, `directions.ts`,
  `navigation.ts`, `savedRoutes.ts`, `contact.ts` — the details the footer and the contact page
  share — `loginData.ts` — the login page's Dutch copy and the api base url —
  `googleMaps.ts` — the loader, the options, the colours, the Places/Routes calls — and
  `usePlannedRoute.ts`, the route between the picked places); `src/format.ts`
  formats the Dutch `nl-NL` values. `savedRoutes.ts` is the reader's own list in `localStorage`,
  which is why it also exports the one hook that watches it.
- `src/googleMaps.d.ts` — the slice of the Google Maps API the app uses, declared by hand (like
  `beercss.d.ts`), because the api arrives as a script and no types package was added
- `src/data/searchIndex.json` + `src/data/search.ts` — the search the home previews run on: the
  JSON is the record set and stands in for the collaborator's endpoint, the module is the one place
  that will become a `fetch`
- `src/types.ts` — the shape of that content (`Route`, `PointOfInterest`, `MapPicture`, the filter
  state): the one place the domain vocabulary is written down
- `src/assets/maps/` — the map imagery, imported by `src/data/maps.ts`
- `tests/unit/` — Vitest + React Testing Library: `*.test.ts` for data and pure helpers,
  `*.test.tsx` for components and pages (with `motionProvider.tsx` and `helpers.tsx` for
  the LazyMotion/router wrappers)
- `tests/e2e/` — Playwright: the site as a reader sees it, with `fixtures.ts` holding the shared
  fixture
- `backend/` — the Express API: `index.ts` (the app: CORS, JSON, the routers mounted at `/api`, a
  JSON 404 and error handler), `db.ts` (the one mysql pool, configured from the environment),
  `routes/` (one router per concern: `login/`, `pages/`, `admin/`), `middleware/userAuthenticator.ts`
  (the JWT guards) and `routes/tests/` (the suite `test:backend` runs)
- `public/` — static assets

## Commands

Run from the repo root using `--prefix` (the terminal tool strips `cd` prefixes):

| Task             | Command                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| Dev server       | `npm --prefix split run dev` — http://localhost:5173                           |
| API dev server   | `npm --prefix split run dev:server` — http://localhost:3000 (needs MySQL)      |
| Production build | `npm --prefix split run build`                                                 |
| Lint             | `npm --prefix split run lint`                                                  |
| Preview build    | `npm --prefix split run preview`                                               |
| Unit tests       | `npm --prefix split run test`                                                  |
| Coverage         | `npm --prefix split run test:coverage`                                         |
| Backend tests    | `npm --prefix split run test:backend`                                          |
| End-to-end tests | `npm --prefix split run test:e2e` (needs the one-off `test:e2e:install`)       |
| All three suites | `npm --prefix split run test:all`                                              |

`docs/TESTPLAN.md` is the plan behind the folders: what each suite owns, the traps it encodes, and how
the suite follows a content change. The e2e groups are tagged (`@smoke`, `@nav`, `@builder`, `@list`,
`@poi`, `@layout`, `@a11y` — the theme spec carries none and always runs), so a slice is
`run test:e2e -- --grep @builder`, and `-- --last-failed` re-runs what broke last.

## Conventions

- **Look it up before writing it down.** The answers are in this repo first — `docs/DESIGN.md` for
  anything visual, `docs/TESTPLAN.md` for how a change is verified, `docs/BACKEND.md` for what is
  still a placeholder — and then in the library's own docs. For a library, framework, SDK, CLI or API
  question, check current documentation (Context7, or the official site) instead of writing from
  memory: version-specific syntax matters here (Vite 8, React 19, Tailwind 4, BeerCSS 5, Vitest 5,
  Playwright 1.63 — several of them newer than most training data). When a doc and this file
  disagree, the doc wins for the topic it owns.
- **The site covers the binnenstad and the Noorder Eiland**, declared once in `src/data/area.ts`:
  every place is inside that box, every route is built from those places, and the map is given the box
  as its `restriction` so it cannot be panned out of the area.
- **Nothing is positioned by hand.** Every place's coordinates, address and `placeId` come from
  Google's **Places API** (resolved once, see `docs/DESIGN.md` §8), and a route's line comes from the
  **Routes API**. The 0-100 artwork layer that used to draw pins on the exported picture is gone, and
  so are the places it was drawn for: check the api before adding a place rather than guessing.
- **A route stores the places it visits** (`Route.poiIds`) and no geometry: `routePoints` and
  `routeCoordinates` are derived in `src/data/routes.ts`, so a route and its stops cannot drift apart.
- **Paths are declared once** in `src/data/navigation.ts` — the router, the top bar and the
  footer all read them from there, so a renamed URL cannot leave a stale link behind. The link
  lists themselves sit with the component that renders them.
- **Verify UI changes in the browser** at http://localhost:5173, and run the production build
  before finishing.
- **Run the tests before finishing** — `npm --prefix split run test` (fast), `run test:backend`
  when the change touches the server, and `run test:e2e` when it touches a page or a flow. The unit
  and e2e suites run with **no maps key**, so the maps
  are exercised through their fallback panel; the real maps are checked by hand at 5173. Test files
  use vitest's globals and never `import { … } from "vitest"` (see `docs/TESTPLAN.md`).
- UI copy is Dutch (`nl-NL`); code, comments, and commits are English.
- Everything under `split/src/` is TypeScript — `.tsx` for anything with markup, `.ts` for data,
  types and pure helpers — and `split/tsconfig.app.json` has `strict: true`. `allowJs` is off: a
  stray `.js` file in `src/` is a file that will not be compiled.
- BeerCSS and Material Symbols are the only UI dependencies; don't add more (no icon
  libraries, no animation libraries, no component kits). Everything else is Tailwind
  utilities, the Material 3 CSS variables in `split/src/index.css`, the map imagery in
  `split/src/assets/maps/`, and Google Maps drawn by `src/components/areaMap.tsx` through
  `src/data/googleMaps.ts`.
