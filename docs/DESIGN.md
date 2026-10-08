# Zwolle Routes — Design System

The single source of truth for the visual language of this project.
**Read this instead of re-deriving styles by scanning the codebase.**

> **Upstream spec:** [`docs/reference/material-3-reference.md`](reference/material-3-reference.md)
> holds the distilled Material 3 spec (component metrics, motion, accessibility). This file is
> what the project _decided_; where the two differ, §16 says so and why.

> Last updated: 2026-10-01

> **Keep this file current, automatically.** Any change that touches something written down here —
> a token, a role, a recipe, a class, a path, a name, a rule, a number — updates this file in the
> same change, before the work counts as done. A stale design system is worse than none, because
> the next reader follows it and gets the wrong answer. Genuinely new behaviour is recorded in
> §16 as a deviation; a correction is edited in place, along with every reference to a file that
> moved.

---

## 1. Brand at a glance

**Zwolle Routes** is a Dutch route planner for walking and cycling through Zwolle, with a
historic map layer shown next to the present-day map.

The visual language is **Material 3 (Material You)**, implemented with **BeerCSS**, wearing
the **Deltion huisstijl**: blue, orange and white.

| Aspect          | Direction                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Design language | Material 3 — tonal color roles, 12-column grid, filled/outlined components                                                                 |
| Implementation  | BeerCSS components + Material 3 CSS variables, Tailwind for layout                                                                         |
| Brand           | **Deltion blue `#282C6D`** (structure) · **Deltion orange `#F68221`** (accent) — nothing else                                              |
| Mood            | Historic meets modern — warm paper vs. cool digital                                                                                        |
| Canvas          | `surface`: warm paper in light, desaturated navy in dark; the hero + footer are `inverse-surface` bands (white in light, navy-950 in dark) |
| Surface         | `surface` (white) for content, `sand-*` for historic map art                                                                               |
| Accent          | One Deltion orange (`--primary` / `--heading`) — used sparingly, as the top bar's brand surface in light mode and as the ink in dark mode  |
| Type            | Montserrat for headings, Inter for everything else                                                                                         |
| Gradients       | **None.** Not in CSS, not in SVG, not as image overlays                                                                                    |
| Themes          | Light **and** dark, both built from the Deltion palette; toggled from the top bar                                                          |
| Language        | Dutch (`nl-NL`) UI copy, sentence case                                                                                                     |

**The core visual metaphor:** warm `sand-*` tones represent the past, cool `haze-*` blue-grey
represents the present. They are placed adjacently (map layers, route artwork) to tell the
"toen en nu" story. Reuse this contrast rather than inventing new colors.

> The palette is deliberately **blue · orange · white** — the Deltion school colors. Blue and
> orange are the only hues in the system; everything else is a neutral step of those two.

---

## 2. How the system is wired

Three pieces, and the order between them matters:

| Piece              | Where                                                          | Owns                                                                                                                 |
| ------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Deltion palette    | `src/index.css` → `@theme static`                              | Two seeds (`--seed-orange`, `--seed-blue`) and the ramps derived from them: `orange-*`, `blue-*`, `sand-*`, `haze-*` |
| Material 3 roles   | `src/index.css` → `:root, body.light`                          | `--primary`, `--surface`, `--outline`, … that BeerCSS reads                                                          |
| BeerCSS components | `src/index.css` → `@import … layer(beercss)`                   | Buttons, fields, cards, chips, grid, slider, icons                                                                   |
| One component      | `src/components/<component>.css`, imported by that component   | what only that component draws — today the hero's layer fade (`hero.css`), the fix for Google's own DOM inside a map (`areaMap.css`) and the chosen filter's brand fill (`filterSelect.css`) |

**Where CSS lives.** `index.css` holds what the whole page needs: the tokens, the colour roles, the
typography rules, and the corrections every `beercss` component shares. A rule that only ever draws
**one component** goes in that component's own stylesheet next to it, imported by it (the same
`@layer overrides` when it is taking something back from the framework) — a component is a file in
this repo, and its style is part of it.

### Cascade layers

`src/index.css` declares the layer order first:

```css
@layer overrides, theme, base, beercss, components, utilities;
```

- `beercss` sits **above** Tailwind's preflight — otherwise the reset flattens every Material 3
  component.
- `beercss` sits **below** the utilities — Tailwind layout and spacing classes still win.
- `overrides` sits **first**, which for `!important` declarations means **last word** (the cascade
  inverts for important rules). It is the one place a framework rule is taken back, and every rule
  in it carries the flag — a normal declaration there would be the weakest in the file. `index.css`
  keeps six things in it: **the 2px boundary** (§5, §7) — every outlined control, every card and
  panel, and the floating label's notch, all widened from BeerCSS's 1px _without moving the text_;
  **the one corner** — `--radius-box` on every box, because beerCSS ships four radii of its own (§5); the rule that keeps a long **`<select>` value on one
  line** (BeerCSS's `all: unset` drops the browser's own `white-space`), plus
  the trimmed trailing slot that makes room for it; the two things BeerCSS gets wrong in the **map
  slider**; **a button is a border box** — beerCSS draws it `content-box`, so a full-width row used to
  measure 100% of its column _plus_ its own padding (§6); and the framework-wide **shadow switch-off**.
  A component's own file adds to the same layer, so it is read the same way (see the `filterSelect`
  and `areaMap` stylesheets).

Practical consequences:

1. A Tailwind utility always beats a BeerCSS declaration of the same property
   (`class="p-0"` on `<main>` cancels BeerCSS's `main { padding: .5rem }`).
2. BeerCSS still beats Tailwind's preflight, so `<button>`, `<article>` and `<input>` keep their
   Material 3 look.
3. BeerCSS color helpers use `!important`, and for important declarations the layer order
   **inverts** — so a BeerCSS color class (`.primary`, `.fill`) also beats a Tailwind `bg-*`
   utility. Never put both on one element: pick one owner for the color.
4. To beat a BeerCSS `!important` you cannot simply out-`!important` it from an unlayered rule —
   layered important always wins over unlayered important. Put the override in `@layer overrides`
   instead.
5. Two pages (`contactPage`, `loginPage`) import **`beercss/scoped`** and wrap their sections in a
   `div.beer`. Inside that wrapper beerCSS carries `* { all: revert }`, and because that rule is
   unlayered it throws Tailwind's *normal* utilities away: an `h-12` or a `p-5` written in there does
   nothing. Those pages use beerCSS's own classes, or a utility with the **`!`** modifier (`h-12!` —
   layered *and* important, so it wins). Everything the design system imposes still arrives, because
   `@layer overrides` carries the flag: the 2px boundary and the one corner land on a scoped page
   exactly as they do elsewhere.

### Class-name collisions to respect

Some names exist in both systems with _different_ meanings. When you use one, do not add the
Tailwind utility of the same name:

| Class                                         | BeerCSS meaning                                           | Tailwind meaning    | Rule                                                                                        |
| --------------------------------------------- | --------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| `grid`                                        | 12-column grid (`grid-template-columns: repeat(12, 1fr)`) | `display: grid`     | Use BeerCSS `.grid` + `.s12/.m6/.l4`. Never write a bare Tailwind `grid` with `grid-cols-*` |
| `fixed`                                       | `position: sticky` app-bar behaviour                      | `position: fixed`   | Use `sticky top-0 z-50` on the header; never `fixed`                                        |
| `border`                                      | outlined variant of a component                           | `border-width: 1px` | Fine together, but the component's own meaning wins; the project draws the line at 2px (§5) |
| `shadow`                                      | bottom shadow helper                                      | box-shadow          | Prefer `.elevate` / `.medium-elevate` / `.large-elevate`                                    |
| `transparent`, `fill`, `circle`, `max`, `row` | BeerCSS component states/helpers                          | –                   | BeerCSS only — safe                                                                         |

**Element collisions sit next to the class ones.** BeerCSS reads structure, not only names:

- A `<ul>` or `<ol>` that is a **direct child of a `<nav>`** is one of its dropdown menus
  (`position: absolute; inset: 0`), so the list is laid _over_ the `<nav>`'s other children. Keep
  the list one level lower (the footer puts each one in a `div`) or the links land on the heading.
- `:not(.grid, nav, .row) > * + :is(…, ul, nav, p, …)` adds **`1rem` above any of those elements
  that follows a sibling**, which doubles up with a `gap-*` already doing the spacing. `mt-0`
  (a Tailwind utility, so it wins) takes it back.
- `nav > :is(ol, ul) > li` also `all: unset`s the items, so a list that _is_ meant to be a nav
  menu never inherits anything by accident.
- `* { border-radius: inherit }` is on **every element**, so a `border-t` divider inside a 1rem
  card is painted as the top edge of a rounded box and curves away from the card's straight edges.
  A divider is a line: give it `rounded-none` (§7). The same inheritance curves the seam between two
  children of a clipped panel — the hero's picture and its rail — so anything that butts against its
  neighbour or the panel's own edge is squared too (§5).
- `* { position: relative }` is on **every element too** — the trap a "stretched link" walks into. A
  link whose `::after` is `absolute inset-0` to make a whole card clickable fills the link's own box
  (or its nearest positioned parent), never the card, because every ancestor already establishes a
  containing block. A whole-card target is an **overlay link** as a direct child instead (§7).

### Icons

- Icons are **Material Symbols** rendered with BeerCSS's `<i>` element
  (`<i className="text-base">search</i>`), via the `<Icon>` helper in `src/components/icon.tsx`.
- The font is a **Google Fonts subset**, linked in `index.html`. **Adding a new icon means
  adding its name to that URL first** — otherwise the ligature renders as literal text. That
  includes the glyphs BeerCSS's own components draw (`check_box`, `check_box_outline_blank`,
  `check` for the checkbox and the switch) — a missing name shows up as a clipped word, not as
  an empty box.
- A _filled_ Material Symbol (the rating stars) is BeerCSS's `i.fill`, which flips the `FILL`
  axis: `className="fill text-base text-accent"`. Colour alone would leave a filled and an empty
  star differing only in lightness.

### Deliberately not imported

BeerCSS is imported piecewise from `beercss/src/cdn/…`:

- `settings/font.css` is skipped — it bundles all three Material Symbols families (~1.4 MB).
- `settings/dark.css` is skipped — it ships BeerCSS's own purple dark palette. The dark theme is
  defined from Deltion colors in `src/index.css` instead, and BeerCSS is told which one is active
  by the `light` / `dark` class on `<body>`.
- `elements/selection.css` is imported **extra**, because BeerCSS 5's `elements/all.css` does not
  pull it in. Without it the Material 3 checkbox, radio and switch fall back to the browser's own
  controls (a native checkbox is not a `tap-target` and does not follow the roles). It joins the
  same `beercss` layer, so the cascade order is unchanged.

### Themes

The palette is selected by the class on `<body>`: `body.light` or `body.dark`, with the same
Material 3 role names in both. Nothing else in the app knows which theme is running — components
read roles, so they never branch on the theme.

| Piece                                 | Responsibility                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `index.html` → `<body class="light">` | The default, and the signal that stops BeerCSS from auto-switching to its own palette |
| `index.html` → inline script          | Re-applies the stored theme before the first paint, so there is no flash              |
| `src/components/navbar.tsx`           | The bar's own theme switch: it owns the state, writes the `<body>` class and persists the choice to `localStorage` (`THEME_STORAGE_KEY`) |

Adding a theme-aware colour means adding a **role** to both blocks in `src/index.css`, not a
fixed colour in a component. Three effects exist in the whole codebase, and each syncs with
something outside React because it has to: the bar's theme switch (the `<body>` class and
`localStorage`), `ScrollToTop` in `src/App.tsx` (the scroll position after a route change) and
`PageTitle` (`document.title`).

---

## 3. Color

**Two colours. Everything else is a shade of them.**

| Brand colour   | Hex       | What it is for                                                                                                                                        |
| -------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deltion blue   | `#282C6D` | Structure: **all text**, canvases, hairlines, buttons, the dark theme, the bar in dark mode                                                           |
| Deltion orange | `#F68221` | Accent: a **fill** on light surfaces (the bar, selection, tints, route lines, map pins) and the **ink** on the dark navy (headings, eyebrow, figures) |

Two layers, and you rarely touch the first one:

1. **The palette** — `@theme static` in `src/index.css` derives the shades of each brand colour
   (`--color-orange-50…500`, `--color-blue-50…950`) plus the warm and cool neutrals, and exposes them
   as Tailwind utilities (`bg-orange-500`, `text-blue-900`, `fill-orange-500`, …).
2. **Material 3 roles** — `--primary`, `--surface`, `--outline`, … in `:root, body.light` and
   `body.dark`. BeerCSS components are painted from these. **Change the look by changing roles, not
   components.**

> **Never hardcode a hex value in JSX or CSS.** Use a generated utility class, a BeerCSS color
> class, or `var(--role)`. If a colour is genuinely missing, add it to the palette first.

### Re-branding is a two-line edit

```css
--seed-orange: #f68221;
--seed-blue: #282c6d;
```

Every surface, hairline, accent and dark-mode step follows from those two. The ramps are generated
with `color-mix(in oklab, …)`, mixed toward white for the light steps and toward black for the deep
**blue** ones only — the orange ramp has no dark half (see rule 1):

```css
--color-orange-500: var(--seed-orange);
--color-orange-100: color-mix(in oklab, var(--seed-orange) 15%, white);
--color-blue-900: color-mix(in oklab, var(--seed-blue) 54%, black);
--color-navy-900: oklch(from var(--color-blue-900) l calc(c * 0.62) h);
--color-sand-200: color-mix(in oklab, var(--seed-orange) 15%, white);
--color-haze-300: color-mix(in oklab, var(--seed-blue) 20%, white);
```

Five rules make that work — each exists because ignoring it produced a colour that clashed:

1. **Orange is mixed toward white, never toward black.** A darkened orange reads as _brown_: it stops
   looking like the brand and starts looking like mud, which is exactly what the old dark-orange top
   bar was. So the orange ramp **stops at `#f68221`** — `orange-50…500` only. On a light surface
   orange is therefore a **fill colour**, because every orange dark enough to read on paper is already
   brown; there the accent text is the deep blue (`--heading`, `--accent-text` = `blue-500`).
2. **On the dark theme's navy the true orange is the accent ink.** `#f68221` on `#0d0f21` measures
   7.4:1, so the dark theme paints its headings and accents with the full-strength brand orange —
   undiluted. Light mode writes in blue and fills in orange; dark mode fills in blue and writes in
   orange. That is the whole balance.
3. **Never mix one brand colour into the other.** Orange mixed with blue goes muddy; the ramps are
   each mixed with white or black alone, which is what keeps the two hues from clashing.
4. **Mix in `oklab`, not `srgb`.** sRGB mixing desaturates as it lightens, so the light steps come
   out grey; `oklab` holds the hue and the chroma on the way up. The one place chroma is removed on
   purpose is the dark theme's `navy-*` ramp (rule 6).
5. **The neutrals are brand colours at low strength.** `sand-*` is orange over white (the warm
   “historic paper”), `haze-*` is blue over white (the cool “present-day water”). No grey enters the
   palette as a _hue_, which is why nothing can clash with the two brand colours.
6. **The dark surfaces are desaturated, and only they.** `#282c6d` faded toward black keeps its full
   chroma ratio, so at canvas depth it covers a screen in a vivid, _pure_ blue. The dark theme wants
   the greyer, duskier navy of a city at dusk, so the deep steps are re-derived through
   `oklch(from …)`, which carries `l` and `h` over untouched and only scales `c` (× 0.62). Nothing is
   hardcoded — re-branding still means editing the two seeds — and the _brand_ blue (text, buttons,
   the light theme) stays at full chroma.

| Shade                       | Value                 | The job it does                                                                                                                     |
| --------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `orange-500`                | `#f68221`             | The brand orange itself: the light bar, a selected chip, route lines, map pins — **and every heading and accent in dark mode** |
| `orange-100`                | `#ffede2`             | **Light orange** — the light tint: text selection, quiet fills, the selected card                                                     |
| `orange-50`                 | `#fff6f1`             | The faintest tint, for rows and hover states                                                                                        |
| `orange-200` … `orange-400` | lighter and lighter   | Decoration only: map water, artwork tints                                                                                           |
| `blue-500`                  | `#282c6d`             | The brand blue itself — **every heading and accent in light mode** (12.6:1 on white)                                                |
| `blue-900`                  | `#0b0d2b`             | Light-theme body text (18:1 on paper)                                                                                               |
| `navy-600` … `navy-950`     | `#23283f` … `#050713` | The dark theme's canvases, cards, bands and bar — the deep blue with a third of its chroma removed                                  |
| `sand-200`                  | `#ffede2`             | The light canvas — the warmer section between the white bands                                                                       |
| `haze-300`                  | `#cfd2e2`             | Every 2px hairline in the light theme                                                                                               |

### The balance: light is orange-filled, dark is orange-written

The two brand colours never carry equal weight inside one theme, which is what stops them fighting,
and they trade roles when the theme flips:

|                   | Light                                                                                 | Dark                                                                                |
| ----------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Leading colour    | **Orange, as fill** — the bar, a selected chip, the light tints, the route lines     | **Blue, as surface** — every canvas, card, band and button, desaturated toward grey, with the selected chip the one full-strength blue |
| Supporting colour | Blue is the _ink_: every heading, every accent, body copy, icons, hairlines           | Orange is the _ink and highlight_: headings, the eyebrow, the avatar, route lines   |
| Never             | Orange text — it would have to be brown to be legible                                 | Orange over large areas — an orange button fill, an orange panel, orange body copy  |

### Material 3 roles → brand values

| Role                                                 | Value                                                                                                                        | Reads as                                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `--primary`                                          | light `orange-500`, dark `blue-300`                                                                                          | The fill of a selected or primary action: brand orange on paper, Deltion blue on navy            |
| `--on-primary`                                       | light **white**, dark `blue-950`                                                                                             | On the brand orange in light mode (2.6:1 — see the colour rules), on the light blue fill in dark |
| `--primary-container` / `--on-primary-container`     | light `orange-100` / `blue-900`, dark `blue-800` / `blue-100`                                                                | The **quiet** fill next to a primary one: light orange tint in light mode, deep blue in dark     |
| `--inverse-primary`                                  | light `orange-500`, dark `orange-500`                                                                                        | Orange on the bands                                                                              |
| `--secondary` / `--on-secondary`                     | light `blue-500` / white, dark `blue-300` / `blue-950`                                                                       | Deltion blue                                                                                     |
| `--secondary-container` / `--on-secondary-container` | light `orange-100` / `blue-900`, dark `blue-800` / `blue-100`                                                                | Selected **surfaces** (the place card that follows the map) and beerCSS's own containers         |
| `--selected` / `--on-selected`                       | light `orange-500` / **white**, dark `blue-500` / **white**                                                                  | The fill of a **selected control** — a chip that is on: the full brand seed, never a tint of it  |
| `--tertiary` / `--tertiary-container`                | `sand-300` / `sand-200`                                                                                                      | Historic paper                                                                                   |
| `--surface` / `--on-surface`                         | light `sand-200` / `blue-900`, dark `navy-900` / `blue-50`                                                                   | Canvas + body text                                                                               |
| `--surface-variant` / `--on-surface-variant`         | light `haze-200` / blue at 72% on white (5.5:1), dark `navy-800` / `blue-200`                                                | Map water, muted text                                                                            |
| `--surface-container-lowest … highest`               | light white → white → `sand-100` → `sand-200` → `sand-300`; dark `navy-950` → `navy-800` → `navy-700` → `navy-600` → lighter | Card, panel and section steps — **each step visibly different from the one below**               |
| `--outline` / `--outline-variant`                    | light `blue-400` / `haze-300`, dark `blue-400` / haze tint on `navy-900`                                                     | Borders and hairlines                                                                            |
| `--inverse-surface` / `--inverse-on-surface`         | light **white** / `blue-900`, dark `navy-950` / `haze-100`                                                                   | The hero + footer bands — see below                                                              |
| `--heading`                                          | light `blue-500`, dark `orange-500`                                                                                          | What every `h1`–`h6` is painted with — the role that makes each theme read the way it does       |
| `--bar` / `--on-bar`                                 | light `orange-500` / **white**, dark `navy-950` / `haze-100`                                                                 | The top bar, which flips its leading colour with the theme                                       |
| `--avatar` / `--on-avatar`                           | light `blue-500` / white, dark `orange-500` / `blue-950`                                                                     | The avatar always wears the _opposite_ brand colour to the bar it sits on                        |
| `--error`                                            | `#ba1a1a` light / `#ffb4ab` dark (Material 3 defaults)                                                                       | Errors only                                                                                      |

### Muted and strong text

`@theme inline` aliases three utilities onto the roles above, so text and hairlines follow the
theme without any component knowing about it:

| Utility          | Role                   | Light                        | Dark              |
| ---------------- | ---------------------- | ---------------------------- | ----------------- |
| `text-ink`       | `--on-surface`         | `blue-900`                   | `blue-50`         |
| `text-ink-muted` | `--on-surface-variant` | blue at 72% on white (5.5:1) | `blue-200`        |
| `text-accent`    | `--accent-text`        | `blue-500` (12.6:1)          | `orange-500`      |
| `text-heading`   | `--heading`            | `blue-500` (12.6:1)          | `orange-500`      |
| `border-line`    | `--outline-variant`    | `haze-300`                   | haze tint on navy |

**Do not reach for Tailwind's `slate-*`** — those are fixed greys and go unreadable in the dark
theme. Don't dial emphasis down with opacity either: `text-ink-muted/70` measures 3.4:1 on a
card, so the quietest text keeps `text-ink-muted` and takes its restraint from size instead.

### Dark theme roles

Material 3 inverts the tonal roles in dark mode: the accent is lifted a step so it still reads on
a dark surface, and containers step **up** in lightness instead of down.

| Role                                                 | Dark value                                        | Why                                                                                                                  |
| ---------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `--primary`                                          | `blue-300` (`#a5abc8`)                            | In dark mode a button is **blue** — orange is reserved for the ink, so the theme does not become two colour families |
| `--on-primary`                                       | `blue-950`                                        | Deep navy on the light blue fill (8.1:1)                                                                             |
| `--primary-container` / `--on-primary-container`     | `blue-800` / `blue-100`                           | The unselected / quiet fill — a step of blue, not of orange                                                          |
| `--secondary` / `--on-secondary`                     | `blue-300` / `blue-950`                           | Deltion blue lifted to a light tone                                                                                  |
| `--secondary-container` / `--on-secondary-container` | `blue-800` / `blue-100`                           | The selected **surface** and beerCSS's own containers                                                                |
| `--selected` / `--on-selected`                       | `blue-500` (`#282c6d`) / **white**                | The selected **control**: the true Deltion blue, the mirror of light mode's orange, under white                      |
| `--surface` / `--on-surface`                         | `navy-900` (`#0d0f21`) / `blue-50`                | The dark canvas — the brand navy with a third of its chroma removed                                                  |
| `--surface-container-*`                              | `navy-950` → `navy-800` → `navy-700` → `navy-600` | Cards and panels step **up** out of the canvas                                                                       |
| `--inverse-surface` / `--inverse-on-surface`         | `navy-950` / `haze-100`                           | The band is one step _deeper_ than the canvas, so hero and footer still read as bands                                |
| `--heading` / `--accent-text`                        | `orange-500` (`#f68221`)                          | The **true brand orange**, undiluted: 7.4:1 on the navy — the ink that makes the theme pop                           |
| `--inverse-primary`                                  | `--accent-text`                                   | The accent role, so it tunes itself per theme                                                                        |
| `--outline-variant`                                  | haze tint on `navy-900`                           | Hairlines stay visible on dark                                                                                       |
| `--active`                                           | haze tint at 14%                                  | BeerCSS's state layer / slider track                                                                                 |

**The hero and footer bands follow the theme, and they are the _lightest_ surface in light mode and
the _deepest_ in dark mode.** Light: pure white bands, warm paper canvas between them. Dark: navy-950
bands, navy-900 canvas. A light theme with a permanently dark hero reads as a bug, so a band is only
ever one role away from the page it sits in. Because both bands are painted with `inverse-surface`,
everything inside them uses the same theme-aware utilities as the rest of the page (`text-ink`,
`text-ink-muted`, `text-accent`, `border-line`) and switches for free.

The one deliberate exception is the **map artwork**: it paints fixed `sand-*` / `haze-*` / `orange-*`
utilities, because a historic map has no dark mode. Artwork keeps its own colours; anything that
carries or describes it uses roles.

- **Elevation needs a surface to fall on.** On white, a shadow is nearly invisible and a hairline
  is the only separation there is — so the _surface steps themselves_ have to do the work (§3).
- **Check a new colour in both themes for separation, not just contrast.** A passing contrast ratio
  says nothing about whether a card is distinguishable from the page it sits on.

### Color rules

1. **Orange is a fill in light mode and ink in dark mode — never the other way round.** Light mode
   leads with orange as the bar, a selected chip and the warm tints, and writes in blue, because
   every orange dark enough to read on paper has already turned brown and stopped being the brand
   colour (rule 1 of the ramp). Dark mode fills in blue and writes in the true `#f68221`, which
   measures 7.4:1 on the navy.
2. **Text _on_ the brand orange is white; text on a light orange tint is blue.** White is only ever
   placed on `orange-500` itself — the bar, a selected chip, a filled action, the artwork badge —
   and never on the `orange-100` tints (`--primary-container`), where it would be invisible; those
   carry `blue-900`. **This is the one deliberate contrast trade in the system:** white on `#f68221`
   measures **2.6:1** (blue on the same orange measures 7.8:1), so the light-mode bar and a selected
   chip are below WCAG AA. It buys the brand's own pairing and a bar that does not read as a
   different palette. Every alternative was worse — a darkened orange is brown — so if the bar is ever
   re-examined, the fix is to darken the _fill_, not to move the text. Until then this is documented
   rather than silently allowed (§11, §16).
3. **Text carrying the accent comes from a role, never from an orange utility.** `--heading` and
   `--accent-text` are `blue-500` in light mode (12.6:1 on white) and `orange-500` in dark mode, and
   `text-heading` / `text-accent` read them. Never write `text-orange-500` — it is a _fill_ tone.
4. **Dark-mode buttons are blue.** `--primary` and `--primary-container` are both steps of blue in
   the dark theme; orange appears there as ink, the avatar and route lines.
5. **Text colour comes from a role, never from a fixed scale.** `text-ink` / `text-ink-muted` for
   body and meta text, `text-haze-100/…` on the dark bands. No fixed greys.
6. **Never place artwork straight on a brand colour** — the warm and cool
   steps vibrate.
7. **No gradients.** Solid color steps, borders or hairlines only. On dark artwork use a solid
   `surface` panel for controls instead of a gradient scrim.

---

## 4. Typography

Two families, loaded from Google Fonts in `index.html`. Do not add a third.

| Role      | Family     | Tailwind                                                 | Weights used       |
| --------- | ---------- | -------------------------------------------------------- | ------------------ |
| Headings  | Montserrat | `font-display` (applied to `h1`–`h6` in `@layer base`)   | 500, 600, 700, 800 |
| Body / UI | Inter      | `font-sans` (default on `body`; also BeerCSS's `--font`) | 400, 500, 600, 700 |

### Scale

| Element            | Classes                                                         | Notes                                                                                                                      |
| ------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Hero `h1`          | `text-display font-bold`, over **two spans**                    | Fluid: `clamp(2rem, 4.4vw + 0.35rem, 4.5rem)`; the spans sit next to each other from `lg`, stacked into two lines below it |
| Page `h1`          | `text-headline font-bold`                                       | Fluid: `clamp(1.875rem, 2.6vw + 0.9rem, 3.25rem)`                                                                          |
| Section `h2`       | `text-title font-bold`                                          | Fluid: `clamp(1.625rem, 1.5vw + 1rem, 2.5rem)`                                                                             |
| Card `h3`          | `text-xl font-bold`                                             |                                                                                                                            |
| Body copy          | `text-[15px] leading-relaxed text-ink-muted`                    | Cap prose at `max-w-md`–`max-w-2xl`; **justified** (see below)                                                             |
| Small body / meta  | `text-sm text-ink-muted`                                        |                                                                                                                            |
| Micro / label      | `text-xs text-ink-muted`                                        |                                                                                                                            |
| Accent link / icon | `text-accent`                                                   | Never `text-orange-500` — it is a fill tone                                                                                |
| Eyebrow            | `text-xs font-semibold uppercase tracking-[0.22em] text-accent` | Above `h1` only; legible on both band tones                                                                                |
| Chip / badge       | `text-[11px] font-bold uppercase tracking-wide`                 |                                                                                                                            |
| Icon               | `text-base` / `text-xl`                                         | Material Symbols are sized by `font-size`                                                                                  |

### Type rules

**Body copy is justified.** Every `p` is `text-align: justify` with `hyphens: auto` (`index.css`): the
copy sits in wide columns, and the ragged right edge was the widest thing on the page. `lang="nl"`
on `<html>` is what makes the hyphenation Dutch. Headings, labels and the words on controls keep
their own edges, and a line that does not wrap is untouched by justification.

1. **Montserrat for headings only.** Body copy, buttons, labels and chips are Inter.
2. Headings inherit Montserrat from the base rule — you only need `font-display` to give a
   non-heading element the display face. **Never use Tailwind's default `font-serif`.**
3. Sentence case everywhere — no Title Case, no ALL CAPS except eyebrows and badges.
4. The bands (`inverse-surface`) take the same ink utilities as the rest of the page — the roles
   resolve per theme. Quiet text is `text-ink-muted`; never dim it with opacity (§3: that measured
   3.4:1).
5. Stat figures use `font-display` for a "ledger" feel.

---

## 5. Shape, elevation & spacing

**Spacing**

| Purpose                 | Classes                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page gutter             | `px-gutter` — `clamp(1rem, 2vw, 2rem)`                                                                                                                                                                                |
| Content max width       | `max-w-[100rem]` (1600px) on the inner container                                                                                                                                                                      |
| Section vertical rhythm | `py-band` — `clamp(2rem, 4vw, 3.25rem)` for every content section; the **hero band** trades it for `py-hero` (`clamp(0.5rem, 1.2vw, 1rem)`), because that band is one screen tall and the map is what the room is for |
| Page header band        | `PageHeader` runs `pt-header pb-band` — `clamp(1.5rem, 2.6vw, 2.5rem)` above the title, so the `h1` sits close to the top bar the way the hero's headline does                                                        |
| Grid gutter             | `gap-6` on BeerCSS's `.grid` (see §6 — the gap is multiplied by 11)                                                                                                                                                   |
| Card inner padding      | `p-5` (the `article` itself is `no-padding` so the artwork can bleed)                                                                                                                                                 |
| Stacked element gap     | `gap-3` (buttons), `gap-6` (footer blocks)                                                                                                                                                                            |

**Shape** — **one corner on every box: 24px.** BeerCSS ships four radii (a 2rem round field, a
1.25rem button, a 0.75rem card, a 0.5rem chip), so a page carried four shape systems at once: a pill
search bar directly above a rounded rectangle card. The corner is one token, `--radius-box`
(**1.5rem**, 24px at the root size the app sets), applied once in `@layer overrides` (§2) the way the
2px boundary is — and a hand-built panel reaches for it as `rounded-box` instead of a one-off utility:

| Element                         | Source                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------- |
| Fields, buttons, chips, badges  | `--radius-box` (1.5rem) — a 48px control clamps to exactly half: a true pill  |
| Cards, map panels, menus        | `--radius-box` (1.5rem) — the full 24px, a corner rather than half a card     |
| Icon buttons                    | BeerCSS `.circle` on a `<button>`                                             |
| Anything square                 | Only a seam: a divider or a child butting inside a clipped panel (see below)   |
24px is the value that works for the whole page at once. Because a radius is *clamped to half a box*, the one token renders as the right corner at every control height — a 48px field draws **24px**, a 40px action **20px**, a 32px chip **16px** — while a card simply draws the 24px it says: the corner a card wears is the corner the action on it renders. Anything larger would round the cards past their own controls, anything smaller would square the pills off, and it is what lets a search bar sit directly above a card without either reading as wrong.

**Control metrics** — every single-line control resolves to the same handful of numbers, which is what makes a row of them read as one line instead of five boxes at four heights:

| Control                         | Height                   | Corner             | Hit area                     |
| ------------------------------- | ------------------------ | ------------------ | ---------------------------- |
| **Thin, long bar** (a full-width field, a submit, an accordion row) | **48px** | 1.5rem → **24px (pill)** | the bar itself          |
| Field (`.field`, its control)   | **48px**                 | 1.5rem → 24px (pill) | the control itself           |
| Action standing beside a field  | **48px** (`h-12`)        | 1.5rem → 24px (pill) | the control itself           |
| Filled / outlined action, alone | 40px (BeerCSS `--_size`) | 1.5rem → 20px (pill) | `tap-target` → 48px          |
| Icon button (`.button.circle`)  | 40px                     | circle             | `tap-target` → 48px          |
| Chip, decorative (`<span>`)     | 32px                     | 1.5rem → 16px        | none — it is not interactive |
| Chip, interactive (`<button>`)  | 40px (`chip medium`)     | 1.5rem → 20px        | `tap-target` → 48px          |

The rules that fall out of that table are all load-bearing:

- **`tap-target` only reaches 48px on a control that is at least 40px tall** — it adds 4px a side. So an interactive chip is **`chip medium tap-target`** and never a bare `chip`, and a chip that is only ever a label (`<span>`) stays at BeerCSS's 32px. A 32px *button* has no compliant recipe at all; grow it to `medium` first.
- **`tap-target` cannot be positioned itself.** Its rule (`index.css`) is unlayered — it has to outrank BeerCSS's own button declarations — so its `position: relative` beats any Tailwind `absolute` on the same element, and `top`/`right` then *shift* the control instead of placing it. A control that needs both carries `tap-target` on the button and the position on a **wrapper** (`<div className="absolute right-4 top-4 z-10">`), which is what the save button on a route card and the share button on the map do.
- **An action beside a field takes `h-12`.** BeerCSS's button is 40px, a field is 48px, so without it the two boxes disagree by 8px and the row's right-hand action floats above the fields' baseline. At `h-12` both are 48px and share a top and a bottom (`responsive.spec.ts` pins it).
- **A thin, long element is a pill — and a pill is 48px tall.** A box that is much wider than it is
  tall reads as a bar, and a bar wants the stadium: **48px**, the height at which the one token's
  24px is exactly half the box. It is what a full-width field, a submit action, an accordion row and
  the builder's hint bar all are. Two ways to break it: a bar at BeerCSS's `large`/`extra` size
  (**56px**) draws a 24px corner on a taller box — a rounded rectangle, not a pill, and the shape the
  contact page used to carry — and a bar that has to be taller than 48px (a textarea, a panel) is
  deliberately *not* a pill. Prefer the pill whenever an element is thin and long; only a block gets
  the corner on a bigger box.
- **A child that butts inside a clipped panel is square.** The panel clips its own corner
  (`overflow-hidden` + the token above), so it already draws every outer corner of everything inside
  it — and a child that fills it (the hero's picture and its rail, a card's media band, the map's
  hover preview picture) takes **`rounded-none`**. Without it the child draws its own 24px on the
  shared edge too, the seam curves away from its neighbour and the panel reads as two cards in a
  frame instead of one component. This is the same reason a `border-t-2` divider carries
  `rounded-none` (§7), and it is the one place a box is square. Controls inside the panel are
  untouched: a chip or a button beside the picture still takes the full token. The rule in the override
  layer excludes `rounded-none` (`:not(.rounded-none)`), so the utility really wins — without that, its
  `!important` handed the corner back to anything in the list, a `<button>` row included.

**The `.field` wrapper carries no border.** BeerCSS paints a field's boundary on the *control inside it* (`--outline` at rest, `--primary` at 2px on focus), so `@layer overrides` takes the 1px hairline Tailwind's `border` utility leaves on the wrapper down to **0**. A transparent border is still a border: it made every `.field` 50px tall around its own 48px control, which is the kind of 2px that makes an otherwise aligned row look subtly wrong.



**Elevation** — **there is none.** Nothing in the app casts a shadow: shadows are switched off
framework-wide in `@layer overrides` (§2), because a blurred offset edge reads as a smudge, or as a
soft gradient, and neither belongs in this language. Depth is expressed with the tools that survive
a flat page:

| Instead of a shadow | Use                                                  |
| ------------------- | ---------------------------------------------------- |
| A card on a section | One surface step (white on paper, or paper on white) |
| A panel on artwork  | A solid `surface` panel, or a chip with a hairline   |
| A bar over content  | A tonal step, or `border-b border-line`              |

| Level                    | Class                                 |
| ------------------------ | ------------------------------------- |
| Resting                  | `elevate` (Bar, card, floating chip)  |
| Raised                   | `medium-elevate`                      |
| Hero artwork             | `large-elevate`                       |
| Flat / on top of artwork | `no-elevate`, or a solid surface chip |

**Boundaries are 2px — nothing is thinner.** Material 3 draws a 1px boundary; this project draws the
same line one step heavier, so a control reads at a glance, on a phone and beside a field. Every
boundary is widened once, in `@layer overrides` (§2): an **outlined control** takes `--outline` (a
field's inner control, an outlined button, an unselected filter chip), a **card or panel** takes
`--outline-variant` — `border-2 border-line` in the markup, or the single `article` rule that gives
every card the same edge. The field's floating label draws a second line for its notch, so it is
widened too, and each field's resting padding is set to the value its own focus state already used,
so the text does not move when the line grows or the field is focused. Never a colored ring, and never
a line below 2px.

### Native feel

A handful of `@layer base` rules make the page behave like an app rather than a document
(`index.css`). Each is a platform convention, not a decoration:

| Rule                                             | Why                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `scrollbar-gutter: stable`                       | the menu, the theme and a short→tall page never shift the layout sideways             |
| `-webkit-tap-highlight-color: transparent`       | a tap paints no grey flash box — controls answer with their own ripple instead        |
| `touch-action: manipulation` on controls         | one tap is one action: no double-tap zoom and no 300ms wait                           |
| `::selection` in `--primary-container`           | a selected run of text wears the brand, not the browser's system blue                 |
| `text-wrap: balance` on `h1`–`h6`                | a two line headline splits evenly instead of leaving one word on a line of its own    |
| `-webkit-text-size-adjust: 100%`                 | a phone's landscape reflow cannot inflate the type                                    |

---

## 6. Layout

### App shell

The page root gets BeerCSS's app shell automatically: any element that `:has(> main)` becomes a
full-height grid with `header`, `main` and `footer` areas. Keep that structure:

```jsx
<div>
  <header className="app-bar sticky top-0 z-50 bg-bar text-on-bar px-0">
    <nav>
      …
      <div className="max" />
      … {/* the bar's theme switch is part of navbar.tsx */}
    </nav>
  </header>
  <main className="p-0">…</main>
  <footer className="inverse-surface">…</footer>
</div>
```

- `main` carries `p-0` on purpose: BeerCSS pads `main` by `0.5rem`, which would stop the hero
  band from bleeding edge to edge. The header and the footer carry `px-0` for the same reason —
  their own `px-gutter` is what makes the bar and the footer start at the same gutter as every
  section between them.
- The header is `sticky top-0 z-50` — see the `fixed` collision note in §2.
- **The bar leads with the brand, and flips with the theme** (`bg-bar` / `text-on-bar`). Light mode:
  the true Deltion orange `#f68221` with **white** text and icons — the brand's own loudest surface
  (2.6:1, the one documented contrast trade, §3). Dark mode: the desaturated brand navy with `haze-100`.
  It comes out 65px tall — `px-5`/`px-8` gutters, a 40px icon row and BeerCSS's own header padding.
- **The avatar wears the opposite brand colour to the bar** (`bg-avatar` / `text-on-avatar`): Deltion
  blue with white initials on the orange bar, brand orange with navy initials on the navy bar. It is
  the one element that always contrasts with whatever the bar is doing.
- **The active nav link is marked by weight and an underline**, never by dimming the others with
  opacity (§3) — opacity is the one thing this project never uses to show hierarchy.
- Header nav links are hidden below `lg`; the hamburger toggles `aria-expanded` and swaps the
  `menu`/`close` icon, revealing a stacked list of `button min-h-12` rows. The active row is a
  **translucent state layer over the bar's own colour** (`bg-on-bar/20`) with the same `text-on-bar`
  as its neighbours — an _inverted_ pill would put orange text on white, the one unreadable pairing.
  The standalone search icon collapses below `sm` (the two preview sections and both overviews own a search field) and the gaps
  tighten to `gap-2`, which is what keeps the bar inside a 320px viewport.

### Grid

Use BeerCSS's 12-column grid for page-level layout — **not** Tailwind's `grid`:

```jsx
<div className="mx-auto grid max-w-[100rem] gap-y-10 px-5 lg:gap-x-20">
  {" "}
  {/* 12 columns */}
  <div className="s12 l6">…</div> {/* full → half ≥993px */}
  <div className="s12 l6">…</div>
</div>
```

| Prefix | Applies from  |
| ------ | ------------- |
| `s`    | 0 (all sizes) |
| `m`    | 601px         |
| `l`    | 993px         |

**Gap is multiplied by 11.** The grid always paints 12 tracks and 11 gutters, so a `gap` of
`G` costs `11 × G` of the container's width _before_ any track gets space. A 32px gap therefore
needs 352px and overflows a phone. Rules:

- Keep plain `gap-*` at **24px or less** (safe from a 320px viewport up).
- Above that, put the big gutter on one axis only and gate it behind a breakpoint:
  `gap-y-10 lg:gap-x-20`.
- Never use BeerCSS's `.grid.large-space` (32px) / `.medium-space` for a full-width card list.

Tailwind flex utilities (`flex`, `flex-col`, `flex-wrap`, `items-center`, `gap-*`) remain the
right tool for one-dimensional rows, e.g. a section's search bar or the footer.

### Containers inside `header` / `footer`

BeerCSS makes `header` and `footer` **grid** containers, and a grid item with `mx-auto` shrinks
to its content and centres itself — which silently breaks the page gutter. Every
`mx-auto max-w-[100rem]` container directly inside them needs `w-full`:

```jsx
<header …><nav className="mx-auto w-full max-w-[100rem] px-gutter">…</nav></header>
<footer …><div className="mx-auto flex w-full max-w-[100rem] px-gutter">…</div></footer>
```

With that in place, the logo, hero copy, section headings, card artwork and footer brand all
start on the same 20px (mobile) / 32px (desktop) gutter.

### Pages & routing

The app is **client-routed** (`react-router-dom` — see §15 for why it was added). `src/App.tsx`
maps paths to pages and wraps **every page** in the `AppLayout` written out in that same file
(bar → `main` → footer); the account screen keeps the bar but hides the footer, because it is a
screen of its own. The paths
themselves live in `src/data/navigation.ts`, so the router, the top bar and the footer cannot
disagree about a URL. `/planning` is a `<Navigate to="/routes" replace>` — the planner was folded
into the builder, and the path only survives so an old link still lands somewhere.

The routes page is the one screen with **three jobs, one per url**: the bare builder at `/routes`, a
built route at `/routes/custom/<place-ids>` (the places in visit order, in one comma-separated
segment) and a ready-made route at `/routes/public/<route-id>`. **The url is the state** — the picked
places, and with them the map, the summary and whether the share action is ready, are read from the
url and written back to it. That is what makes a built route shareable, what makes the back button
work, and what lets the share action be a plain copy. An old `/routes/<route-id>` link redirects to
the public url, and `/planning` to the builder. See §7.

**The places page has one url and one anchor.** The home strip's tiles link at a **card**, not at the
page: `/points-of-interest#poi-sassenpoort` (`pointOfInterestPath`). A fragment and not a path,
because the page *is* the same page — the fragment names the card the page should open on, and
`ScrollToTop` already knows how to follow a fragment (`#contact` lands from anywhere). The page reads
it with `parsePointOfInterestAnchor`, so the landing has that place **chosen**: its button says *Op de
kaart* and the map's chip names it. Its card does **not** take the `secondary-container` tone — that
tone is the page's own background colour, so it marks a reader's own pick, which is what a pick looks
like; a card a url named **flashes its own edge twice** in the brand seed instead (§3, §10). The reader's
own picks afterwards stay **out** of the url — a pathname change would send them back to the top of
the page (`ScrollToTop` fires on it), which on a page that *is* a list is losing their place; the
shareable form is the tile's link.

The shell is the only place `<main>` appears, and it carries `p-0`:

```jsx
<div>
  <header className="app-bar sticky top-0 z-50 bg-bar text-on-bar px-0">
    …
  </header>
  <main className="p-0">
    <Outlet />
  </main>
  <footer className="inverse-surface">…</footer>
</div>
```

Every content page opens with `PageHeader` — the hero's band shape without the artwork: the `h1`, an
optional eyebrow and lead paragraph, an optional breadcrumb, and whatever the page needs next
(`children`). The builder and the places page keep the **title alone**: their lead was repeating what
the section headings below already say, and the band reads shorter without it. It sets the document
title too,
so a page is named in the tab, in history and for a screen reader.

A page owns its route, the state its components share, and the order they appear in — not their
markup. The bands, columns and cards it is built from live in `src/components/`, one flat folder,
and a piece earns its own file there by being used in more than one place or by owning a whole band
of a page. §13 ("Where a piece lives") has the rule and the suffix table.

`ScrollToTop` puts a route change back at the top, and honours a `#hash` instead — which is what
makes "Contact" (`/#contact`) work from any page.

### Sections

- Anchored sections clear the sticky header via `:is(section, footer)[id] { scroll-margin-block-start: 5rem }`
  in `index.css` — do not add `scroll-mt-*` per section. The footer is in that rule because the top
  bar's "Contact" link lands on it from any page (`/#contact`) and would otherwise sit under the bar.
- Sections **alternate band → surface → band**: the hero and the footer are `inverse-surface`, the
  content between them is `surface`. In light mode that is paper (`sand-200`) against white — a real
  step, because a 2% tint made the whole page read as white (§3). Cards sitting _on_ a band take
  `surface` (white on paper) so they step up from it.
- Every section's inner container is `mx-auto max-w-[100rem] px-gutter`. The 1600px cap is
  generous on purpose: at 1280px a 1920 desktop wasted a quarter of its width on each side, while
  1600px still keeps the card grid at comfortable sizes.
- **Trailing icon buttons get an optical pull** (`-me-2`): a 24px glyph centred in a 40px circle
  is inset 8px, so without it the icon floats 8px inside the gutter while the logo on the other
  side sits flush against it.
- **Every icon button also carries `tap-target`**, which extends its _hit_ area to the Material 3
  minimum of 48×48px without growing the 40px visual (see §11).

---

## 7. Components

Prefer a BeerCSS component over hand-built styles. These are the canonical shapes, as they appear in
`src/components/hero.tsx` and the pages around it. The shapes that more than one page needs are already
components — `Container`, `SearchField`, `FilterSelect`, `ClearFiltersButton`, `SectionSearchBar`,
`EmptyState`, `SectionHeading`, `PageHeader`, `StarRating`, `MapLegend`, `MapSnapshot`, `RouteShape`,
`AreaMap` — so look for one before writing the markup again (§13).

```jsx
// The hero band — headline over the map panel. The band is one screen tall, and the panel is
// exactly as big as the picture it can show *whole*: `w-fit` + `mx-auto` shrink the panel around
// the image instead of cropping the map to fill the band, so no part of the map is ever off
// screen and the controls the rail carries stay above the fold. The one number in it is the height
// ceiling (`100svh`, not `dvh`, so a phone's URL bar cannot relayout it while you scroll); the
// picture's own ratio comes from the file it came from, so another picture — at another ratio —
// needs no change here at all. `py-hero` stands in for the section rhythm (§5). The headline is
// one h1 in two spans: next to each other from `lg`, on top of each other below it.
<section id="home" className="inverse-surface">
  <Container className="py-hero">
    <h1 className="text-display font-bold">
      <span className="block lg:inline">Ontdek Zwolle</span>{" "}
      <span className="block lg:inline">toen en nu</span>
    </h1>
    <div className="surface mx-auto w-fit …">…</div>
  </Container>
</section>
// Both pictures are `w-auto max-w-full object-contain` inside that shell, so each is shown in full
// and the stacked pair stays aligned; the frame's own size follows the *intrinsic* ratio, which
// outranks the width/height attributes the pictures still carry (§8). The map panel itself (the
// stacked pictures, the cross-fade slider, the rail) is written out in the same hero.tsx file —
// the hero is its only caller, so it is not a component of its own.
// Filled action — a bare <button> is already Deltion-orange with navy text.
// `ripple` is BeerCSS's Material 3 press ripple + 10% hover/focus state layer,
// and the JS for it is part of beer.min.js — no animation code of our own.
<button type="submit" className="ripple">Zoeken</button>

// Outlined action (quiet, on dark or light). BeerCSS's outlined button defaults to
// `--primary` text, which is only 2.5:1 on white, so it takes the ink colour instead.
<button type="button" className="border text-ink ripple">Alle routes bekijken</button>

// **One boundary for every outlined control — at 2px.** A field, an outlined button and an
// unselected filter chip all draw the same `--outline` line, one step heavier than Material 3's
// 1px so a control reads at a glance (§5). BeerCSS disagrees with itself here (`@layer overrides`,
// §2): it excludes `.field` from its own outlined rule, so the wrapper fell back to `currentColor`
// — the ink, i.e. a heavy black ring — while an outlined button got `--outline-variant`, the card
// hairline, which all but disappears beside it. The control *inside* the field owns the line
// (`--outline` at rest, `--primary` on focus); the 2px width is set once for all of them in the
// override layer, and the field's resting padding takes its focus padding's value so nothing moves.

// Theme switch — the only stateful control in the header.
// The bar's own switch (src/components/navbar.tsx) owns the <body> class + localStorage sync.
<button
  type="button"
  className="circle transparent ripple tap-target text-on-bar"
  aria-pressed={isDark}
  aria-label={isDark ? "Schakel naar licht thema" : "Schakel naar donker thema"}
>…</button>

// Icon-only button — `tap-target` keeps the 40px circle but gives it a 48px hit area,
// `ripple` gives it the press animation
<button type="button" className="circle transparent ripple tap-target" aria-label="Zoeken">
  <Icon name="search" />
</button>

// Avatar with initials — `bg-avatar` / `text-on-avatar` always put the avatar in the
// brand colour *opposite* to the bar it sits on (blue on the light bar, orange on the
// dark one), so the theme still gets its accent
<button type="button" className="circle bg-avatar ripple tap-target text-xs font-semibold text-on-avatar" aria-label="Account van Jan Bakker">
  JB
</button>

// Nav row inside the mobile menu — `min-h-12` keeps the row a 48px touch target
<a href="#routes" className="button left-align min-h-12 ripple fill">Routes</a>

// Search bar — nothing custom. BeerCSS already positions an <a> / <i> / <img> / <svg>
// inside a field (its "clickable icons" pattern): `prefix` reserves the room at the start
// and the leading icon must be the field's **first child**; `suffix` reserves the room at
// the end and is added **only when there is a trailing slot**, because an empty suffix is
// 18px of padding a short field cannot spare (§5). A <button> is not a positioned slot, so
// an in-field action is a link — which is what "search" does here: jump to the list.
// The field is 48px, its inner control's height (§5), and the wrapper carries no border.
// `text-sm` on the field is the one place a control's type size is set by the caller: the
// same shape is a page's search bar in one section and a grid column's field in another.
<form onSubmit={(event) => event.preventDefault()} className="max-w-lg">
  <div className="field round border prefix suffix text-sm">
    <Icon name="search" />                       {/* the leading icon must be the first child */}
    <label htmlFor="route-search" className="sr-only">Zoek op titel, wijk of thema</label>
    <input id="route-search" type="search" placeholder="Zoek op titel, wijk of thema…" />
    <a href="#routes" aria-label="Zoeken"><Icon name="arrow_forward" /></a>
  </div>
</form>

// Section search bar — the home previews' own bar: the section's field, how many matches
// it found, and the link to the whole list. One row on the **baseline**, so the field's
// text, the count and the action share a line; centring them leaves the count 4px low,
// because a BeerCSS field reserves room above its text for a floating label. The count
// carries `aria-live` because the section filters as you type. The
// section owns the query, and the matches come from the search index (§13), not from the
// data module — which is what makes swapping in the api a one-file change.
// The action carries `h-12`: the field is 48px (§5) and BeerCSS's button is 40px, so
// without it the one action in the row sits 8px short of the field it belongs to.
<SectionSearchBar
  id="home-route-search"
  label="Zoek in de populaire routes"
  placeholder="Zoek op titel, wijk of thema…"
  value={query}
  onChange={setQuery}
  resultLabel={`${matches.length} routes`}
  action={<Link to={ROUTES_PATH} className="button border text-ink ripple h-12">Alle routes bekijken</Link>}
/>

// A thin, long element is a pill — 48px tall, where the one corner (1.5rem) is exactly half
// the box (§5). A full-width field, a submit action and an accordion row are the same bar:
// a `.field` is 48px on its own, an action needs `h-12` (BeerCSS's button is 40px), and a
// beerCSS row asks for the height and the token directly. BeerCSS's `large` / `extra` sizes
// (56px) are the one thing not to put on a bar — 24px on a 56px box is a rounded rectangle.
// On the contacts page the row is written `h-12! rounded-box! flex! items-center!`, because
// that page wraps its sections in beerCSS's scoped `div.beer`, where plain utilities are
// reverted away (§2).
<summary className="none horizontal-padding h-12! rounded-box! flex! items-center!">…</summary>

// Card — article is the Material 3 card; no-padding lets the artwork bleed.
// Corner: `--radius-box` (1.5rem), like every other box (§5) — the `article` rule in the override
// layer gives it, so a card never names a radius of its own, and a hand-built panel reaches for
// the same token as `rounded-box`. The lift is `motion-safe:` so it never fights a visitor who
// asked for less motion.
// `xl:col-span-3` takes the grid from 3 to 4 cards per row once there is room for
// them: 3 columns at 1600px produces ~500px cards, past Material 3's 400px ceiling
// for multi-column cards, while 4 columns lands at ~380px.
<article className="s12 m6 l4 xl:col-span-3 no-padding group relative flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1">
  <div className="relative aspect-[16/10] overflow-hidden rounded-none surface-container">…artwork + chips…</div>
  <div className="flex flex-1 flex-col p-5">…title, meta, footer row…</div>
</article>

// A divider inside a card needs `rounded-none`: BeerCSS gives *every* element
// `border-radius: inherit`, so a `border-t` inside a 1.5rem card is painted as the top edge
// of a rounded box and peels away from the card's straight edges. The same goes for a child
// that butts against its neighbour inside a clipped panel — the card's media band, the hero's
// picture and its rail — see §5.

// Chips overlaying artwork
<span className="chip primary absolute left-4 top-4 text-[11px] font-bold uppercase tracking-wide">…</span>
<span className="chip surface-container-lowest absolute right-4 top-4 text-[11px] font-semibold">…</span>

// Comparison slider (BeerCSS Material 3 slider — the empty <span /> is the filled track).
// The rail sits **beside** the picture from `sm` up and **under** it on a phone: beside it,
// the picture keeps the band's whole height instead of paying for a control bar, and on a
// phone the panel is only ~200px tall — too short to hold a vertical track. The rail is the
// same markup turned with its container, so the words' `order` flips too: "Nu" leads a
// left-to-right track on a phone and sits at the top of the rail above `sm`.
// The turn needs no measured length: the slider's width is `100cqh` — the height of the box
// it stands in, which the rail's own layout decides — and that box carries
// `[container-type:size]` so the unit resolves at all.
// The two words are the track's two ends, so they are buttons: one tap puts the map where a
// drag would, and `aria-pressed` marks the side the slider is on. The range stays
// **uncontrolled** (§10) — so a word re-mounts it (`key={sliderKey}`) instead of writing to
// it. Writing to the node would leave React's value tracker behind, and the next drag onto
// that same number would be swallowed as "no change". A re-mounted input never fires the
// event BeerCSS listens for, so the track is repainted through its own API
// (`globalThis.__BeerCssGlobals__.slider.updateAllSliders()`) on the next frame.
// `px-0` takes back BeerCSS's 1rem button padding, which would make a two-letter word wider
// than the rail, and `bg-transparent` is a Tailwind utility and not BeerCSS's `.transparent`,
// whose `color: inherit !important` would take the muted ink away from the quiet word (§2).
// The input takes the label's whole 40px as its hit area (`[block-size:100%]`): the track it
// draws is only 16px thick, which is a fiddly thing to hit with a thumb. The words are `h-10`
// at **every** width, never `sm:h-9`: `tap-target` adds 4px a side, so a 36px word above `sm`
// would leave a 44px hit area — under Material 3's 48px (§5, §11).
<div className="flex w-full items-center gap-3 border-t-2 border-line px-gutter py-3 sm:w-16 sm:flex-none sm:flex-col sm:gap-1 sm:border-t-0 sm:border-l-2 sm:px-2">
  <button type="button" aria-pressed={layer === "current"} onClick={…}
          className="tap-target ripple order-3 flex h-10 flex-none items-center bg-transparent px-0 text-xs font-semibold text-ink sm:order-1">Nu</button>

  <div className="relative order-2 h-10 min-w-0 flex-1 [container-type:size] sm:h-auto sm:w-full">
    <label className="slider mx-0 w-full sm:absolute sm:left-1/2 sm:top-1/2 sm:w-[100cqh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:-rotate-90">
      <span className="sr-only">Schakel tussen de historische kaart van 1652 en de actuele plattegrond</span>
      <input key={sliderKey} type="range" min="0" max="100" defaultValue={position} onChange={…}
             className="[block-size:100%]" />
      <span />
    </label>
  </div>

  <button type="button" aria-pressed={layer === "historical"} onClick={…}
          className="tap-target ripple order-1 flex h-10 flex-none items-center bg-transparent px-0 text-xs font-medium text-ink-muted hover:text-ink sm:order-3">Toen</button>
</div>

// Band (hero, footer) — `inverse-surface` is the inverted canvas tone, so it is paper in
// light mode and navy in dark mode. Its contents use the ink utilities like any other section.
<section className="inverse-surface">…</section>

// Filter chip — outlined when off, `--selected` when on: the full brand seed under white text
// (§3), never a tint of it, because a control that is on has to read as on at a glance — a 15%
// wash over white reads as a hover. `border-transparent` takes off the outline a filled chip
// should not have, and `medium` (40px) + `tap-target` reach the 48px hit area without a bigger
// visual. Its two colours are the roles `--selected` / `--on-selected`.
<button type="button" aria-pressed={active}
        className={`chip medium tap-target ripple ${active ? "bg-selected text-on-selected border-transparent" : ""}`}>
  <Icon name="museum" className="text-base" />Musea
</button>

// Checkbox and switch — BeerCSS components (see §2 on selection.css). Both keep the real input
// as the control: it is the 48px hit area and the thing a screen reader announces, while the
// `<span>` next to it draws the box/track. The switch's span holds no text, so it is `aria-hidden`.
<label className="checkbox"><input type="checkbox" aria-label="Onthoud mij" /><span>Onthoud mij</span></label>
<label className="switch flex-none"><input type="checkbox" aria-label="…" /><span aria-hidden="true" /></label>

// A link that has to look like a button carries BeerCSS's `.button` too — a bare `<a>` is an
// inline-flex box with no height, padding or fill, so `className="ripple"` alone is a text link.
<Link to={ROUTES_PATH} className="button border text-ink ripple">Alle routes bekijken</Link>

// Star rating — BeerCSS's `i.fill` flips the Material Symbols FILL axis; empty stars take the
// muted ink (§3: never opacity). Wrapped in role="img" + aria-label by src/components/starRating.tsx.
<Icon name="star" className="fill text-base text-accent" />

// Review histogram — the Material 3 linear progress, tinted by `--primary` (orange on paper,
// blue on navy). The count beside it carries the information, so the bar is aria-hidden.
<progress className="medium flex-1" value={count} max={total} aria-hidden="true" />

// Breadcrumb — a plain <nav>. BeerCSS leaves `nav` unstyled apart from flex + a 1rem gap.
// The routes page's own header band wears the only one (src/pages/routesPage.tsx).
<nav aria-label="Kruimelpad" className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">…</nav>

// Select with a floating label and a chevron. The label floats because it follows the `select`
// in the markup, and the chevron sits in the field's trailing slot because it is *not* the first
// child (BeerCSS places the first icon as a prefix). `suffix` reserves the room — see
// src/components/filterSelect.tsx for the whole component.
<div className="field round border label suffix s12 m6 l3">
  <select id="route-theme" value={theme} onChange={…}>…</select>
  <label htmlFor="route-theme">Type route</label>
  <Icon name="expand_more" />
</div>
```

**Color classes come from either system, but only one per element:** BeerCSS on components
(`primary`, `fill`, `surface-container-low`, `inverse-surface`) and Tailwind for layout, ink
(`text-ink`, `text-ink-muted`, `text-accent`) and hairlines (`border-line`).

---

### The overview's route cards

The list under the builder is **wide cards, two to a row** (`s12 m6`) with a `21/9` picture band:
a 2-up card is ~760px at 1600, so the small card's `16/10` would be 475px tall and push everything
below the fold. Each card carries the theme, the area, the `Populair` chip, the title, a two-line
`line-clamp-2` description and the score.

It has **two actions, and they are siblings, never nested**:

- the **card itself** opens the route's own page (`/routes/public/<id>`). It cannot be a link: the
  boundary, the padding and the clip all come from the `article` (§5), so the card carries an **empty
  `<Link className="absolute inset-0 z-0" aria-label="Open de route …">`** as its last child — last,
  so it paints above the picture and the body, and `z-0` so the save button's `z-10` stays above *it*;
- the **save button** rides *on* the card, in the picture's top-right corner (the area chip moved to
  the bottom-right to make room): a 40px `button circle ripple tap-target` that is
  `surface-container-lowest border` when it is off and `bg-selected text-on-selected` when it is on
  (§3, §7), labelled `Bewaar …` / `Haal … uit je opgeslagen routes` with `aria-pressed` as its state.
  Its position lives on a **wrapper** `div` (§5), because a `.tap-target` cannot be `absolute` itself.

Two traps are written into that markup, and both cost a real bug when they are missed:

- **A stretched pseudo-element does not work here.** The obvious trick — `after:absolute after:inset-0`
  on the title — never reaches the card, because BeerCSS's reset makes **every** element
  `position: relative` (`*{position:relative}`, §2), so `inset-0` fills the heading and nothing else.
  The home strip's cards had the same dead markup; both are the overlay link now.
- **The overlay link stays square and hands the focus ring over.** It is a full-bleed child of a
  clipped panel, so it takes `rounded-none` (§5) — and that means it cannot draw its own ring: the
  card does, with `has-[:focus-visible]:outline-2 …:outline-offset-2 …:outline-(--primary)`, which is
  the same 2px `--primary` ring as everywhere else, drawn outside the card's own clip (§11).

Every card also **answers a save with a notice** — a 48px pill, `role="status"`, bottom centre, gone
after 4s (§7, §12, §16).

### A route's own page

`/routes/public/<route-id>` renders **the very same page** as the bare builder, with three
differences:

- the header band wears the route's own `title`, `theme`, area and score (`PageHeader` with the
  trail back to the list written into `routesPage.tsx`) instead of the generic builder copy, and the
  tab says the route's name;
- the builder is **seeded with the route's places**, so the map, the picker and the summary are filled
  in on arrival — read from the url like any other pick, never stored;
- the reviews sit under the map in **`RouteReviewsPanel`**: one button for the whole row, the score
  and the count while it is closed, `aria-expanded` as its state, and the breakdown, the reviews and
  the form written out in the same file (they own no band of their own) when it opens. Collapsed by
  default, because on this page
  the route itself is the point; opening slides it in (§12), closing is instant.

An id that is not a route answers with `NotFoundPage`'s own wording, and a bicycle route opens in
bicycle mode so the numbers on arrival are the ones the route was made for.

There is **no modal** on this page: a popup hid the map, could not be linked to, and printed the same
route twice. The share button's own popup (§7) is the one transient layer here, and it is deliberately
small and non-modal so the map stays visible and usable behind it.

### Saving a route

There is no account yet, so `src/data/savedRoutes.ts` keeps the reader's routes in `localStorage`
(`zwolle-routes:saved`), and one `window` event keeps every card, the filter and the count in step —
no state library, and the module is the single place that changes when the account lands (§15,
`docs/BACKEND.md`). A saved route wears the `Opgeslagen` chip beside `Populair` (the chips **stack**,
because a popular route can be one the reader saved too) and a filled bookmark. The `Van wie` filter
sets the reader's own list against the community's.

**A save answers with a notice.** `RouteResults` owns it: a `role="status"` region that sits in the
tree from the start (so a screen reader reads the text the moment it arrives) holding one pill that
motion fades in and out — `surface-container-highest`, the shared 2px `border-line` and `rounded-box`
corner, `min-h-12` (48px — it wraps to two lines on a 320px phone rather than shrinking),
`pointer-events-none`, `fixed bottom-6 left-1/2` so it never covers what was just
tapped or the map beside it. It says **"Toegevoegd aan je opgeslagen routes."** or, on the way back,
**"Uit je opgeslagen routes gehaald."** Both messages are the same sentence with the verb swapped.
There is no dismiss button and no action: the notice is *feedback*, not a question, and it
takes itself away after **4s** (`NOTICE_MS`) — the timer restarts on each save, because the message
changes with the action. It is the app's only snackbar (§16).

### Sharing a route

`RouteShareButton` sits in the map's **bottom-right** corner — the corner a thumb reaches on a phone
(a `relative` wrapper around `AreaMap`, the button at `absolute bottom-4 right-4 z-20`). It is the map's
free corner because the api's own zoom control is moved to the **top-right** in `mapOptions` (§8), so
the two can never stack, and the chip at the top-left still names the map. The route is already in the
url, so sharing is copying it: the button copies
`builderPath(placeIds)` to the clipboard and answers in an `aria-live` paragraph — the confirmation,
or the link as text for a browser that will not hand over the clipboard.

With fewer than two places there is nothing to share (one place is not a route), so the button is
**not disabled** — a dead button leaves the reader guessing at a `title` tooltip. Clicking it opens a
small **popup**: a `role="alert"` bubble **above** the button that says a route needs at least two stops,
raised on the `surface-container-highest` step with the shared 2px boundary and corner, and dismissed
by its own "Sluiten", by escape, by a click outside it, or by picking the second place. It is a
**popup and not a modal**, so the map behind it stays visible and usable — which is what keeps this
page's no-modal rule (§7) true. What a real share (an account, a stored route) needs is in
`docs/BACKEND.md`.

### The route list's filters

The search box and the five selects are **one row** (`role="search"`, `flex flex-wrap items-end`)
with the live count pushed right (`sm:ml-auto`) and the reset beside it — the list below is what the
eye should land on. Every control **grows**: the search field is `min-w-0 grow basis-56` and each
select `min-w-0 grow basis-48`, so the row fills the width it is given and reflows - six across on a
wide screen, three to a line on a laptop, one per line on a phone — instead of leaving a ragged tail
of half-empty fields. The basis (not a fixed `w-52`) is what makes that wrapping predictable, and
`min-w-0` is what lets a field shrink past its own label instead of pushing the row sideways.

The reset action carries `h-12` and the count takes its own line under `sm` (`basis-full sm:basis-auto`),
so it never squeezes the last select beside it. Both matter to the row reading as **one line of
controls**: a field is 48px, BeerCSS's button is 40px, and `items-end` alone would leave the action
8px short with the count under it (§5).

The option lists live in `routeFilters.tsx` and not in `data/routes.ts`, because they are labels
rather than data; every list rests on "all", which is why an untouched row filters nothing out.

A filter that has been **chosen** is filled with the brand colour — `primary fill`: orange with white
in light mode, `blue-300` with `blue-950` in dark. The **filled** variant is what makes the label
readable: beerCSS puts a filled field's label _inside_ the control, while an outlined field's label
straddles its top edge, where it would sit half on the fill. Three rules in `@layer overrides` hand the
fill back to the role (the variant paints its own surface tone over it) and colour the label and the
control's own text for the fill (§16).

## 8. Maps

**Two kinds of map live in this app.** The hero is **artwork** — the 1652 engraving over a satellite
photo with a slider between them — and it is the one place a map is a picture: two exports in
`src/assets/maps/`, drawn by the hero's own `MapImage` helper (`src/components/hero.tsx`). **Every other map is Google
Maps.** The hand-placed 0–100 overlay layer that used to draw routes and pins on those exports is
**retired**: nothing on the site positions anything by hand any more.

### The area

The site covers **de binnenstad en het Noorder Eiland**, and that is written down once, in
`src/data/area.ts`: `AREA_BOUNDS` (a lat/lng box), `AREA_CORNERS` (the two corners the maps api
wants), `AREA_CENTER`, `isInArea` and `pointsInArea`. Every place in `data/pointsOfInterest.ts` is
inside the box, every route is built from those places, and the map is handed the box as its
`restriction`, so it cannot be panned out of the area. `strictBounds` is deliberately **not** set:
with it, `fitBounds` stopped framing the places and zoomed past them (measured).

### A route is a list of places

`Route.poiIds` is the whole geometry story — a route stores the places it visits, in order, and
nothing else. `routePoints` (the places), `routePath` (their 0–100 positions, for the artwork) and
`routeCoordinates` (their real coordinates, for the map) are derived in `data/routes.ts`. A route
therefore cannot drift from its stops, and editing a place moves every line that visits it.
`PointOfInterest` carries both spaces — `position` for the artwork, `coordinates` for the map — plus
`era` (`"Toen"` / `"Nu"`), the axis the route builder groups on.

### The interactive map

`AreaMap` (`components/areaMap.tsx`) is the one interactive map. Two pages use it: the routes page
(one url for the builder, one per built route, one per ready-made route — §7) and the places
overview. It takes the places to pin, the line to draw, the visit order, a click handler and the
height it should stand at — the page decides what a click means there, and the builder asks for a
taller map because there the map is the work surface.

- **The instance lives outside react.** It is created once in an effect, into a host `<div>` react
  never touches again, and a `mapGeneration` counter (raised whenever an instance exists) is what
  tells the drawing effects that there is something to draw on.
- **The theme is state, not a `setOptions` call.** The api reads `colorScheme` when the map is made
  and ignores it afterwards (measured), so flipping `body.light`/`body.dark` empties the host and
  builds a second map in its place — the map keeps following both themes.
- **Markers are reconciled by id**, never re-created: the marker's content is a DOM element the
  component paints itself (`paintDot`), because it carries the era's fill and, once the place has
  joined the route, its visit number. The two era fills are the brand's own two colours — today's
  places in `orange-500`, the ones van toen in `blue-500`, both with a white ring — so the legend's
  swatches (`mapLegend.tsx`) are the only place that repeats them.
- **A dot is 24px, 32px once it carries its number, and a quarter bigger again when it is the place
  the page is about** — and it always carries a **48px touch area**, a pseudo element that draws
  nothing (`before:-inset-3.5`), because a marker is only as big as its dot and a 24px circle is not
  a thumb target (§11). `-inset-3.5` rather than `-inset-3`, because an absolutely positioned box is
  placed against the *padding* box: the dot's own 2px ring is not counted (measured: 44px, not 48).
  Two dots closer than `DOT_GAP` (32px — the dot's diameter plus air) are pushed apart as the map
  settles, up to `MAX_SHIFT` (14px), so every place keeps a spot of its own to be clicked.
- **`DEMO_MAP_ID`** is the api's own development map id. Advanced markers need one, and a
  cloud-styled map id is not this app's to create. It is also a **demo tier with a daily cap**
  (measured 2026-09-28): a day of map loads ends in _"Maps Demo Key limit reached: Your daily quota
  for Maps JavaScript 2D has been met"_, and after that the api builds no map dom at all, fires
  `gm_authFailure`, and throws inside its own code (`setAttribute`, `IntersectionObserver`,
  `getRootNode`). Every map then shows the panel below — which is why
  `VITE_GOOGLE_MAPS_MAP_ID` is not only a styling nicety.
- **`gestureHandling: "cooperative"`** keeps the page scrollable: the map zooms on ctrl/cmd + scroll
  or a pinch, never on a plain wheel.
- **The zoom control is the one piece of the api's own chrome that stays**, and it is pinned to the
  **top-right** (`zoomControlOptions: { position: RIGHT_TOP }`): the map's bottom-right corner is the
  share button's (§7), and a control a reader has to hit should not share a corner with another. The
  rest of the api's ui is off (`disableDefaultUI` plus `clickableIcons: false`).
- **The api's own dom is corrected in `areaMap.css`**, because our stylesheet applies to it too. Two
  rules, both in `@layer overrides` and both with the flag:
  - **no corner** — beerCSS leaves `border-radius: inherit` on every element, which rounded 168
    elements inside one map and made the canvas a rounded rectangle in a rounded frame;
  - **the "Gebruik Ctrl + scrollen om in- en uit te zoomen" hint is centred**. It is a `<p>`, and our
    justified body copy (`p` in the components layer) outranks the `text-align: center` Google's veil
    hands down by inheritance — the sentence sat against the map's left edge with a ragged right one
    (measured: the glyph run's centre stood at **33.2%** of the frame's width, its first glyph on the
    frame's own inner edge). `.gm-style-mot { text-align: inherit }` puts it back on its wrapper's
    centre (measured: **50.0% x, 50.0% y**), which is the same escape hatch a centred `<p>` of our own
    takes (§7).
- **The line is two polylines** — a white casing under the brand line, the same recipe the artwork
  uses — with the colours read off the design tokens at draw time, so javascript holds no palette.
- **Nothing the map draws may throw.** The line and the drawn route shape are filtered down to real,
  distinct coordinates before they become polylines or svg, so a path from the api (or from a stale
  module in a long dev session) can never blank the page it is drawn on.

### Where the route between the places comes from

`requestDirections` (`data/googleMaps.ts`) asks the **Routes API**
(`google.maps.routes.Route.computeRoutes`, `fields: ["path", "distanceMeters", "durationMillis"]`),
and `usePlannedRoute` (`data/usePlannedRoute.ts`) is the hook around it. A key without the
Routes API gets **one refusal remembered for the session**; the hook then answers with
`straightRoute()` from `data/routeGeometry.ts` — the places connected, length haversine × 1.25,
duration from the pace in `PACE_KM_PER_HOUR` — and the summary says which of the two the reader is
looking at, "via de straten" or "hemelsbreed geschat". The estimate is also what is drawn while the
api is still answering, so the line never lags behind the picker. The same request — the same places
in the same order, in the same way of travelling — is answered **from memory** once it has been
asked, refusal included: the api is rate limited, and a reader who comes back to a page should not be
charged for the same route twice.

### Previews

A card wants a picture, not a second map instance.

- **`MapSnapshot`** is a **Maps Static API** image of a route's places or of a single place, and it is
  **off by default**: the static api is a second service on the key, and a card that asks for a
  picture the key cannot give logs a console error _per card_ (measured: nine on one page). Set
  `VITE_GOOGLE_MAPS_STATIC_MAPS=true` once the api is enabled for the key.
- **`RouteShape`** (`components/routeShape.tsx`) is the route preview that always works: the places
  projected from their real coordinates into the card's own 16:10 box, **one scale for both axes** so
  the shape keeps its proportions, in the same casing-plus-orange recipe, with bigger dots at the two
  ends to show the direction of travel. It costs no request at all. (Stretching each axis was tried
  and rejected: a route with one far stop turned into an unreadable spike.)
- **The round place thumbnail** is the home strip's own 80px frame: the place's picture inside it at
  `h-full w-full object-cover`, or its category glyph until there is one. The files and the places
  they belong to are in `data/placeImages.ts` (docs/place-images.md). **The whole tile is one link**
  — picture, name and category — into that place's own card on the places page (`pointOfInterestPath`,
  §6); its hover is the bar's recipe, the name underlining and the muted category coming up to full
  ink, and the tile stays a `listitem` with the link inside it, so the strip is still a list.
- **The hover card on the map** is drawn **outside** the map's frame — the frame clips its own
  corners, and a card inside it was cut in half at the edges. It is nudged back inside the frame
  sideways, and flips under the dot when the frame has no room above it, so the whole card, picture
  included, is visible wherever the dot is. It takes no pointer events, so it can never steal the
  hover from the dot it belongs to.

**Where an image lives.** An asset a component imports belongs in `src/assets/…` and is _imported_,
so Vite fingerprints the filename and a redeployed map can never be served from a stale cache.
`public/` is only for files whose _path_ is the contract (the favicon, `robots.txt`). The map files
are kebab-case and say what they contain: `zwolle-historic-1652.webp`, `zwolle-satellite.webp`,
`zwolle-satellite-places.webp`, `zwolle-satellite-places-terrain.webp`,
`zwolle-satellite-places-terrain-roads.webp`.

**One coordinate system.** Overlay points are in 0–100 space and are scaled onto the imagery's own
viewBox (`1520 × 984`). `object-cover` on the `<img>` and `preserveAspectRatio="xMidYMid slice"` on
the overlay both centre-crop the same source aspect — that is what keeps the drawn route on the
right rooftop when a card frame crops the picture. **The hero's pair is the one place that does not
crop**: it hangs on a panel that shrinks to the picture (§7) and both layers are `object-contain` in
the very same box, so the cross-fade still lines up pixel for pixel.

```jsx
<MapImage image={MAP_IMAGES.roads} className="h-full w-full object-cover" decorative />
<RouteOverlay path={route.path} />
```

- **`MapImage`** owns the `<img>`: `width`/`height` so the page cannot reflow while a multi-megabyte
  picture arrives, `loading="lazy"` for anything below the fold, `priority` (eager + `fetchPriority`)
  for the one picture that is on the first screen, and `decorative` for a picture the surrounding
  text already describes.
- **Overlays are `pointer-events-none` + `aria-hidden`**, and the `<img>`'s `alt` carries the
  meaning (`alt="Kaart van Zwolle met de route …"`). They are the **fallback layer** now: choosing a
  place happens on the interactive map (a dot is a button with the place's name on it) and in the
  list beside it, and the list is the keyboard's way in (§11).
- **Route drawing:** a white **casing** under the accent line (`stroke-white` at 16 units, then
  `stroke-orange-500` at 9, dashed, round caps and joins), stops as a `fill-orange-500` dot with a
  white halo and a glow at `opacity` 0.22. A single orange line disappears into the red roofs and
  the dark water of a photograph; the casing is the map-design answer, and it adds no colour that is
  not already in the palette. The interactive map draws the same recipe with casings 10/5 and **no
  dash** — a real map has streets to read, so the dash would only be noise.
- **The historic/current swap** is a cross-fade of two stacked pictures — the hero's are the 1652
  engraving over the satellite photo. The historic one carries `.historic-layer` and inherits
  `--historic-opacity` (`1 - position / 100`) from the panel, which `index.css` turns into an opacity
  transition. Only CSS custom properties may be set inline. The panel **opens at 0**, i.e. the
  engraving at full strength with `Toen` pressed: the pairing is what the page is about, and the past
  is the half a reader has not seen.
- **A round place thumbnail** is a circle frame with `overflow-hidden` and the picture inside it at
  `object-cover` — the crop is the frame's job, so there is no positioning maths anywhere.
- **Controls over a map** get a solid `surface` panel or a chip (never a gradient scrim) — and a
  control placed _beside_ the picture beats one over or under it: the hero's slider is a rail on the
  map's trailing edge, so the whole map stays readable while you cross-fade it, and the picture keeps
  the height a bar under it would have cost. Text
  that has to survive cropping lives in the React layer, never as `<text>` in the artwork.
- **Weight: the exports are WebP now.** They were 3.3–3.6 MB PNGs (17 MB for the five), and they are
  400–570 kB WebP at the same 1520 × 984 — an 87% cut, which is why the home page fetches ~2 MB of
  imagery instead of ~18 MB. The build still cannot re-encode (Vite copies assets as they are), so
  **an export arrives as WebP**: `quality 0.9` for the engraving, whose line work rings at lower
  settings, and `0.82` for the satellite frames, and the same kebab-case name at the new extension
  (`src/data/maps.ts` is the only place the extension appears).
  Only the pictures a page actually renders are fetched: the hero's two, one per map below it, and
  none at all on the pages that show no map.

---

## 9. Iconography

- **Material Symbols only** — rendered through BeerCSS's `<i>` element and the `<Icon>` helper.
  No emoji as UI icons, no second icon library.
- The subset lives in `index.html`; **new icon = new name in that URL** (`display=block` avoids
  a flash of icon names).
- Size with Tailwind `font-size`: `text-xl` standalone, `text-base` inline with text.
- Color is inherited, so an icon takes the color of its button, chip or link.
- Decorative icons get `aria-hidden="true"` (the `<Icon>` helper does this). Meaningful
  standalone graphics get `role="img"` plus `aria-label` — that applies to the map SVGs.
- Icon-only buttons always need `aria-label`.
- Route/map artwork stays hand-drawn inline SVG; the icon font is not for artwork.

---

## 10. Motion

**Motion is wanted here.** The app should feel alive: things ripple, lift and settle. The rules
below exist to keep that motion _coherent and cheap_, never to remove it.

### The motion tokens

- **The Material 3 curves are tokens**: `--ease-standard: cubic-bezier(0.2, 0, 0, 1)` and
  `--ease-exit: cubic-bezier(0.4, 0, 1, 1)` in `@theme static`. Durations stay with BeerCSS's
  `--speed1/2/3` (100/200/300ms — inside the spec's 200–300ms band).
- **200ms on the standard curve is the default for every Tailwind transition**, set once via
  `--default-transition-duration` / `--default-transition-timing-function`. A component writes
  `transition-colors` and is already on the spec curve; naming a duration again is a smell.
- Entrances come from `@theme`: `--animate-rise` → `animate-rise` (0.45s, standard curve, fill
  `both`). The hero's map panel uses it — a `transform` + `opacity` entrance and nothing else — so
  the fold assembles instead of blinking in.
- **`--animate-flash` → `animate-flash`** (2s, standard curve) is the one *attention* animation: the
  place card a url names lights its own edge (§5). One keyframe rule holds `outline-color` at the
  brand seed for the first 250ms, drops it to `transparent` for the next 250ms, then holds the seed
  again and fades that second flash out over the remaining 1.5s — two flashes, then a fade, with no
  JavaScript. It animates `outline-color` and never `border` or `box-shadow`: both of those are
  pinned on every `article` (§5), so an animation on them would be silently swallowed. It is
  colour-only, so it is deliberately **not** gated behind `motion-safe:` — there is no movement for
  a reduced-motion reader to lose, and it is the only thing that says which card a link named, so it
  runs for them too (§11).

### What animates

| Interaction                      | Motion                                                                                                                                     | Where                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Press / click a control          | **BeerCSS ripple** — the `ripple` class (600ms expanding circle)                                                                           | `ripple` is on every button, toggle and nav row |
| Hover / keyboard focus a control | State layer: `currentcolor` at 10%                                                                                                         | BeerCSS, same `ripple` class                    |
| Hover a route card               | `motion-safe:hover:-translate-y-1`, 200ms transform                                                                                        | the route cards (`popularRoutesPreview`, `routeResults`) |
| Toggle the theme                 | The sun/moon icon spins out and in (Motion, 150ms, `mode="wait"`) + the ripple                                                             | the bar's theme switch (`navbar`)               |
| Drag the map slider              | The historic layer's opacity fades over `--speed2` (200ms)                                                                                 | `.historic-layer`                               |
| Load the page                    | The hero's map panel rises 12px and fades in                                                                                               | `animate-rise` (CSS)                            |
| Land on a place from a home tile | The card's edge flashes twice in the brand seed, then fades out over 1.5s                                                                  | `animate-flash` (CSS)                           |
| Open / close the mobile menu     | Height + opacity, 200ms, animates **out** as well as in; the rows fade in 30ms apart, and the burger's own glyph turns as it swaps (150ms) | `m` + `AnimatePresence` (Motion)                |
| Open the reviews panel           | Height + opacity, 200ms, on the way **in**; closing is instant, so the fold is always the reader's to undo                                  | `RouteReviewsPanel` (Motion)                    |
| Expand the route grid            | New cards fade in, removed ones fade out                                                                                                   | `m` + `AnimatePresence` (Motion)                |

### What must not animate

- **Nothing decorative on scroll.** No fade-in-up, no fly-in, no parallax as sections come into
  view: content that animates while you read it is noise, and it is the single most common way a
  site feels over-animated. Motion is used where it _explains state_ — a panel opening, a list
  growing — and nowhere else.
- **Motion lives on `transform` and `opacity`.** Two exceptions: the mobile menu's `height`, because
  a dropdown genuinely changes the page height and Motion interpolates it frame-accurately; and the
  landing card's `outline-color`, because that flash is feedback rather than movement (§5). Do not
  add a third without a reason as good as those.
- One motion per interaction: a lift **or** a fade, never both fighting for the same property.
- `html { scroll-behavior: smooth }` is global — respect it, don't re-implement scrolling.
- **Add motion freely, but gate the movement**: use `motion-safe:` (CSS) or `reducedMotion="user"`
  (Motion) and it switches itself off for a visitor who asked for less motion.

### The library: Motion

`motion` (Motion for React) is installed for the two state-driven cases above — **enter/exit and
list changes** — which CSS genuinely cannot do, because a leaving element has to stay in the DOM
for the length of its animation.

- **Use `m.*`, never `motion.*`.** `App.tsx` wraps the page in
  `<LazyMotion features={domAnimation} strict>`: only the DOM animation features are shipped, and
  `strict` turns an accidental full-weight component into an error. That combination is what keeps
  Motion at ~28KB gzip instead of ~41KB.
- **No layout projection.** The route grid only ever appends rows (1 column on a phone, 3 at
  desktop), so nothing reflows and `layout` would animate nothing — it is deliberately not used.
- **`MotionConfig reducedMotion="user"`** sits next to `LazyMotion` at the root, so every Motion
  animation obeys the same rule as the CSS: transforms and the menu's height are dropped, opacity
  fades still play.
- **Curves and durations come from the tokens**, not from Motion's defaults: `MOTION_TRANSITION`
  in `src/motion.ts` is 200ms on `[0.2, 0, 0, 1]` — the same values as `--ease-standard` and the
  Tailwind default. A bespoke spring or easing is a smell.
- **CSS first.** If a one-shot entrance can be a keyframe (the hero), it stays a keyframe: no
  JavaScript, no hydration cost. Reach for Motion only when state is involved.

### Reduced motion

`prefers-reduced-motion: reduce` is honoured in two places that follow the same rule — **movement
stops, feedback stays**:

- one CSS block at the end of `index.css`: keyframes stop (the ripple expansion is the main
  casualty), `scroll-behavior` returns to `auto`, and utilities that move something are gated at the
  call site with Tailwind's `motion-safe:` (the card lift, the hero entrance);
- `MotionConfig reducedMotion="user"` for the Motion-driven pieces: the menu's height interpolation
  is dropped, the fade still plays. Verified: under the preference the menu snaps to its full
  height while its opacity still animates.

Colour and opacity feedback **stays** in both — a hover highlight appearing instantly is calm,
whereas a UI that goes completely inert reads as broken. The landing flash is the loudest case of
that rule and the one keyframe the block keeps: it is colour-only, so there is no movement to
suppress, and it is the only thing that says which card a link named — a reader whose OS turns
animations off still needs the card pointed out. So its class carries no `motion-safe:` and the
media block re-applies `--animate-flash` to it outright; the reader's own pick still answers
through the *Op de kaart* button and the map's chip as well.

The CSS block is the one sanctioned `!important` outside `@layer overrides` (§2), because it has to
outrank framework animations declared later in the cascade.

> **Before you "fix" an animation, check the environment.** The speed of a machine does not matter
> here, but a reduced-motion preference does — and it is easy to have on without knowing. Motion even
> warns about it in the console: _"You have Reduced Motion enabled on your device. Animations may not
> appear as expected."_ Check `matchMedia('(prefers-reduced-motion: reduce)').matches` (this project's
> VS Code integrated browser reports `true` by default), or use DevTools → Rendering → _Emulate CSS
> media feature prefers-reduced-motion_ to see the difference. **A hidden/backgrounded tab also
> freezes CSS transitions mid-flight and pauses Motion's frame loop entirely** — so a preview pane
> that is not visible will show neither animations nor trustworthy computed colours.

### Performance

Smoothness is measured, not assumed:

- **Judge motion in the production build** (`npm run preview`), not the dev server. Measured over a
  10-step viewport sweep: dev worst frame **50ms** (one 56ms long-animation-frame), production worst
  frame **16.9ms** with zero drops. Dev pays for unbundled modules, React's development build and
  `StrictMode`'s double render — none of which exist in what you ship.
- **Never re-render artwork to change its opacity.** The map's historic layer fades through the
  inherited `--historic-opacity` custom property, and both artwork components are wrapped in `memo`,
  so a slider drag patches one style declaration instead of reconciling ~90 SVG nodes. Measured:
  109 frames at 16.8ms worst, no dropped frames, and the SVG nodes are never re-created.
- **Range inputs must be uncontrolled.** With `value={…}` React writes the thumb position back on
  every render and the thumb snaps backwards whenever a render misses the pointer. Use
  `defaultValue` + `onChange` and let the DOM own the position.

---

## 11. Accessibility

- Toggles use `aria-pressed`; the historic/current slider is a real `<input type="range">`
  inside a `.slider` label with `sr-only` text.
- Inputs are paired with a `<label>` — visually hidden with `sr-only` when the design shows no
  label. In a BeerCSS `.field` the label sits _inside_ the field (that is what BeerCSS positions),
  wired up with `htmlFor` when it cannot wrap the control, and the icon is the field's first child.
- Icon-only controls need `aria-label`; the hamburger also exposes `aria-expanded`.
- **Tappable targets are at least 48×48px** (the Material 3 minimum). BeerCSS buttons are 40px
  tall, so a control smaller than 48px pairs with `.tap-target`, which extends the _hit_ area past
  the visual edge via `::before` (BeerCSS already owns `::after` for its state layer). Growing the
  visible circle instead would overrun the bar at 320px. A **map dot** is the other way round — its
  visible circle grew (24px/32px, §8) *and* it still needs the area: it carries its own
  `before:-inset-3.5`, because a marker is only as big as its content and 24px is not a thumb target.
- Focus is a 2px `primary` outline **offset 2px** (`:focus-visible` in `@layer base`); BeerCSS
  draws the outline, the offset keeps it off the control's own edge.
- **A whole-card link hands its ring to the card.** The route cards' link is an *overlay* covering the
  `article` (§7): it is a full-bleed child of a clipped panel, so it is square and its own ring would
  be cut off by that clip. The card draws it instead —
  `has-[:focus-visible]:outline-2 …:outline-offset-2 …:outline-(--primary)` — so tabbing to a card
  rings the **card**, in the same colour as every other control, outside its own clip.
- `prefers-reduced-motion: reduce` stops movement — keyframes, the card lift and the hero
  entrance — while keeping hover/press feedback. Test it in the browser's rendering-emulation
  panel, not by eyeballing. §10 has the full description, including why the integrated browser
  can report this preference when Windows has animations on.
- Contrast is checked against the Deltion roles: `text-ink` on `--surface` ≈12.6:1, `text-heading`
  12.6:1 light / 7.4:1 dark, `text-accent` the same, muted ink ≈7:1 on the bands. **No text anywhere
  relies on opacity for restraint** — that was measured at 3.4:1 and removed. The audit reports
  **0 failures in dark mode**; in light mode every element it flags is white text on the
  brand orange at 2.6:1 (the bar's logo, nav links, icons, a selected chip and the artwork
  badge). That is the single, deliberate exception recorded in §3 and §16 — the 2.15:1 reading on the
  active mobile row comes from its 20% white state layer, which sits on top of the same orange.
- The theme switch is a toggle button: `aria-pressed` for state, `aria-label` that names the
  action, and an icon that shows the **result** (`dark_mode` while light is active).
- BeerCSS draws focus with `outline: 2px solid var(--primary)` on `:focus-visible`; never
  remove focus styling without a replacement.

---

## 12. Copy & content

- **Dutch, `nl-NL`.** Ratings use a comma decimal (`4,9`), distances use `km`,
  durations use `u`/`min` (`1 u 30`, `45 min`).
- **Every user-visible word is Dutch — including the labels.** The places page is
  "Bezienswaardigheden" in the top bar, the footer, its `h1` and the home preview's section
  heading. Only the **url** keeps the English name (`/points-of-interest`), because a link is
  something a reader may already have written down, and a label is something they read. Never
  let one page's heading and its own nav entry disagree about what the page is called.
- Sentence case in prose; labels and badges are short (`Populair`, `Bekijk`).
- **A notice states the fact, in the past tense, and stops**: "Toegevoegd aan je opgeslagen routes."
  / "Uit je opgeslagen routes gehaald." No "Succesvol!", no exclamation mark, no question — the reader
  just tapped a button and wants to know what happened to their route, not to be congratulated.
- Tone: inviting and place-specific — name real Zwolle areas (Binnenstad, Assendorp, Berkum).
- The hero carries no prose: one headline in two spans, then the map. Section copy stays a line.

---

## 13. Craft rules

The visual language above only holds up if the code holds up. These are the habits that keep it
there — they apply to every file under `split/src/`.

### Where a piece lives

A piece earns its own file by being needed in more than one place, or by owning a whole band of a
page. Anything that only ever appears inside one other component is written **there** — the bar
holds its own link list, the footer its own columns, the hero its own map panel. Splitting a piece
out "in case it is reused" is indirection, not structure.

| Home                     | Holds                                                                                                                                                                                    | Rule                                                                                                                                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/`             | one file per route, `<name>Page.tsx`, the default export `App.tsx` mounts                                                                                                                | resolves the route, owns the state its components share, and lists them in order. It owns a band only when that band holds more than one piece.                                                                                                                                     |
| `src/components/`        | **every component, in one flat folder** — a band (a section, a list, a grid, a fold), a primitive (`Icon`, `StarRating`), a filter control, a map panel. One per camelCase file.          | **named exactly after the component**. A piece used once inside another component lives in that component's file; the moment a second file needs it, it moves out into a file of its own — never copied.                                                                            |
| `src/data/`              | the content and the logic over it (`routes.ts`, `pointsOfInterest.ts`, `placeImages.ts`, `area.ts`, `maps.ts`, `routeGeometry.ts`, `directions.ts`, `navigation.ts`, `search.ts`, `savedRoutes.ts`, `googleMaps.ts`, `usePlannedRoute.ts`) | **content and logic only** — no components. `searchIndex.json` is the one data file that is not TypeScript, because it stands in for an api response (§15). `savedRoutes.ts` is the reader's own list in `localStorage`, which is why it also exports the one hook that watches it. `placeImages.ts` is the one module that imports assets, kept apart from `pointsOfInterest.ts` so the e2e suite can read the place data with plain node. |
| `src/types.ts`           | the shape of that content: `Route`, `PointOfInterest`, `MapPicture`, `RouteFilterState`                                                                                                  | **types only**, no runtime code. A component names the type it needs instead of repeating its fields.                                                                                                                                                                               |

The test is the **caller count**. One caller: the piece is written out in the caller's file, private
helpers and small local functions included. A second caller: it moves up into its own file in
`src/components/` — never copied, and never a category folder: the flat folder is the whole
convention, so nothing has to be guessed or promoted twice.

A page should read as a table of contents: the header band, then its bands in order. If a page
file is more than about a hundred lines of markup, a band is still hiding inside it.

### Naming

| Thing                    | Convention                                                             | Example                                                        |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Page file                | **camelCase** + `Page`, in `src/pages/`                                | `homePage.tsx`, `routesPage.tsx`, `pointsOfInterestPage.tsx`   |
| Component file           | **camelCase**, one component per file, named exactly for the component | `areaMap.tsx` → `AreaMap`, `poiResults.tsx` → `PoiResults`     |
| Component stylesheet     | **camelCase** `.css`, next to the component, imported by it            | `components/hero.css`, `components/areaMap.css`                |
| Domain type              | **PascalCase**, in `src/types.ts`                                      | `Route`, `StarBucket`, `MapPicture`, `PoiFilterState`          |
| Content constants        | **SCREAMING_SNAKE_CASE**, declared above the component that uses them  | `NAV_LINKS`, `RAIL_ENDS`, `ROUTE_PREVIEW_COUNT`                |
| Props, state, locals     | **camelCase**, no abbreviations                                        | `historicOpacity`, `visibleRoutes`, `menuOpen`                 |
| Custom CSS class         | **kebab-case**, in `index.css` or the component's own stylesheet      | `.historic-layer`                                              |
| CSS variable             | **kebab-case** custom property                                         | `--surface-container-low`, `--historic-opacity`                |
| Content module           | camelCase file, one topic per file, in `src/data/`                     | `routes.ts`, `pointsOfInterest.ts`, `navigation.ts`            |
| `Poi`                    | the established short form for a point of interest                     | `PoiPicker`, `PoiFilters`, `POI_SORTS`, `filterPointsOfInterest` |

The **suffix says what the thing is**, so a file name can be read without opening it:

| Suffix                                     | Means                                                                                                             | Examples                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `…Page`                                    | a route's entry point, in `pages/`                                                                                | `homePage.tsx`, `pointsOfInterestPage.tsx`              |
| `…Preview`                                 | a home-page strip showing a slice of another page, with the link to it                                            | `PopularRoutesPreview`, `PointsOfInterestPreview`       |
| `…Panel`                                   | a framed surface holding a control group or artwork                                                               | `RouteReviewsPanel`                                     |
| `…Card`                                    | one record on a bordered surface — only when it needs a name of its own                                           | none left: the route and place cards are written out in the list that shows them |
| `…Grid`                                    | the grid a repeating card is laid out in, fade included                                                           | none left: each list owns its grid                              |
| `…Button`                                  | one action, in the shape the design gives it                                                                      | `ClearFiltersButton`, `RouteShareButton`                |
| `…Bar`                                     | a control strip that belongs to a section                                                                         | `SectionSearchBar`                                      |
| `…Chip`                                    | a small labelled token that sits on a surface                                                                     | none left: the map chip is a private helper in `areaMap.tsx` |
| `…Form`                                    | the inputs that submit something                                                                                  | none left: the review form is private to `routeReviewsPanel.tsx` |
| `…Filters`                                 | the controls that narrow a list                                                                                   | `RouteFilters`, `PoiFilters`                            |
| `…Results`                                 | what a filter left behind, empty state included                                                                   | `RouteResults`, `PoiResults`                            |
| `…Dialog`                                  | a modal the platform opens, holding another page's components                                                     | none left — a route's full view is a url (§7)           |
| `…Map`                                     | a map panel plus the key that explains it                                                                         | `AreaMap`                                               |
| `…Picker`                                  | the controls that choose what a map or a route is made of                                                         | `PoiPicker`                                             |
| `…Summary` / `…Reviews`                    | the named column of one page, and the reviews a route carries                                                     | `RoutePlanSummary`, `RouteReviewsPanel`                 |
| `…Image` / `…Shape`                        | artwork: a picture, and a route drawn from its own coordinates                                                    | `RouteShape` (`MapImage` is private to `hero.tsx`)      |
| `…Snapshot`                                | a picture of a map, drawn by an api rather than by us                                                             | `MapSnapshot`                                           |

- Default-export the one public piece of a file; use named exports for siblings. Two files make a
  deliberate second exception: `container.tsx` exports `Container` _and_ the bare `CONTAINER` class
  string (the bar's `<nav>` is a container that has to be another element), and `navbar.tsx` /
  `footer.tsx` export their link lists, because that is what the bar and the footer render and what
  the tests pin.
- A component that is not one of the shapes above is simply named after what it renders
  (`PoiPicker`, `RouteShareButton`), never after where it sits or who uses it.
- A piece that is only used inside another one keeps that file's name out of it entirely: it is a
  plain function (or no function at all, just the markup), not an exported component.
- Data that the JSX maps over is a named constant, not an array literal buried in the markup.
- Never invent a class name that Tailwind or BeerCSS already owns (see the collision table in §2).

### Types

- The content's shape lives in `src/types.ts` and nowhere else. A component that needs a route names
  `Route`; it does not list the four fields it happens to read.
- Every component's props are an **interface above it**, named `<Component>Props`, with optional
  fields defaulted in the signature.
- A value that can only be one of a few strings is a **union**, never `string` — `RouteTheme`,
  `PoiCategoryName`, the route filter values. A typo in an option is then a compile error instead
  of a list that quietly filters nothing.
- An absent value is written down as such (`string | null` for "nothing is selected", `undefined`
  for "nothing is filtered"), so empty and missing can never be mistaken for each other.
- `strict` is on in `tsconfig.app.json`, and `src/` is TypeScript throughout: `.tsx` for anything
  with markup, `.ts` for data, types and pure helpers.

### Comments

- **One line, always if it can be.** A comment is a note in the margin, not a paragraph. If it
  needs three sentences, cut two — or the code under it is doing too much.
- **Only the load-bearing half survives.** Keep the trap, the measured number, the deliberate
  deviation. Drop the restatement of the code, the "what this file is for" tour, and anything a
  reader can see from the names.
- Comment **why**, not what. "`-me-2` pulls the glyph onto the gutter" earns its place; "set the
  margin" does not.
- A file's opening line may be one sentence of orientation, never a block. Inline notes stay next
  to the line they explain.
- **Everything lowercase**, except where the case carries meaning: an identifier (`MapPanel`,
  `--historic-opacity`), a file name (`index.html`), a proper noun (BeerCSS, Tailwind, Deltion,
  Zwolle) or a quoted UI string. A sentence that opens with one of those keeps its case.
- Note the non-obvious class next to framework behaviour — every BeerCSS quirk in this file exists
  because something silently did the wrong thing once.
- Mark deliberate deviations so the next reader does not "fix" them.

**No decoration.** Nothing is drawn around a comment: no `-----` rules, no boxes, no `*` down the
left edge, no numbered lists. Plain lines that start at column zero, one line each:

```tsx
/* the route list's search box and its five filters — one row, next to each other, so the list below is what the eye lands on */
/* the option lists live here and not in data/routes.ts because they are labels, not data */

interface RouteFiltersProps {
  /* a patch and not a (key, value) pair, so the page always stores a whole, valid filter set */
  onFilterChange: (patch: Partial<RouteFilterState>) => void;
}
```

### React practice

- Function components and hooks only; one responsibility per component.
- Give a piece its own file in `src/components/` once a second caller needs it — see "Where a piece
  lives" above for the caller-count rule. `Icon`, `StarRating`, `EmptyState` and `AreaMap` are the
  shapes that got there.
- Destructure props in the signature and default them (`function Icon({ name, className = "" })`).
- Derive, don't duplicate: no state that can be computed (`visibleRoutes` from `showAll`).
- Effects only to sync with something outside React: the bar's theme switch in `navbar.tsx`
  (the `<body>` class + `localStorage`), `ScrollToTop` in `App.tsx` (the scroll position),
  `PageTitle` (`document.title`) and the
  Google Maps layer — `AreaMap` (creating the map, rebuilding it for the theme, reconciling the dots
  and the line) and `usePlannedRoute` (asking the Routes API). Nothing else has one.
- Key lists by a stable id; never the array index.
- Inline `style` only for CSS custom properties; everything else is a class.

### Prefer the platform

- **Look for the built-in way before building a custom one.** BeerCSS already ships the slot for a
  control inside a field, the state layer behind a chip, the `elevate` shadow scale, the 12-column
  grid, the floating label. If the workaround involves `!important`, an absolutely positioned child
  or a magic offset, the component almost certainly supports the thing you are building — read its
  docs first. The search bar above was three lines of custom CSS until BeerCSS's own slot replaced
  it, and both the alignment bug and the clash disappeared with it.
- **Never hardcode what the system already expresses.** Colours come from roles, spacing from the
  scale, behaviour from the component. A bar height written as `50px` in three places should be one
  edit when it changes; that is only true if it was a token.
- **One change must propagate.** Promote values as soon as they repeat: hex → palette token → M3
  role → utility. The theme switch works _only_ because no component names a colour directly, so
  every new piece inherits light/dark for free. A new fixed colour is a new bug in dark mode.
- **Compose, don't fight.** Tailwind arranges (flex, gap, grid span, breakpoints); BeerCSS paints
  and behaves. Overriding a BeerCSS property with a Tailwind utility is allowed only when it is
  deliberate and documented (the `text-ink` on outlined buttons, for contrast) — never as a repair
  for a misunderstood component.
- **`!important` lives in one place: `@layer overrides`** (§2). It exists for the handful of
  properties BeerCSS declares with the flag itself (button radii) and for the reduced-motion block.
  A stray `!important` anywhere else means a component is being argued with.
- **Mind the two breakpoint systems.** BeerCSS: `m` ≥ 601px, `l` ≥ 993px. Tailwind: `sm` 640,
  `lg` 1024. They do not land together — pair a BeerCSS span (`l6`) with the Tailwind gap that
  belongs to it (`lg:gap-x-*`) and accept the 993–1023px window, or you get a two-column layout
  carrying a one-column gutter.

### Motion

- **Animate freely — but only `transform` and `opacity`.** Layout-affecting properties are the one
  real no: they cost a reflow on every frame.
- **Use the token, never a fresh number**: the default transition is already 200ms on the standard
  curve, so `transition-colors`/`transition-transform` is the whole declaration. A hand-written
  `duration` or `ease-*` means a piece of motion has escaped the system.
- **Movement gets `motion-safe:`** (the card lift, the hero entrance) so the reduced-motion path
  drops it automatically; colour and opacity feedback is never gated.
- **Interactive elements get `ripple`** — BeerCSS's Material 3 press feedback. It is free, it is
  the built-in (§13), and without it a control feels dead.
- **Use Motion only for enter/exit and list changes**, as `m.*` behind the root `LazyMotion`
  (`strict` makes the full-weight `motion.*` an error). Keep one-shot entrances as CSS keyframes.
- **Nothing animates on scroll.** No fade-in-up, no fly-in, no parallax: content that moves while
  you read it is the definition of over-animated (§10).
- **Never re-render artwork to move it.** Drive it through an inherited custom property (the map's
  `--historic-opacity`) and wrap the artwork in `memo` — see §10's measured numbers.

### Adding a dependency

- **The UI kit is decided: BeerCSS.** No second component kit, no icon set, no date/utility grab-bag.
  **Animation is an approved exception** (see §15): motion is part of the product, and hand-rolling
  springs, layout animation or scroll choreography is not this codebase's job.
- **Before adding one**, write down what it replaces. If the answer is "a helper I could write in
  ten lines" (a class-name joiner, a date formatter) it does not go in. If it is "a router, a real
  map, a test runner", it is a real gap — check §15's triggers first, then record the decision.
- **Never touch the backend's dependencies.** `split/backend/` belongs to the project collaborator.
- Install with `npm --prefix split install <pkg>` and add the row to §15, so the next reader
  knows it is deliberate.

### Responsive by default

- **Check every change from 320px to 2560px** — not just your own window. The widths worth
  hitting: 320 (small phone), 390 (phone), 640 (`sm`), 768, 993 (`l`, BeerCSS's last breakpoint),
  1024 (`lg`), 1280 (`xl`), 1440, 1920, 2560.
- **No horizontal overflow at any width**: `document.body.scrollWidth === clientWidth` is the
  pass mark. Most overflows here came from a fixed `gap` inside the 12-column grid, a bar that
  could not shrink, or a chip positioned outside its frame.
- Let things be fluid: a `max-w-[100rem]` container, percentage widths and `rem` gaps. Fixed
  heights only where the design needs one (the card artwork frame), and then they step up at the
  breakpoint where the column grows.
- Bars and rows must survive the narrowest width: that is why the header drops the search icon
  below `sm` and tightens its gaps to `gap-2`, and why the search action lives in the field's
  built-in trailing slot instead of competing with the input for width.
- Text that can be long gets `min-w-0` (+ `truncate` where appropriate) inside a flex row.

### Layout: flex first

- One-dimensional rows and stacks use **flexbox**: `flex`, `flex-col`, `flex-wrap`, `items-center`,
  `justify-between`, `gap-*`.
- Two-dimensional page layout uses BeerCSS's 12-column grid (`grid` + `s12/m6/l4`), never a bare
  Tailwind `grid` (see §2 and §6).
- Space between siblings comes from `gap-*`, not `mr-*`/`mt-*` chains.
- Make companions agree on height by using components that already agree: a BeerCSS `.field` is
  50px tall and centres whatever is slotted into it, so a field and its in-field action need no
  repair. `items-stretch` + Tailwind `h-auto` is a last resort for two BeerCSS components whose
  fixed heights genuinely have to line up.
- A **control standing beside a field** takes the field control's own height, not the 50px wrapper's:
  the control inside a field is 48px, so the action takes `h-12` — the hero's search bar beside "Alle
  routes bekijken", which then shares its top and its bottom too, and the filter row's "Filters
  wissen", which lands on the count's line because that row wraps inside its 1600px column. `h-12`
  means 48px and not 52px because `@layer overrides` makes a button a border box (§2) — beerCSS's
  `content-box` would add the button's 2px boundary on top of it.

### Consistency

- One job, one recipe: one filled orange action per section, `.fill` for a selected state,
  `.border` for an outlined action, `.chip` for overlays on artwork.
- Reach for the token, not the value: spacing, radius and colour come from the scales in §3–§5.
  If a value is needed twice, it becomes a token first.
- Components in the same role share their box: every card the same radius, every chip the same
  height, every bar the same gutter.

### An eye for detail

- **Optical, not mathematical, alignment**: a trailing icon button is pulled back by its glyph's
  inset (`-me-2`), so the icon lines up with the gutter even though its circle does not.
- Alignment is verified, not eyeballed — the logo, hero text, section headings, card grid and
  footer brand all share one left edge, at every width.
- Bars get a hairline (`border-b border-line`) because on a dark surface a shadow carries no
  weight.
- Every interactive element has a hover, a focus state and a **48px hit area** (`tap-target`); every
  state (selected, pressed, disabled) has a defined colour rather than a default.
- Check the work in **both themes** before calling it done, and check the contrast of anything you
  colour (the audit that produced §3's numbers is a two-minute job in the console).

---

## 14. Do / Don't

| Do                                                          | Don't                                                     |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| Use BeerCSS components for Material 3 behaviour             | Hand-build buttons, fields, cards or sliders              |
| Paint components through the M3 roles                       | Override a component's color with a Tailwind `bg-*`       |
| **White** text on the brand orange; blue on the light tints | White on a light orange tint, or blue on the brand orange |
| BeerCSS `.grid` + `.s12 .m6 .l4`                            | A bare Tailwind `grid` with `grid-cols-*`                 |
| Surface steps + a `border-line` hairline for depth          | `elevate` / `shadow-*` — there is no elevation at all     |
| Montserrat (`font-display`) for headings                    | Tailwind's `font-serif`, or serif body copy               |
| Solid steps and hairlines                                   | Gradients — anywhere, including SVG and overlays          |
| Add new icons to the subset URL                             | Drop an `<i>` ligature in and hope it renders             |
| `text-ink` / `text-ink-muted` / `text-accent` for text      | Tailwind's `slate-*`, or any fixed grey                   |
| Add a role to both theme blocks in `index.css`              | Hardcode a light-only colour in a component               |
| camelCase identifiers, SCREAMING_SNAKE content constants    | Abbreviations, or data literals inside JSX                |
| Check 320px → 2560px and both themes                        | Ship after eyeballing one window size                     |
| `aria-label` on icon-only buttons                           | Ship an unlabelled icon button                            |
| `gap-*` for spacing between siblings                        | `mr-*`/`mt-*` chains on every child                       |
| Reach for a built-in slot/class first                       | Hand-position a control inside a component                |
| Promote a repeated value to a token, then a role            | Repeat a hex, a `px` or a breakpoint inline               |
| Add a dependency only for a real gap, and record it         | Reach for a library the stack already covers              |

---

## 15. Dependencies

**The stack is closed: no new dependencies.** Decided 2026-09-14, after evaluating the candidates
below. This section exists so the decision is visible instead of re-argued.

The one trigger §15 wrote down has since fired — the app became multi-page on 2026-09-18 — so
`react-router-dom` was installed then. Nothing else has moved.

### Rules

- **The M3 roles are hand-authored, not generated.** `index.css` derives all ~40 roles in both
  themes from the Deltion huisstijl (§3). Generating them from a seed colour would replace the
  design with a machine-toned approximation of it — the palette _is_ the design here.
- **`split/backend/` is not ours.** The Express API, the database and everything server-side
  belong to the project collaborator, who installs their own dependencies when they build it. Do
  not add server packages, and do not wire the frontend to an API that does not exist yet.
  **The search is the one place that waits on them**: `src/data/searchIndex.json` holds the
  records `src/data/search.ts` matches on, so the home previews already run through a search
  module rather than filtering their own data. When the endpoint exists, that module's import
  becomes a `fetch` and no component changes (§7, §13).
- **A dependency has to replace a real gap**, not a helper that costs ten lines. If one ever
  earns its place, it is added below in the same change that uses it — never speculatively.

### Animation (decided)

**`motion` (Motion for React) is installed**, and it is the only animation dependency the project
needs. It exists for the two things CSS cannot do — a component animating **out** of the DOM, and a
list whose contents change — and it is used nowhere else. See §10 for the rules, the
`LazyMotion` setup and the bundle numbers.

Assessed 2026-09-14 before choosing:

| Candidate               | What it gives                                                                               | Assessment                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`motion`** ✅         | `AnimatePresence` enter/exit, springs, layout animation, gestures, `reducedMotion` built in | **Chosen.** React-first, tree-shakeable, and its reduced-motion handling matches the CSS rule we already had. Trimmed with `LazyMotion` + `domAnimation` to ~28KB gzip             |
| `gsap`                  | Timeline control, ScrollTrigger, SVG morphing                                               | The most powerful option, but imperative and heavy next to a codebase where 90% of the motion is CSS. Only reconsider if scroll-driven set pieces ever become the core of the site |
| `@react-spring/web`     | Physics-based springs                                                                       | Good springs, weaker enter/exit story than Motion                                                                                                                                  |
| `anime.js`              | Tiny engine, excellent SVG support                                                          | Ideal for the map artwork specifically, but has no React integration                                                                                                               |
| `@formkit/auto-animate` | One-attribute list transitions                                                              | Very small and effortless, but cannot choreograph — a cheap complement, not a replacement                                                                                          |
| `lenis`                 | Inertial "smooth" scrolling                                                                 | **No** — it hijacks the scroll, fights the `scroll-behavior` we already set, and is an accessibility hazard on a content site. Wanted the opposite of what this project needs      |

**What it is used for, and nothing more:**

1. **The mobile menu** opening and closing with a real enter/exit, instead of popping in and out of
   the DOM.
2. **The route grid** fading new cards in and removed ones out.

Deliberately **not** used for: scroll-reveal, parallax, page transitions, letter-staggered headings,
springs on hover. Everything else on the page already animates at 60fps with BeerCSS plus the CSS
tokens in §10, and a library will not make the ripple, the card lift or the hero entrance smoother.

### Installed

| Package                                         | Covers                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `beercss`                                       | Material 3 components, 12-column grid, slider, ripple, Material Symbols                                                    |
| _Google Maps JavaScript API_                    | Loaded as a script, not installed as a package: the live maps, the routes between places and the map snapshots (see below) |
| `react-router-dom`                              | Client-side routes: the pages, the active nav link, the breadcrumbs (see below)                                            |
| `motion`                                        | Enter/exit and list animations (menu, route grid) — `LazyMotion` + `domAnimation`, `m.*` components                        |
| `tailwindcss` + `@tailwindcss/vite`             | Layout utilities, the ink/hairline aliases, the token pipeline                                                             |
| `react` / `react-dom`                           | UI runtime                                                                                                                 |
| `express`, `mysql2`, `jsonwebtoken`, `bcryptjs` | Declared for `backend/index.mjs` — the collaborator's side, currently unused by the UI                                     |

### Google Maps (added 2026-09-28)

The app's maps are the **Google Maps JavaScript API**, loaded as a script by
`src/data/googleMaps.ts` — **not** as a package, so the "no new dependencies" rule above still
holds: nothing was added to `package.json`, and `src/googleMaps.d.ts` declares the slice of the api
the app uses by hand, the same trade `beercss.d.ts` makes.

- **The key lives in `split/.env.local`** (already gitignored by the `*.local` rule) as
  `VITE_GOOGLE_MAPS_API_KEY`; `.env.example` documents it. Without a key every map is replaced by a
  panel that says it could not load, and the rest of the app is unaffected.
- **What that key costs** — the free monthly caps per service, the price of an event above them and
  the SKUs this app must never ask for — is written down in
  [`docs/maps-costs.md`](maps-costs.md).
- **Required: Maps JavaScript API.** Two further services are optional and **off by default**,
  because each is a separate switch on the same key: the **Routes API** (`requestDirections` — with
  it the builder draws real street routes with real distances; it is on for the development key, and
  `travelMode` must be the JS spelling, `"WALKING"` / `"BICYCLING"`) and the **Maps Static API**
  (`VITE_GOOGLE_MAPS_STATIC_MAPS=true` — with it the cards show real map pictures instead of
  `RouteShape`).
- **Places API (New)** is what the places were resolved with (§8) — it is on for the development key,
  and a Geocoding or Places lookup at runtime is deliberately _not_ done: the list is resolved once
  and stored, so a page load costs no place lookups.
- **`VITE_GOOGLE_MAPS_MAP_ID`** takes a cloud-configured map id. Without it the api's own
  `DEMO_MAP_ID` is used, which cannot be styled — and styling is the only way to hide Google's own
  place dots from the base map (measured: a map id and `styles` are mutually exclusive) — and which
  sits on the demo tier's daily cap (§8). A map id is what puts the map on the project's own quota.
- **A refused service is a value, not an exception.** Routing answers `null` and remembers one
  refusal for the session; a snapshot falls back to the drawn shape. Neither leaves a broken image
  or an empty frame, and neither floods the console with the same error on every page.
- **The key is public by nature** — it is in the browser, in the script url. So it is protected by a
  referrer restriction (`http://localhost:5173/*`) in the cloud console, never by hiding it.
- **`leaflet` stays declined**, and the row below predates this: Google Maps was chosen because the
  brief asks for it and because one key brings the map, the place data, the routes and the images.

### Routing (added 2026-09-18)

The trigger was written down in advance: _react-router-dom — "revisit the moment a nav link points
at a page that is not this one"_. The app is now five pages (`/`, `/routes`, `/routes/:routeId`,
`/planning`, `/points-of-interest`) plus a catch-all, so it fired.

Why the library and not a hand-rolled hash router: the routes are real URLs that get linked to,
shared and bookmarked, and back/forward, active-link state and breadcrumbs all have to behave.
That is more than the ten lines §13's rule allows before a dependency is justified.

- Paths live in `src/data/navigation.ts`; `App.tsx` maps them to pages and its own `AppLayout` gives
  every page its shell. The bar's link list lives in `components/navbar.tsx`, the footer's in
  `components/footer.tsx` — both read their targets from `navigation.ts`.
- `BrowserRouter` (clean URLs, no `#`) expects the host to serve `index.html` for unknown paths.
  Vite's dev server and `vite preview` both do; **a static host needs an SPA fallback** (or the
  router has to move to `HashRouter`), otherwise a deep link 404s on load.

### Evaluated and declined

| Candidate                           | Would have covered                                                                                       | Verdict                                                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `material-dynamic-colors`           | Generating the full M3 palette from one seed colour (already present as BeerCSS's transitive dependency) | **No** — the roles are hand-authored from the Deltion huisstijl; generating them would trade the design for an approximation             |
| `@material/web`                     | Google's official M3 web components                                                                      | **No** — duplicates BeerCSS wholesale; two M3 implementations would fight over tokens and naming                                         |
| `@tanstack/react-query`             | Server-state caching                                                                                     | **No** — there is no API to consume, and the backend is the collaborator's                                                               |
| `react-router-dom`                  | Client-side routes                                                                                       | **Installed 2026-09-18** — the trigger fired with the multi-page app, see above                                                          |
| `leaflet` + `react-leaflet`         | Real interactive tile maps                                                                               | **Superseded** — the maps are Google Maps since 2026-09-28 (above); leaflet would need tiles, a routing service and map images beside it |
| `vitest` + `@testing-library/react` | Unit and component tests                                                                                 | Not yet — revisit when logic moves out of the hero slider and needs a guarantee                                                          |
| `clsx`                              | Conditional class strings                                                                                | Not yet — revisit if a class string grows past two conditional branches                                                                  |
| A date/format library               | Dutch date and number formatting                                                                         | **No** — `src/format.ts` is four functions (~25 lines) and `Intl`/`toLocaleString` already cover the rest                                |

---

## 16. Material 3 spec conformance

Every Material 3 item this project **follows** is implemented in `index.css` or a component; every
item it **deviates** from is listed here with the reason, so nobody "fixes" it back.

### Following the spec

| Spec item                                                                    | Where                                                                                                                                                  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Every colour role exists in both schemes (incl. `scrim`, `shadow`)           | `index.css` — both blocks                                                                                                                              |
| Two static schemes selected by a `<body>` class, no wallpaper extraction     | `navbar.tsx` (the bar's theme switch)                                                                                                                  |
| Tonal steps + hairlines, no shadows at all                                   | §5 — BeerCSS elevation helpers are disabled in `@layer overrides`                                                                                      |
| Top app bar: brand orange (`--bar`), full-width, 48px action targets         | `Navbar`, **64px** tall (flat, no bottom hairline), white text/icons at 6:1                                                                            |
| Shape: one corner on every box — `--radius-box` (1.5rem), a pill on a 48px control               | `@layer overrides` in `index.css` (`article`, `menu`, fields, buttons, chips)                                    |
| Cards per breakpoint: 1 (mobile) / 2 / 3 (desktop), 4 when there is room     | BeerCSS `s12 m6 l4` + `xl:col-span-3`                                                                                                                  |
| Section rhythm 32–64px, 4px spacing grid                                     | `py-band` (32–52px) and `px-gutter` (16–32px), both `clamp()`ed, on Tailwind's 4px scale; the page header band is tighter still (`pt-header`, 24–40px) |
| Motion: 200ms standard curve, exit curve available, reduced-motion respected | §10, `--ease-standard` / `--ease-exit`                                                                                                                 |
| Focus ring: 2px `primary` + 2px offset                                       | `@layer base` + BeerCSS                                                                                                                                |
| Touch targets ≥ 48×48px                                                      | `.tap-target`, `min-h-12` on mobile nav rows, the map dots' own `before:-inset-3.5`                                                                    |
| Body vs. label type roles (Inter) and headings (Montserrat)                  | §4                                                                                                                                                     |
| Contrast: 4.5:1 body, 3:1 large text                                         | §3; 0 failures in both themes                                                                                                                          |
| One filled action per section, clear button hierarchy                        | §7, §14                                                                                                                                                |

### Deliberate deviations

| Spec                                                                                  | This project                                                                                                                                                     | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bottom nav < 600px, rail ≥ 600px                                                      | Top app bar at every width                                                                                                                                       | Five in-page anchors, not an app shell with destinations; a rail would eat a third of a phone's map.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Text fields 56px tall                                                                 | BeerCSS `.field` = **48px** (its inner control's height; the wrapper carries no border, §5)                                                                        | The field's floating-label geometry belongs to BeerCSS, and 48px is the height BeerCSS's `--_input` already sets. It is also what every action standing beside a field is sized against (`h-12`), so a row of controls shares one height instead of three (§5, §13).                                                                                                                                                                                                                                                                                                  |
| Buttons: a 40dp container                                                             | 40px alone, **48px (`h-12`) beside a field**                                                                                                                      | A field is 48px (§5). Two boxes of different heights on one line cannot share a top and a bottom, so the one action that belongs to a row of fields is grown to the row's height instead of the row being shrunk to the button's. Left alone, the button keeps Material 3's 40dp.                                                                                                                                                                                                                                                                                    |

| Boundaries are 1px (`outline` / `outline_variant`)                                    | Every boundary is **2px**                                                                                                                                        | Material 3's hairline reads as almost nothing beside a filled control, and the brief asks for nothing thinner than 2px. The wider line is set once, with padding compensation so no text moves (§5).                                                                                                                                                                                                                                                                                                                                                               |

| Content capped at 960–1200px                                                          | `max-w-[100rem]` (1600px)                                                                                                                                        | A map application wants width; 1280px left ~312px dead on each side of a 1920 screen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Body text ~35ch                                                                       | 45–65ch (`max-w-md`–`max-w-2xl`)                                                                                                                                 | The hero lead wraps to six lines at 35ch and reads as a paragraph, not a lead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Headings at weight 600                                                                | `font-bold` (700)                                                                                                                                                | Montserrat 700 holds its own next to the map artwork; 600 goes soft at display sizes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Screen edge padding 16px mobile                                                       | `px-5` (20px)                                                                                                                                                    | Optical: the card artwork's own inset needs the extra 4px to look flush.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Dialogs, bottom sheets, snackbars, FABs                                               | The share button's **non-modal popup** (§7) and the saved-route **notice** (§7)                                                                              | Two transient layers, both small and non-blocking; adopt the recipes from the reference (§7, §12) when a third is needed rather than inventing a variant. The **snackbar** is the one M3 component this app now has: it keeps the pattern (bottom centre, `role="status"`, one line, 4s, gone on its own) and drops the rest — no shadow (there is no elevation, §5), no leading icon, **no action button** (a save needs no undo here; the bookmark itself is the undo), and the shared `--radius-box` corner + 2px `border-line` boundary + `surface-container-highest` step instead of M3's `inverse-surface` fill. There is deliberately **no modal anywhere**: a route's full view is a url (`/routes/public/<id>`), which can be linked to, shared and read by a screen reader, and the share popup leaves the map behind it usable. |
| A selected control uses a container tone (`secondary-container`, 8% state layer)      | A **chosen chip** is filled with the brand seed itself — `--selected`: `#f68221` under white in light mode, `#282c6d` under white in dark | The brief asks for the brand colours as fills, and a control that is on is the one thing on a page worth spotting from across the room; a container tone reads as a hover, not as a state. In light mode this is the documented white-on-orange pairing (§3). In dark the fill is deliberately the seed at its own strength: it sits only ~1.2:1 against the card behind it, so the chip reads by its saturation rather than by its lightness — the opposite of Material 3's tonal logic, and the deliberate call (measured 2026-10-02). |
| Top app bar is `surface`                                                              | The bar is the brand orange in light mode, the brand navy in dark                                                                                                | The bar is where the Deltion identity lives, and it carries no content — only a title, links and icon buttons. In light mode the true `#f68221` orange carries **white** text and icons, which is the brand's own pairing; blue on orange would measure 7.8:1 but reads as a different palette, so the accessible option was declined deliberately (white on `#f68221` is 2.6:1 — §3, §11). The alternative, a darker orange bar, is brown. In dark mode the bar is the desaturated brand navy, and the orange moves into the headings, the logo and the avatar. |
| M3 expresses depth as tonal elevation **plus** a shadow, five levels deep             | No shadows at all                                                                                                                                                | A blurred offset edge reads as a smudge or a gradient, and the brief rules gradients out. Depth comes from surface steps and hairlines instead (§5).                                                                                                                                                                                                                                                                                                                                                                                                             |
| State layers 8% hover / 12% press                                                     | BeerCSS's own values, `--active` retuned per theme                                                                                                               | BeerCSS owns the ripple and state layer; we only correct the _tint_ so it reads on dark.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Chips: outlined, transparent background                                               | Filled chips over artwork                                                                                                                                        | A transparent badge on a busy map disappears; artwork badges are not M3 chips (§7).                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Surface emphasis uses a container tone or state layer                                 | The card a url names flashes its own edge twice in the raw brand seed, then fades                                                                                   | The tone the spec reaches for is the page's own background colour here, so it cannot mark where a link landed — and a card that keeps a tone reads as hovered rather than as the place you came for. One 2s keyframe states it and leaves nothing behind; the reader's own pick still uses the tone (`secondary-container`), which is what a pick means on this page (§6, §10).                                                                                                                                                                                         |
| A hero is a full-width image band under the app bar                                   | Full width band, one screen tall; the map **panel** inside it is only as big as the picture shown whole, and centred                                                                    | The band still uses the page's whole width, and the picture's height still comes from the viewport — but nothing is ever cropped to fit it. The panel (`w-fit`) shrinks around the picture instead, so the map is always shown in full: at 1440x900 the picture is 1044x676 inside a 1425-wide band, at 1280x620 it is 612x396, and 0% of any picture is ever cut (§7, `responsive.spec.ts`). The rail is what keeps that shrink small by taking the controls beside the picture instead of under it. |
| Type and spacing are fixed steps (display 57, headline 32, title 22; 4/8/12… spacing) | `clamp()`ed display/headline/title type and gutter/band spacing                                                                                                  | Fixed steps re-wrap a headline mid-phrase at one width and waste room at another; a floor, a slope and a ceiling keep the same proportions at every window size (§4, §5).                                                                                                                                                                                                                                                                                                                                                                                        |
