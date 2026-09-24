---
description: "Use when building or editing UI in this project — React components, pages, JSX/TSX, styling, BeerCSS or Tailwind classes, colors, typography, or design tokens. Covers the Zwolle Routes Material 3 design system (BeerCSS + Deltion colors), component recipes, and React best practices. Read docs/DESIGN.md for the full reference."
applyTo:
  - "split/src/**/*.ts"
  - "split/src/**/*.tsx"
  - "split/src/**/*.css"
---

# Frontend Guidelines — Zwolle Routes

Full reference: **`docs/DESIGN.md`** (what this project decided) and
**`docs/reference/material-3-reference.md`** (the distilled Material 3 spec — component metrics,
type scale, motion, a11y). Read DESIGN.md before creating a new section or component; consult the
reference when you need a spec number. This file is the short list of rules that must never be
broken.

## Design system

The look is **Material 3, implemented with BeerCSS**, wearing the Deltion palette
(blue · orange · white). **No gradients and no elevation anywhere** — solid steps and hairlines only.
- **Use BeerCSS components; don't hand-build them.** `<button>`, `<article>`, `.chip`, `.field`,
  `.slider`, `.grid` + `.s12/.m6/.l4`, `<i>` for Material Symbols. Copy the canonical markup from
  the "Components" section of `docs/DESIGN.md` rather than inventing styles.
- **Never hardcode colors.** Two layers own color:
  - `@theme static` in `split/src/index.css` → the palette, derived from **two seeds**:
    `--seed-orange: #f68221` and `--seed-blue: #282c6d` generate `orange-50…500`, `blue-50…950`,
    the desaturated `navy-*` ramp for the dark theme's surfaces, and the neutrals (`sand-*` = orange
    over white, `haze-*` = blue over white). Change a seed and every shade, role and theme step
    follows — so **never add a colour that is not a shade of these two**, and mix in `oklab` when you
    derive one (sRGB mixing goes grey, and mixing the two brand colours together goes brown). The
    orange ramp **stops at the brand value**: a darkened orange is brown, so on light surfaces orange
    is a fill and the ink there is blue.
  - `:root, body.light` **and** `body.dark` → the Material 3 roles BeerCSS reads (`--primary`,
    `--surface`, `--heading`, …). Change the look by changing a role in *both* blocks, not by
    editing a component.
- **Text and hairlines come from the theme-aware aliases**, not from a fixed scale:
  `text-ink` (strong), `text-ink-muted` (muted), `text-heading` (headings/figures),
  `text-accent` (the eyebrow, links, ratings), `border-line` (hairlines). **Never use Tailwind's
  `slate-*`**, and never dim text with opacity (`text-ink-muted/70` measures 3.4:1) — use size for
  restraint. Never write `text-orange-*` either: it is a **fill** tone (2.6:1 on white). Accent text
  uses `text-accent` — Deltion blue in light mode, the true brand orange in dark mode.
- **Both themes are supported.** The palette is chosen by the `light`/`dark` class on `<body>`
  (see `src/components/themeToggle.tsx`); components never branch on the theme, they just read
  roles. Anything hardcoded to the light palette will break dark mode.
- **Text on the brand orange is white; text on a light orange tint is blue.** White goes **only** on
  `orange-500` itself — the bar, the selected segment, a filled action, the artwork badge — never on
  the `orange-100` tints (`--primary-container`), which carry `blue-900`. This is the one deliberate
  contrast trade: white on `#f68221` is **2.6:1** (blue on the same orange is 7.8:1), documented in
  DESIGN.md §3/§11/§16 — don't "fix" it, and don't extend white onto a tint.
- **Typography:** `font-display` (Montserrat) for headings — already applied to `h1`–`h6` in
  `@layer base` — and `font-sans` (Inter) for everything else. Never Tailwind's `font-serif`.
- **Elevation:** **there is none**, by design — no `elevate`/`medium-elevate`/`large-elevate`, no
  Tailwind `shadow-*` (shadows are switched off framework-wide in `@layer overrides`). Separate
  surfaces with a step in the `--surface-container-*` ramp and a `border-line` hairline instead.
- **The top bar leads with the brand and flips with the theme** (`bg-bar text-on-bar`): brand orange
  with **white** text in light mode, desaturated brand navy with light text in dark. The avatar always
  wears the *opposite* brand colour (`bg-avatar text-on-avatar`) — blue on the orange bar, orange on
  the navy bar. The active nav link is marked with weight + underline — never by dimming the others;
  the active *mobile* row is a translucent state layer over the bar (`bg-on-bar/20 text-on-bar`), not
  an inverted pill.
- **Balance the two brand colours:** light mode is **orange-filled** (bar, selected segment, light
  tints, route lines) with blue as the *ink* — every heading, accent and body string; dark mode is
  **blue-built** (desaturated navy surfaces, the bar, *every button*) with orange as the *ink* —
  headings, the eyebrow, the avatar, route lines. Never give both equal weight in one theme, and
  never put orange over a large area in dark mode.
- **Sections alternate band → surface → band**: hero and footer are `inverse-surface` (pure white in
  light, `blue-950` in dark), the content between them is `surface` (warm paper in light). Cards on a
  band take `surface`.
- **One filled orange action per section** — plus chips, map pins and route lines.
- **Collisions:** never put a Tailwind `grid`/`grid-cols-*` where BeerCSS `.grid` is meant (use
  `.s12/.m6/.l4`), and never `fixed` on the header (BeerCSS `.fixed` means sticky — use
  `sticky top-0 z-50`).
- **`!important` lives in `@layer overrides` only** (`src/index.css`, declared first so important
  rules there win). It is for properties BeerCSS declares with the flag itself — today just the
  connected button group's segment colours (`--primary` / `--primary-container`) and corner shape,
  plus the framework-wide shadow switch-off (DESIGN.md §2, §7). Anywhere else, a
  needed `!important` means the framework is being fought instead of used.
- **Light mode must separate, not just contrast.** A white page hides white cards: the bands are
  white, the canvas is warm paper (`sand-200`) and cards are white again, so the sections read as
  bands. When you add a surface, check it against its *parent* in both themes, not only its text
  contrast.
- **Layout:** `max-w-[100rem]` container with `px-5 sm:px-8`, sections `py-16 sm:py-20`. The hero
  and footer bands use `inverse-surface` (white in light mode, deep blue in dark): never paint a band
  with a fixed dark colour, and let its contents use the normal ink utilities. `index.css` already
  handles `scroll-margin-block-start` for anchored sections.
- **Prefer the built-in way.** Check BeerCSS's docs/slots before writing CSS: a control inside a
  field is a slotted `<a>`/`<i>`, not an absolutely positioned button. Promote a repeated value to a
  token, then a role, so one edit propagates and light/dark keeps working. Never add a UI dependency
  that duplicates BeerCSS — see `docs/DESIGN.md` §13 and §15.
- **Flexbox for rows, the BeerCSS 12-col grid for page layout**, `gap-*` between siblings, `min-w-0`
  on text inside a flex row. Check every change from **320px to 2560px** and in **both themes**;
  `document.body.scrollWidth === clientWidth` must hold at every width.
- **Material 3 metrics to keep:** the app bar is `surface`, flat at rest, 64px (ours is 65px);
  cards are 12px (`article`, or `rounded-xl`); controls carry a **48×48px hit area** — add
  `tap-target` to anything smaller than 48px (BeerCSS icon buttons are 40px) instead of
  enlarging the visual; section rhythm 32–64px on the 4px grid.
- **Motion is wanted here — but restrained.** Every interactive control carries BeerCSS's built-in
  `ripple` (Material 3 press feedback + 10% hover/focus state layer). Tailwind transitions are
  already 200ms on the M3 standard curve (`--ease-standard`, set as the default in `index.css`) —
  don't name a duration or a curve again. Animate `transform` and `opacity` only, and put
  `motion-safe:` on anything that *moves* (lifts, entrances).
- **`motion` is for enter/exit and list changes only** — `m.*` components (never `motion.*`, the
  root `LazyMotion` is `strict`), with `AnimatePresence`, and curves taken from `MOTION_TRANSITION`
  in `src/motion.ts`. One-shot entrances stay CSS keyframes. **Never add scroll animations**
  (fade/fly-in on scroll, parallax): they are noise. Full rules and measured numbers: DESIGN.md §10.
- **Naming:** camelCase for files/identifiers (`homePage.tsx`, `historicOpacity`), PascalCase
  components, SCREAMING_SNAKE for content constants (`ROUTES`), kebab-case for the few classes and
  custom properties in `index.css`. Comment the *why* — especially BeerCSS quirks and deliberate
  deviations. `docs/DESIGN.md` §13 has the full craft rules.
- **Icons are Material Symbols** via `<Icon name="…" />`. Adding an icon means adding its name to
  the subset URL in `split/index.html` first.
- **Maps are a picture plus a drawing.** The imagery lives in `src/assets/maps/` and is imported
  through `src/data/maps.js` (imported assets are fingerprinted by Vite — `public/` is only for
  files whose *path* is fixed, like the favicon). Routes, stops and pins are inline SVG overlays
  from `components/mapArtwork.tsx`, painted with Tailwind `fill-*` / `stroke-*` utilities so no hex
  appears in JSX, positioned in 0–100 space. Overlays never take pointer events; the picture's
  `alt` carries the meaning (DESIGN.md §8).

## React best practices

- **Function components + hooks only.** No classes, no legacy lifecycle patterns.
- **Types first.** The content's shape comes from `src/types.ts` (`Route`, `PointOfInterest`,
  `MapPicture`, the filter state) — a component names the type it needs instead of listing the
  fields it reads. Props are an `interface <Component>Props` above the component, optional fields
  defaulted in the signature, and a closed set of values (`RouteTheme`, `AuthMode`, a filter) is a
  **union**, never `string`.
- **Reuse before you write markup.** `Container` owns the page width and gutter, `RouteGrid` the
  grid route cards are listed in, `ClearFiltersButton` the way out of a filtered list and `MapChip`
  a label on a map. If a piece exists, it takes props — copy it into a second file and the two
  copies start to drift (§13, „Where a piece lives“).
- **One component per file, one responsibility per component.** A piece a single page needs lives in
  `src/sections/`; the moment a second page needs it, promote it to `src/components/` — see
  `docs/DESIGN.md` §13 ("Where a piece lives") and the suffix table there before naming anything.
- **Semantic HTML:** `header` / `nav` / `main` / `section` / `article` / `footer`, not `div` soup.
- **Props are destructured in the signature** with defaults: `function Badge({ label, tone = "brand" })`.
- **Lists render stable keys** from data ids — never the array index.
- **Derived values use `useMemo` only when there is real work** (filtering/mapping a list).
  Do not wrap trivial expressions.
- **State lives at the lowest common owner.** Lift it only when two siblings need it.
- **No inline `style` except CSS custom properties** for dynamic values, e.g.
  `style={{ "--historic-opacity": value }}`. Static styling is always a Tailwind class.
- **Never mutate props or state** — derive new arrays/objects.
- **Keep effects out unless syncing with an external system.** There are three, and each one has to
  be: `ThemeToggle` (the `<body>` class + localStorage), `ScrollToTop` (the scroll position after a
  route change) and `PageTitle` (`document.title`). Never add one to compute render values.
- **File naming:** camelCase files, one component each, named exactly for the component —
  `src/pages/homePage.tsx` → `HomePage`, `src/sections/heroMap.tsx` → `HeroMap`,
  `src/components/mapPanel.tsx` → `MapPanel`. A page owns its route, the state its sections share and
  the order they appear in; the markup lives in its sections. `App.tsx` only maps paths to pages.
- **Routing:** paths live in `src/data/navigation.js` and are used with `<Link to={…}>`. A link that
  has to look like a button carries BeerCSS's `.button` (`className="button border text-ink ripple"`)
  — a bare `<a>` has no height, padding or fill, so `ripple` alone renders a text link. The bar,
  `main` and footer are `components/appLayout.tsx`; a content page starts with `<PageHeader>`
  (band + title, and it sets the document title). The login page is outside the shell on purpose.

## Accessibility

- Icon-only buttons need `aria-label`; toggles use `aria-pressed`; the hamburger also exposes `aria-expanded`.
- Inputs always have a `<label>` — use `sr-only` when the design shows no label.
- Decorative SVG gets `aria-hidden="true"`; a meaningful graphic gets `role="img"` + `aria-label`.
- Tappable targets are at least `h-10 w-10`. Never remove focus styling without a
  `focus-visible:ring-*` replacement.

## Gotchas

- The Vite project root is **`split/split/`**, not the repo root — `src/` paths in this file are
  relative to `split/`.
- `split/src/index.css` owns the Tailwind import, the BeerCSS layer imports and the tokens.
  `split/src/App.css` must **not** `@import "tailwindcss"` (it duplicates the entire base CSS).
- BeerCSS is imported **piecewise** and wrapped in `layer(beercss)`. Keep the layer statement
  (`@layer theme, base, beercss, components, utilities;`) and the `layer(beercss)` on every
  BeerCSS `@import` — drop either and Tailwind's preflight or its utilities start fighting the
  Material 3 components. `settings/font.css` and `settings/dark.css` are intentionally not
  imported (see `docs/DESIGN.md` §2).
- `<body class="light">` in `split/index.html` is the default theme **and** the signal that stops
  BeerCSS from following the OS preference into its own purple palette. The inline script there
  re-applies a stored `dark` choice before the first paint — keep its storage key in sync with
  `src/components/themeToggle.tsx`.
- BeerCSS's `<i>` icon ligatures only render if the name is in the Google Fonts subset URL in
  `split/index.html`. That includes the glyphs BeerCSS components draw themselves —
  `check_box`, `check_box_outline_blank` (checkbox) and `check` (switch). A filled Material Symbol
  (the rating stars) is BeerCSS's `i.fill`, which flips the `FILL` axis.
- `split/src/index.css` imports `elements/selection.css` **in addition to** `elements/all.css`:
  BeerCSS 5's `all.css` does not pull it in, and without it checkboxes, radios and switches fall
  back to the browser's own controls. Keep it inside `layer(beercss)`.
- Validate with `npm --prefix split/split run build` and `npm --prefix split/split run lint`,
  and check the result in the browser at http://localhost:5173.
