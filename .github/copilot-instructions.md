# Project Guidelines

**splitzwolle** — "Zwolle Routes", a Dutch route planner for walking and cycling through Zwolle
with a historic map layer beside the present-day map.

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
- Auto-applied rules for `split/src/**/*.{jsx,tsx,css}`:
  `.github/instructions/frontend.instructions.md`

## Stack

Vite 8 + React 19 + TypeScript, Tailwind CSS v4 via `@tailwindcss/vite`, **BeerCSS 5**
(Material 3 components + Material Symbols icons), oxlint.
Express is a declared dependency for the (currently minimal) `split/backend/` folder.

## Project Layout

- **The Vite project root is `split/split/`**, not the repo root. All app paths below are
  relative to `split/`.
- `src/index.css` — Tailwind import + all `@theme` design tokens
- `src/main.tsx` — entry, mounts `<App />`
- `src/App.tsx` — composition only; renders the current page
- `src/pages/*.jsx` — pages, `PascalCase` file name, default export
- `src/components/` — shared components (create once something is used twice)
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

- **Verify UI changes in the browser** at http://localhost:5173, and run the production build
  before finishing.
- UI copy is Dutch (`nl-NL`); code, comments, and commits are English.
- `tsc -b` requires `allowJs: true` in `split/tsconfig.app.json` for the `.jsx` pages —
  keep it enabled.
- BeerCSS and Material Symbols are the only UI dependencies; don't add more (no icon
  libraries, no animation libraries, no component kits). Everything else is Tailwind
  utilities, the Material 3 CSS variables in `split/src/index.css`, and hand-drawn inline
  SVG for the map artwork.
