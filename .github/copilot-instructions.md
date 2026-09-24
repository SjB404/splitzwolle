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

## Stack

Vite 8 + React 19 + TypeScript, Tailwind CSS v4 via `@tailwindcss/vite`, **BeerCSS 5**
(Material 3 components + Material Symbols icons), **`react-router-dom`** for the client-side pages,
**`motion`** for enter/exit animation, oxlint.
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
  `pointsOfInterestPage`, `loginPage`, `notFoundPage`).
- `src/sections/` — the pieces a page is assembled from (a band, a grid column, a card, a row),
  one component per file, page-scoped (`hero`, `heroMap`, `routeFilters`, `planMap`, `poiCard`,
  `loginFormPanel`, …). Promoted to `components/` the moment a second page needs one.
- `src/components/` — what pages share (`appLayout`, `navbar`, `footer`, `pageHeader`,
  `sectionHeading`, `routeCard`, `starRating`, `filterSelect`, `icon`, `themeToggle`, `pageTitle`,
  `scrollToTop`, `mapArtwork`) plus the reusable composites lifted out of the sections:
  `container`, `mapPanel`, `filterPanel`, `searchField`, `emptyState`, `breadcrumb`, `mapLegend`,
  `textButton`, `routeGrid`, `mapChip`, `clearFiltersButton`
- `src/data/` — the content the pages share (`routes.ts`, `pointsOfInterest.ts`,
  `navigation.ts`, `maps.ts`); `src/format.ts` formats the Dutch `nl-NL` values
- `src/types.ts` — the shape of that content (`Route`, `PointOfInterest`, `MapPicture`, the filter
  state): the one place the domain vocabulary is written down
- `src/assets/maps/` — the map imagery, imported by `src/data/maps.ts`
- `backend/index.mjs` — Express API
- `public/` — static assets

## Commands

Run from the repo root using `--prefix` (the terminal tool strips `cd` prefixes):

| Task | Command |
| --- | --- |
| Dev server | `npm --prefix split/split run dev` — http://localhost:5173 |
| Production build | `npm --prefix split/split run build` |
| Lint | `npm --prefix split/split run lint` |
| Preview build | `npm --prefix split/split run preview` |

## Conventions

- **Paths are declared once** in `src/data/navigation.ts` — the router, the top bar and the
  footer all read them from there, so a renamed URL cannot leave a stale link behind.
- **Verify UI changes in the browser** at http://localhost:5173, and run the production build
  before finishing.
- UI copy is Dutch (`nl-NL`); code, comments, and commits are English.
- Everything under `split/src/` is TypeScript — `.tsx` for anything with markup, `.ts` for data,
  types and pure helpers — and `split/tsconfig.app.json` has `strict: true`. `allowJs` is off: a
  stray `.js` file in `src/` is a file that will not be compiled.
- BeerCSS and Material Symbols are the only UI dependencies; don't add more (no icon
  libraries, no animation libraries, no component kits). Everything else is Tailwind
  utilities, the Material 3 CSS variables in `split/src/index.css`, the map imagery in
  `split/src/assets/maps/`, and the inline SVG route/pin overlays drawn over it.
