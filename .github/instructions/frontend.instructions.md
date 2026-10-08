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
    `--surface`, `--heading`, …). Change the look by changing a role in _both_ blocks, not by
    editing a component.
- **Text and hairlines come from the theme-aware aliases**, not from a fixed scale:
  `text-ink` (strong), `text-ink-muted` (muted), `text-heading` (headings/figures),
  `text-accent` (the eyebrow, links, ratings), `border-line` (hairlines). **Never use Tailwind's
  `slate-*`**, and never dim text with opacity (`text-ink-muted/70` measures 3.4:1) — use size for
  restraint. Never write `text-orange-*` either: it is a **fill** tone (2.6:1 on white). Accent text
  uses `text-accent` — Deltion blue in light mode, the true brand orange in dark mode.
- **One boundary for every outlined control — at 2px**: a field, an outlined button and an unselected
  filter chip all draw `var(--outline)`, and every card or panel draws `var(--outline-variant)`
  (`border-2 border-line`) — **nothing is thinner than 2px**. The width is set once in
  [`@layer overrides`] §7, and the control _inside_ a field owns its line (`--outline` at rest,
  `--primary` on focus). Never add a second ring to a `.field`, and never reach for BeerCSS's
  `.transparent` on a control whose ink has to change — it is `color: inherit !important`; use the
  `bg-transparent` _utility_.
- **A `border-t` divider needs `rounded-none`.** BeerCSS gives every element
  `border-radius: inherit`, so a divider inside a 1.5rem card is painted as the top edge of a rounded
  box and curves away from the card's edges.
- **A child that butts inside a clipped panel is square too.** Where a panel clips its own corner
  (`overflow-hidden` + `rounded-box`) and holds two boxes that meet — the hero's picture and its rail,
  a card's media band on its body, the map's hover preview picture on its text — the child takes
  `rounded-none` as well: the panel draws the outer corners, and an inherited corner would curve the
  seam and split the panel into two cards. It is the only place a box is square, and the token rule in
  `@layer overrides` excludes `rounded-none` so the utility wins even on a `<button>` row; a chip or a
  button beside the picture still takes `--radius-box`.
- **A whole-card link is an overlay, not a stretched pseudo-element.** BeerCSS's reset puts
  `position: relative` on *every* element, so `after:absolute after:inset-0` on a card's title fills
  the heading and never the card. The card carries an empty `<Link className="absolute inset-0 z-0">`
  as its **last** child (last, so it paints over the picture and the body; `z-0`, so a control on the
  card keeps its `z-10` above it), and it takes `rounded-none` like every other full-bleed child. Its
  own ring would be clipped by the card, so the **card** draws the focus ring:
  `has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--primary)`.
- **`tap-target` cannot be positioned itself.** Its `position: relative` lives in unlayered CSS, so it
  beats a Tailwind `absolute` on the same element and `top`/`right` then shift the control instead of
  placing it. Put the position on a wrapper `div` and the `tap-target` on the button.
- **Both themes are supported.** The palette is chosen by the `light`/`dark` class on `<body>`
  (see `src/components/navbar.tsx`); components never branch on the theme, they just read
  roles. Anything hardcoded to the light palette will break dark mode.
- **Text on the brand orange is white; text on a light orange tint is blue.** White goes **only** on
  `orange-500` itself — the bar, a filled action, a selected chip, the artwork badge — never on
  the `orange-100` tints (`--primary-container`), which carry `blue-900`. This is the one deliberate
  contrast trade: white on `#f68221` is **2.6:1** (blue on the same orange is 7.8:1), documented in
  DESIGN.md §3/§11/§16 — don't "fix" it, and don't extend white onto a tint.
- **A selected chip is a full fill, never a tint.** It takes `bg-selected text-on-selected` — the
  `--selected` / `--on-selected` roles: the true seed under white, `orange-500` in light mode and
  `blue-500` in dark. `secondary-container` is the role for selected _surfaces_ (the place card that
  follows the map), not for controls, and a container tone on a control reads as a hover. A card a
  **url** named never takes that tone — the tone is the page's own background colour, so it is what a
  reader's own pick reads as; the landing card flashes its edge instead (`animate-flash`, DESIGN.md
  §6/§10).
- **Typography:** `font-display` (Montserrat) for headings — already applied to `h1`–`h6` in
  `@layer base` — and `font-sans` (Inter) for everything else. Never Tailwind's `font-serif`.
  **Headings and the page rhythm are fluid**: `text-display` (hero `h1`), `text-headline` (page
  `h1`), `text-title` (section `h2`) and `px-gutter` / `py-band` / `py-hero` are `clamp()`ed tokens
  in `@theme`, so reach for the token instead of a breakpoint pair (DESIGN.md §4, §5).
- **Elevation:** **there is none**, by design — no `elevate`/`medium-elevate`/`large-elevate`, no
  Tailwind `shadow-*` (shadows are switched off framework-wide in `@layer overrides`). Separate
  surfaces with a step in the `--surface-container-*` ramp and the shared 2px `border-line` boundary
  instead.
- **The top bar leads with the brand and flips with the theme** (`bg-bar text-on-bar`): brand orange
  with **white** text in light mode, desaturated brand navy with light text in dark. The avatar always
  wears the _opposite_ brand colour (`bg-avatar text-on-avatar`) — blue on the orange bar, orange on
  the navy bar. The active nav link is marked with weight + underline — never by dimming the others;
  the active _mobile_ row is a translucent state layer over the bar (`bg-on-bar/20 text-on-bar`), not
  an inverted pill.
- **Balance the two brand colours:** light mode is **orange-filled** (bar, selected chip, light
  tints, route lines) with blue as the _ink_ — every heading, accent and body string; dark mode is
  **blue-built** (desaturated navy surfaces, the bar, _every button_) with orange as the _ink_ —
  headings, the eyebrow, the avatar, route lines. Never give both equal weight in one theme, and
  never put orange over a large area in dark mode.
- **Sections alternate band → surface → band**: hero and footer are `inverse-surface` (pure white in
  light, `blue-950` in dark), the content between them is `surface` (warm cream in light). Cards on a
  band take `surface`.
- **One filled orange action per section** — plus chips, map pins and route lines.
- **Collisions:** never put a Tailwind `grid`/`grid-cols-*` where BeerCSS `.grid` is meant (use
  `.s12/.m6/.l4`), never `fixed` on the header (BeerCSS `.fixed` means sticky — use
  `sticky top-0 z-50`), and never a `<ul>`/`<ol>` as a **direct child of a `<nav>`** — BeerCSS reads
  that as a dropdown menu and absolutely positions the list over the heading (DESIGN.md §2).
- **`!important` lives in `@layer overrides` only** (`src/index.css`, declared first so important
  rules there win). It is for properties BeerCSS declares with the flag itself, and for the few
  places it disagrees with itself — today the framework-wide shadow switch-off, the 2px boundary on
  every outlined control and every card/panel, and the two things wrong with the map slider (its
  filled track stops short of the handle, and the handle narrows to a hairline while focused)
  (DESIGN.md §2, §5, §7).
  Anywhere else, a needed `!important` means the framework is being fought instead of used.
- **Google's own dom inherits our stylesheet, so the map corrects it in `areaMap.css`** (the same
  layer, with the flag) — never in the global sheet: our `border-radius: inherit` rounded 168
  elements inside one map, and our justified `p` reached the api's "Gebruik Ctrl + scrollen …" hint
  and left it hard against the map's left edge. A third-party surface gets its own correction file
  (DESIGN.md §8).
- **Light mode must separate, not just contrast.** A white page hides white cards: the bands are
  white, the canvas is warm cream (`#fffcf0`) and cards are white again, so the sections read as
  bands. When you add a surface, check it against its _parent_ in both themes, not only its text
  contrast.
- **Layout:** `max-w-[100rem]` container with the fluid `px-gutter`, sections `py-band`; the hero
  band trades that for `py-hero`, because it is one screen tall and the map is what the room is for
  (DESIGN.md §5, §7). The hero's **panel** is `mx-auto w-fit` with `w-auto max-w-full object-contain`
  pictures inside: it shrinks around a picture shown whole instead of cropping the map to fill the
  band, and neither the panel nor the rule knows the picture's size — another file at another ratio
  lands correctly by itself. The hero
  and footer bands use `inverse-surface` (white in light mode, deep blue in dark): never paint a band
  with a fixed dark colour, and let its contents use the normal ink utilities. `index.css` already
  handles `scroll-margin-block-start` for anchored sections.
- **Prefer the built-in way.** Check BeerCSS's docs/slots before writing CSS: a control inside a
  field is a slotted `<a>`/`<i>`, not an absolutely positioned button. Promote a repeated value to a
  token, then a role, so one edit propagates and light/dark keeps working. Never add a UI dependency
  that duplicates BeerCSS — see `docs/DESIGN.md` §13 and §15.
- **Flexbox for rows, the BeerCSS 12-col grid for page layout**, `gap-*` between siblings, `min-w-0`
  on text inside a flex row. Check every change from **320px to 2560px** and in **both themes**;
  `document.body.scrollWidth === clientWidth` must hold at every width. A `w-full` BeerCSS button is
  the classic offender: it is `content-box`, so 100% used to mean 100% _plus_ its own padding.
- **Material 3 metrics to keep:** the app bar is the brand orange (`bg-bar text-on-bar`), flat at
  rest, **64px** — Material 3's own top-app-bar height, with no bottom hairline (DESIGN.md §6);
  **one corner on every box** — `--radius-box` (**1.5rem** / 24px), set once in `@layer overrides`, so
  `article`, a field, a chip, an action and a menu all share it (a hand-built panel wears
  `rounded-box`, never a one-off radius). A radius is clamped to half a box, so the one value renders
  as the right shape at every height — a 48px control is a **24px pill** (exactly half its height),
  40px → 20px, 32px → 16px — while a card draws the full 24px: the corner a card wears is the corner
  the action on it renders. That is the system, not drift.
  **A thin, long element is a pill, and a pill is 48px tall** — a full-width field, a submit, an
  accordion row. Prefer the pill whenever a box is much wider than it is tall; only a block (a
  textarea, a panel) gets the 24px corner on a bigger box. BeerCSS's `large`/`extra` (**56px**) on a
  bar is a rounded rectangle, not a pill — never put it on a thin element.
  **Every control resolves to one of two heights**: a **field is 48px** (its inner control; the
  wrapper carries no border — the 1px Tailwind leaves on `.field` is taken to 0 in the override
  layer) and so is **an action standing beside a field** (`h-12`), which is what makes a row of
  five fields and a button read as one line; everything else keeps BeerCSS's **40px** button and
  icon-button size. Controls carry a **48×48px hit area**: add `tap-target` to anything smaller
  than 48px **instead of enlarging the visual** — but note it only adds 4px a side, so it reaches
  48px only on a control that is **at least 40px tall**. A 32px chip that is a `<button>` therefore
  needs `chip medium` (40px) *and* `tap-target`; a 32px chip that is only a `<span>` label needs
  neither. Section rhythm 32–64px on the 4px grid. Full metrics table: DESIGN.md §5.
- **A page that imports `beercss/scoped` is a special case.** `contactPage` wraps
  its sections in a `div.beer`, and beerCSS's `* { all: revert }` inside that wrapper is *unlayered*,
  so it throws Tailwind's normal utilities away — `h-12` or `p-5` written in there does nothing.
  Use beerCSS's own classes, or the `!` modifier (`h-12!`), which is layered and important and
  therefore wins. The override layer still lands (the 2px boundary, the one corner): those rules
  carry the flag. (The login page is not scoped: it takes the ordinary utilities, and its own
  `loginPage.css` holds the plain rules that beat the beercss layer.)
- **Motion is wanted here — but restrained.** Every interactive control carries BeerCSS's built-in
  `ripple` (Material 3 press feedback + 10% hover/focus state layer). Tailwind transitions are
  already 200ms on the M3 standard curve (`--ease-standard`, set as the default in `index.css`) —
  don't name a duration or a curve again. Animate `transform` and `opacity` only — the sole
  exception is the landing card's `outline-color` (the flash, §10), because `border` and
  `box-shadow` are pinned on every `article` and that flash is feedback rather than movement. Put
  `motion-safe:` on anything that _moves_ (lifts, entrances) — never on the flash: colour-only
  feedback stays for reduced-motion readers, and the block in `index.css` re-applies it (§11).
- **`motion` is for enter/exit and list changes only** — `m.*` components (never `motion.*`, the
  root `LazyMotion` is `strict`), with `AnimatePresence`, and curves taken from `MOTION_TRANSITION`
  in `src/motion.ts`. One-shot entrances stay CSS keyframes. **Never add scroll animations**
  (fade/fly-in on scroll, parallax): they are noise. Full rules and measured numbers: DESIGN.md §10.
- **Naming:** camelCase for files/identifiers (`homePage.tsx`, `historicOpacity`), PascalCase
  components, SCREAMING_SNAKE for content constants (`ROUTES`), kebab-case for the few classes and
  custom properties in `index.css`. **Comments are one line, lowercase, and carry only the
  load-bearing half** — the trap, the measured number, the deliberate deviation — never a
  paragraph. `docs/DESIGN.md` §13 has the full craft rules.
- **Icons are Material Symbols** via `<Icon name="…" />`. Adding an icon means adding its name to
  the subset URL in `split/index.html` first.
- **Maps: the hero is a picture, everything else is Google Maps.** The hero's historic/current
  cross-fade stays artwork (two exports in `src/assets/maps/`, WebP, imported through `src/data/maps.ts`
  because imported assets are fingerprinted by Vite — `public/` is only for files whose _path_ is
  fixed, like the favicon). **`AreaMap`** (`components/areaMap.tsx`) is the interactive map: places as
  dots whose fill says which era they belong to, the picked ones numbered in visit order, the route
  as a white casing under the brand line, a hover preview per place and a nudge that keeps overlapping
  dots clickable. It is scoped to `src/data/area.ts` (the binnenstad + the Noorder Eiland) and built
  outside React — read §8 of DESIGN.md before touching it (the instance, the theme rebuild, the
  id-reconciled markers, the pixel maths behind the nudge). Previews use **`MapSnapshot`** (a static
  map picture, off until the key has that api) or **`RouteShape`** (drawn from the route's own
  coordinates, always available). **Never place anything by hand**: a place's `coordinates`, `address`
  and `placeId` come from Google's Places API, and a line comes from the Routes API (`travelMode` is
  `"WALKING"` / `"BICYCLING"` in the JS api — the REST spellings throw). **Never hardcode a map
  colour**: the api colours are read off the design tokens at draw time (`routeLineColors()`).
- **The map key is an environment variable** (`VITE_GOOGLE_MAPS_API_KEY`, documented in
  `.env.example`), and it is public by nature, so it is restricted by referrer in the cloud console.
  `VITE_GOOGLE_MAPS_STATIC_MAPS` and `VITE_GOOGLE_MAPS_MAP_ID` are the two optional switches (the
  static previews, and a cloud-styled map id that takes Google's own place dots off the base map).
  Every service must **degrade, never break**: a refused call answers `null` and the caller draws its
  own estimate, its own shape, or says the map could not load.
- **Search goes through a module, not through a filter in a component.** `src/data/search.ts`
  answers with ids from `src/data/searchIndex.json`, which stands in for the collaborator's
  endpoint; a section resolves those ids against the content it already renders, so swapping the
  index for the api is a one-file change (DESIGN.md §7, §15).
- **Keep `docs/DESIGN.md` current, automatically.** A change that alters a token, role, recipe,
  class, path or rule updates the source of truth in the same change — including every reference to
  a file that moved. A design system nobody can trust is worse than none.

## React best practices

- **Function components + hooks only.** No classes, no legacy lifecycle patterns.
- **Types first.** The content's shape comes from `src/types.ts` (`Route`, `PointOfInterest`,
  `MapPicture`, the filter state) — a component names the type it needs instead of listing the
  fields it reads. Props are an `interface <Component>Props` above the component, optional fields
  defaulted in the signature, and a closed set of values (`RouteTheme`, `RouteDifficulty`, a filter)
  is a **union**, never `string`.
- **Reuse before you write markup.** `Container` owns the page width and gutter,
  `ClearFiltersButton` the way out of a filtered list, `SearchField` the search box and `RouteShape`
  a route drawn from its own coordinates. If a piece exists, it takes props — copy it into a second
  file and the two copies start to drift (§13, „Where a piece lives“).
- **One component per file, one responsibility per component.** A piece earns its own file by
  being used in more than one place, or by owning a whole band of a page; anything that only ever
  appears inside one component is written out there, in that file. Every component lives in the one
  flat `src/components/` folder — there are no category or page subfolders. See
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
- **Keep effects out unless syncing with an external system.** The bar's theme switch in
  `src/components/navbar.tsx` (the `<body>` class + localStorage), `ScrollToTop` in `src/App.tsx`
  (the scroll position after a route change), `PageTitle` (`document.title`), the map layer
  (`AreaMap` and `usePlannedRoute`) and the small listeners and timers a few pieces own
  (`routeResults`'s notice, `routeShareButton`'s popup, `contactPage`'s select, `loginPage`'s OAuth
  params and session check, `savedRoutes`'s storage listeners) are the whole list. Never add one to
  compute render values.
- **File naming:** camelCase files, one component each, named exactly for the component —
  `src/pages/homePage.tsx` → `HomePage`, `src/components/routePlanSummary.tsx` →
  `RoutePlanSummary`, `src/components/areaMap.tsx` → `AreaMap`, `src/components/poiResults.tsx` →
  `PoiResults`. A page owns its route, the state its components share and
  the order they appear in; the markup lives in its components. `App.tsx` only maps paths to pages
  (and holds the bar / `main` / footer shell).
- **Routing:** paths live in `src/data/navigation.ts` and are used with `<Link to={…}>`. A link that
  has to look like a button carries BeerCSS's `.button` (`className="button border text-ink ripple"`)
  — a bare `<a>` has no height, padding or fill, so `ripple` alone renders a text link. A link that
  lands on **a place inside a page** uses that module's anchor (`pointOfInterestPath`), not a path of
  its own: the page is the same page, and `ScrollToTop` already follows a fragment. The bar,
  `main` and footer are the `AppLayout` inside `src/App.tsx`; a content page starts with `<PageHeader>`
  (band + title, and it sets the document title).

## Accessibility

- Icon-only buttons need `aria-label`; toggles use `aria-pressed`; the hamburger also exposes `aria-expanded`.
- Inputs always have a `<label>` — use `sr-only` when the design shows no label.
- Decorative SVG gets `aria-hidden="true"`; a meaningful graphic gets `role="img"` + `aria-label`.
- Tappable targets are at least **48×48px**: give a control smaller than that a `tap-target` (which
  adds 4px a side, so it only reaches 48px from a **40px** control — grow a smaller one to `chip
  medium` / `h-10` first). Never remove focus styling without a
  `focus-visible:ring-*` replacement.

## Gotchas

- The Vite project root is **`split/`**, not the repo root — the short `src/` paths in this file
  are relative to **`split/`**. The `applyTo` globs at the top of this file are repo-root
  relative, which is why they start with `split/` and not `src/`.
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
  `src/components/navbar.tsx`.
- BeerCSS's `<i>` icon ligatures only render if the name is in the Google Fonts subset URL in
  `split/index.html`. That includes the glyphs BeerCSS components draw themselves —
  `check_box`, `check_box_outline_blank` (checkbox) and `check` (switch). A filled Material Symbol
  (the rating stars) is BeerCSS's `i.fill`, which flips the `FILL` axis.
- `split/src/index.css` imports `elements/selection.css` **in addition to** `elements/all.css`:
  BeerCSS 5's `all.css` does not pull it in, and without it checkboxes, radios and switches fall
  back to the browser's own controls. Keep it inside `layer(beercss)`.
- Validate with `npm --prefix split run build` and `npm --prefix split run lint`,
  and check the result in the browser at http://localhost:5173.
