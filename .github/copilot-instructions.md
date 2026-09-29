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
**Google Maps** (the JavaScript API, loaded as a script by `src/shared/map/googleMaps.ts`) draws every
map except the hero's — see `docs/DESIGN.md` §8. The key is `VITE_GOOGLE_MAPS_API_KEY` in
`split/split/.env.local`; without it every map falls back to the map artwork.
Express is a declared dependency for the (currently minimal) `split/backend/` folder.

## Project Layout

- **The Vite project root is `split/split/`**, not the repo root. All app paths below are
  relative to `split/`.
- `src/index.css` — Tailwind import + all `@theme` design tokens
- `src/main.tsx` — entry, mounts `<App />`
- `src/App.tsx` — the router: paths → pages, plus the root `LazyMotion` / `MotionConfig`
- `src/pages/*.tsx` — one page per route, camelCase file name ending in `Page`, default export.
  A page is a table of contents: it resolves the route, owns the state its sections share, and
  lists them in order (`homePage`, `routesPage`, `routeDetailPage`, `planningPage`,
  `pointsOfInterestPage`, `notFoundPage`).
- `src/sections/<page>/` — the pieces a page is assembled from (a band, a grid column, a card, a
  row), one component per file, **page-scoped**, grouped by the page that owns them: `home/`,
  `routes/`, `routeDetail/`, `pointsOfInterest/`, `planning/`. Promoted to `src/shared/`
  the moment a second page needs one.
- `src/shared/<category>/` — what two or more pages share, grouped by category:
  - `layout/` — the shell and the page scaffolding: `appLayout`, `navbar`, `footer`, `container`,
    `pageHeader`, `pageTitle`, `sectionHeading`, `scrollToTop`, `themeToggle`, `breadcrumb`
  - `primitives/` — `icon`, `starRating`, `textButton`
  - `content/` — `routeCard`, `routeGrid`, `emptyState`
  - `filters/` — `filterPanel`, `filterSelect`, `searchField`, `sectionSearchBar`,
    `clearFiltersButton`
  - `map/` — `areaMap` (the interactive map every page shares — the dots, the preview, the route),
    `googleMaps` (the loader, the options, the colours, the Places/Routes calls), `usePlannedRoute`
    (the route between the picked places), `mapArtwork` (the hero's pictures), `mapChip`, `mapLegend`,
    `mapSnapshot` (a static map picture), `routeShape` (a route drawn from its own coordinates)
- `src/data/` — the content the pages share (`routes.ts`, `pointsOfInterest.ts`, `area.ts`,
  `maps.ts`, `routeGeometry.ts`, `directions.ts`, `navigation.ts`); `src/format.ts` formats the Dutch
  `nl-NL` values
- `src/googleMaps.d.ts` — the slice of the Google Maps API the app uses, declared by hand (like
  `beercss.d.ts`), because the api arrives as a script and no types package was added
- `src/data/searchIndex.json` + `src/data/search.ts` — the search the home previews run on: the
  JSON is the record set and stands in for the collaborator's endpoint, the module is the one place
  that will become a `fetch`
- `src/types.ts` — the shape of that content (`Route`, `PointOfInterest`, `MapPicture`, the filter
  state): the one place the domain vocabulary is written down
- `src/assets/maps/` — the map imagery, imported by `src/data/maps.ts`
- `tests/unit/` — Vitest + React Testing Library: `*.test.ts` for data and pure helpers,
  `*.test.tsx` for components, sections and pages (with `motionProvider.tsx` and `helpers.tsx` for
  the LazyMotion/router wrappers)
- `tests/e2e/` — Playwright: the site as a reader sees it, with `fixtures.ts` holding the shared
  fixture
- `backend/index.mjs` — Express API
- `public/` — static assets

## Commands

Run from the repo root using `--prefix` (the terminal tool strips `cd` prefixes):

| Task             | Command                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| Dev server       | `npm --prefix split/split run dev` — http://localhost:5173                     |
| Production build | `npm --prefix split/split run build`                                           |
| Lint             | `npm --prefix split/split run lint`                                            |
| Preview build    | `npm --prefix split/split run preview`                                         |
| Unit tests       | `npm --prefix split/split run test`                                            |
| Coverage         | `npm --prefix split/split run test:coverage`                                   |
| End-to-end tests | `npm --prefix split/split run test:e2e` (needs the one-off `test:e2e:install`) |
| Both suites      | `npm --prefix split/split run test:all`                                        |

`docs/TESTPLAN.md` is the plan behind the folders: what each suite owns, the traps it encodes, and how
the suite follows a content change. The e2e groups are tagged (`@smoke`, `@nav`, `@builder`, `@list`,
`@poi`, `@route`, `@planner`, `@theme`, `@layout`, `@a11y`), so a slice is
`run test:e2e -- --grep @builder`, and `-- --last-failed` re-runs what broke last.

## Conventions

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
  footer all read them from there, so a renamed URL cannot leave a stale link behind.
- **Verify UI changes in the browser** at http://localhost:5173, and run the production build
  before finishing.
- **Run the tests before finishing** — `npm --prefix split/split run test` (fast) and, when the
  change touches a page or a flow, `run test:e2e`. Both suites run with **no maps key**, so the maps
  are exercised through their fallback panel; the real maps are checked by hand at 5173. Test files
  use vitest's globals and never `import { … } from "vitest"` (see `docs/TESTPLAN.md`).
- UI copy is Dutch (`nl-NL`); code, comments, and commits are English.
- Everything under `split/src/` is TypeScript — `.tsx` for anything with markup, `.ts` for data,
  types and pure helpers — and `split/tsconfig.app.json` has `strict: true`. `allowJs` is off: a
  stray `.js` file in `src/` is a file that will not be compiled.
- BeerCSS and Material Symbols are the only UI dependencies; don't add more (no icon
  libraries, no animation libraries, no component kits). Everything else is Tailwind
  utilities, the Material 3 CSS variables in `split/src/index.css`, the map imagery in
  `split/src/assets/maps/`, and Google Maps drawn by `src/shared/map/`.
