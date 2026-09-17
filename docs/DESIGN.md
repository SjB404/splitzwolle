# Zwolle Routes — Design System

The single source of truth for the visual language of this project.
**Read this instead of re-deriving styles by scanning the codebase.**

> **Upstream spec:** [`docs/reference/material-3-reference.md`](reference/material-3-reference.md)
> holds the distilled Material 3 spec (component metrics, motion, accessibility). This file is
> what the project *decided*; where the two differ, §16 says so and why.

> Last updated: 2026-09-14

---

## 1. Brand at a glance

**Zwolle Routes** is a Dutch route planner for walking and cycling through Zwolle, with a
historic map layer shown next to the present-day map.

The visual language is **Material 3 (Material You)**, implemented with **BeerCSS**, wearing
the **Deltion huisstijl**: blue, orange and white.

| Aspect | Direction |
| --- | --- |
| Design language | Material 3 — tonal color roles, 12-column grid, filled/outlined components |
| Implementation | BeerCSS components + Material 3 CSS variables, Tailwind for layout |
| Brand | **Deltion blue `#282C6D`** (structure) · **Deltion orange `#F68221`** (accent) — nothing else |
| Mood | Historic meets modern — warm paper vs. cool digital |
| Canvas | `surface`: warm paper in light, desaturated navy in dark; the hero + footer are `inverse-surface` bands (white in light, navy-950 in dark) |
| Surface | `surface` (white) for content, `sand-*` for historic map art |
| Accent | One Deltion orange (`--primary` / `--heading`) — used sparingly, as the top bar's brand surface in light mode and as the ink in dark mode |
| Type | Montserrat for headings, Inter for everything else |
| Gradients | **None.** Not in CSS, not in SVG, not as image overlays |
| Themes | Light **and** dark, both built from the Deltion palette; toggled from the top bar |
| Language | Dutch (`nl-NL`) UI copy, sentence case |

**The core visual metaphor:** warm `sand-*` tones represent the past, cool `haze-*` blue-grey
represents the present. They are placed adjacently (map layers, route artwork) to tell the
"toen en nu" story. Reuse this contrast rather than inventing new colors.

> The palette is deliberately **blue · orange · white** — the Deltion school colors. Blue and
> orange are the only hues in the system; everything else is a neutral step of those two.

---

## 2. How the system is wired

Three pieces, and the order between them matters:

| Piece | Where | Owns |
| --- | --- | --- |
| Deltion palette | `src/index.css` → `@theme static` | Two seeds (`--seed-orange`, `--seed-blue`) and the ramps derived from them: `orange-*`, `blue-*`, `sand-*`, `haze-*` |
| Material 3 roles | `src/index.css` → `:root, body.light` | `--primary`, `--surface`, `--outline`, … that BeerCSS reads |
| BeerCSS components | `src/index.css` → `@import … layer(beercss)` | Buttons, fields, cards, chips, grid, slider, icons |

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
  in it carries the flag — a normal declaration there would be the weakest in the file. Today it
  holds exactly one thing: the connected button group's selection colour and corner shape (§7).

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

### Class-name collisions to respect

Some names exist in both systems with *different* meanings. When you use one, do not add the
Tailwind utility of the same name:

| Class | BeerCSS meaning | Tailwind meaning | Rule |
| --- | --- | --- | --- |
| `grid` | 12-column grid (`grid-template-columns: repeat(12, 1fr)`) | `display: grid` | Use BeerCSS `.grid` + `.s12/.m6/.l4`. Never write a bare Tailwind `grid` with `grid-cols-*` |
| `fixed` | `position: sticky` app-bar behaviour | `position: fixed` | Use `sticky top-0 z-50` on the header; never `fixed` |
| `border` | outlined variant of a component | `border-width: 1px` | Fine together, but the component's own meaning wins |
| `shadow` | bottom shadow helper | box-shadow | Prefer `.elevate` / `.medium-elevate` / `.large-elevate` |
| `transparent`, `fill`, `circle`, `max`, `row` | BeerCSS component states/helpers | – | BeerCSS only — safe |

### Icons

- Icons are **Material Symbols** rendered with BeerCSS's `<i>` element
  (`<i className="text-base">search</i>`), via the `<Icon>` helper in `homePage.jsx`.
- The font is a **Google Fonts subset**, linked in `index.html`. **Adding a new icon means
  adding its name to that URL first** — otherwise the ligature renders as literal text.
- Size with Tailwind `font-size` utilities (`text-base`, `text-xl`), not with BeerCSS's
  `i.small` / `i.large`.

### Deliberately not imported

BeerCSS is imported piecewise from `beercss/src/cdn/…`:

- `settings/font.css` is skipped — it bundles all three Material Symbols families (~1.4 MB).
- `settings/dark.css` is skipped — it ships BeerCSS's own purple dark palette. The dark theme is
  defined from Deltion colors in `src/index.css` instead, and BeerCSS is told which one is active
  by the `light` / `dark` class on `<body>`.

### Themes

The palette is selected by the class on `<body>`: `body.light` or `body.dark`, with the same
Material 3 role names in both. Nothing else in the app knows which theme is running — components
read roles, so they never branch on the theme.

| Piece | Responsibility |
| --- | --- |
| `index.html` → `<body class="light">` | The default, and the signal that stops BeerCSS from auto-switching to its own palette |
| `index.html` → inline script | Re-applies the stored theme before the first paint, so there is no flash |
| `src/components/themeToggle.jsx` | Owns the state, writes the `<body>` class and persists the choice to `localStorage` |

Adding a theme-aware colour means adding a **role** to both blocks in `src/index.css`, not a
fixed colour in a component. The one inline `useEffect` in the codebase lives in `ThemeToggle`,
because `<body>` is outside the React tree.

---

## 3. Color

**Two colours. Everything else is a shade of them.**

| Brand colour | Hex | What it is for |
| --- | --- | --- |
| Deltion blue | `#282C6D` | Structure: **all text**, canvases, hairlines, buttons, the dark theme, the bar in dark mode |
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
--seed-blue:   #282c6d;
```

Every surface, hairline, accent and dark-mode step follows from those two. The ramps are generated
with `color-mix(in oklab, …)`, mixed toward white for the light steps and toward black for the deep
**blue** ones only — the orange ramp has no dark half (see rule 1):

```css
--color-orange-500: var(--seed-orange);
--color-orange-100: color-mix(in oklab, var(--seed-orange) 15%, white);
--color-blue-900:   color-mix(in oklab, var(--seed-blue) 54%, black);
--color-navy-900:   oklch(from var(--color-blue-900) l calc(c * 0.62) h);
--color-sand-200:   color-mix(in oklab, var(--seed-orange) 15%, white);
--color-haze-300:   color-mix(in oklab, var(--seed-blue) 20%, white);
```

Five rules make that work — each exists because ignoring it produced a colour that clashed:

1. **Orange is mixed toward white, never toward black.** A darkened orange reads as *brown*: it stops
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
   palette as a *hue*, which is why nothing can clash with the two brand colours.
6. **The dark surfaces are desaturated, and only they.** `#282c6d` faded toward black keeps its full
   chroma ratio, so at canvas depth it covers a screen in a vivid, *pure* blue. The dark theme wants
   the greyer, duskier navy of a city at dusk, so the deep steps are re-derived through
   `oklch(from …)`, which carries `l` and `h` over untouched and only scales `c` (× 0.62). Nothing is
   hardcoded — re-branding still means editing the two seeds — and the *brand* blue (text, buttons,
   the light theme) stays at full chroma.

| Shade | Value | The job it does |
| --- | --- | --- |
| `orange-500` | `#f68221` | The brand orange itself: the light bar, the selected segment, route lines, map pins — **and every heading and accent in dark mode** |
| `orange-100` | `#ffede2` | **Light orange** — the light tint: unselected buttons, selected chips, quiet fills |
| `orange-50` | `#fff6f1` | The faintest tint, for rows and hover states |
| `orange-200` … `orange-400` | lighter and lighter | Decoration only: map water, artwork tints |
| `blue-500` | `#282c6d` | The brand blue itself — **every heading and accent in light mode** (12.6:1 on white) |
| `blue-900` | `#0b0d2b` | Light-theme body text (18:1 on paper) |
| `navy-600` … `navy-950` | `#23283f` … `#050713` | The dark theme's canvases, cards, bands and bar — the deep blue with a third of its chroma removed |
| `sand-200` | `#ffede2` | The light canvas — the warmer section between the white bands |
| `haze-300` | `#cfd2e2` | Every hairline in the light theme |

### The balance: light is orange-filled, dark is orange-written

The two brand colours never carry equal weight inside one theme, which is what stops them fighting,
and they trade roles when the theme flips:

| | Light | Dark |
| --- | --- | --- |
| Leading colour | **Orange, as fill** — the bar, the selected segment, the light tints, the route lines | **Blue, as surface** — every canvas, card, band and button, desaturated toward grey |
| Supporting colour | Blue is the *ink*: every heading, every accent, body copy, icons, hairlines | Orange is the *ink and highlight*: headings, the eyebrow, the avatar, route lines |
| Never | Orange text — it would have to be brown to be legible | Orange over large areas — an orange button fill, an orange panel, orange body copy |

### Material 3 roles → brand values

| Role | Value | Reads as |
| --- | --- | --- |
| `--primary` | light `orange-500`, dark `blue-300` | The fill of a selected or primary action: brand orange on paper, Deltion blue on navy |
| `--on-primary` | light **white**, dark `blue-950` | On the brand orange in light mode (2.6:1 — see the colour rules), on the light blue fill in dark |
| `--primary-container` / `--on-primary-container` | light `orange-100` / `blue-900`, dark `blue-800` / `blue-100` | The **quiet** fill next to a primary one: light orange tint in light mode, deep blue in dark |
| `--inverse-primary` | light `orange-500`, dark `orange-500` | Orange on the bands |
| `--secondary` / `--on-secondary` | light `blue-500` / white, dark `blue-300` / `blue-950` | Deltion blue |
| `--secondary-container` / `--on-secondary-container` | light `orange-100` / `blue-900`, dark `blue-800` / `blue-100` | Selected chip, active nav row |
| `--tertiary` / `--tertiary-container` | `sand-300` / `sand-200` | Historic paper |
| `--surface` / `--on-surface` | light `sand-200` / `blue-900`, dark `navy-900` / `blue-50` | Canvas + body text |
| `--surface-variant` / `--on-surface-variant` | light `haze-200` / blue at 72% on white (5.5:1), dark `navy-800` / `blue-200` | Map water, muted text |
| `--surface-container-lowest … highest` | light white → white → `sand-100` → `sand-200` → `sand-300`; dark `navy-950` → `navy-800` → `navy-700` → `navy-600` → lighter | Card, panel and section steps — **each step visibly different from the one below** |
| `--outline` / `--outline-variant` | light `blue-400` / `haze-300`, dark `blue-400` / haze tint on `navy-900` | Borders and hairlines |
| `--inverse-surface` / `--inverse-on-surface` | light **white** / `blue-900`, dark `navy-950` / `haze-100` | The hero + footer bands — see below |
| `--heading` | light `blue-500`, dark `orange-500` | What every `h1`–`h6` is painted with — the role that makes each theme read the way it does |
| `--bar` / `--on-bar` | light `orange-500` / **white**, dark `navy-950` / `haze-100` | The top bar, which flips its leading colour with the theme |
| `--avatar` / `--on-avatar` | light `blue-500` / white, dark `orange-500` / `blue-950` | The avatar always wears the *opposite* brand colour to the bar it sits on |
| `--error` | `#ba1a1a` light / `#ffb4ab` dark (Material 3 defaults) | Errors only |

### Muted and strong text

`@theme inline` aliases three utilities onto the roles above, so text and hairlines follow the
theme without any component knowing about it:

| Utility | Role | Light | Dark |
| --- | --- | --- | --- |
| `text-ink` | `--on-surface` | `blue-900` | `blue-50` |
| `text-ink-muted` | `--on-surface-variant` | blue at 72% on white (5.5:1) | `blue-200` |
| `text-accent` | `--accent-text` | `blue-500` (12.6:1) | `orange-500` |
| `text-heading` | `--heading` | `blue-500` (12.6:1) | `orange-500` |
| `border-line` | `--outline-variant` | `haze-300` | haze tint on navy |

**Do not reach for Tailwind's `slate-*`** — those are fixed greys and go unreadable in the dark
theme. Don't dial emphasis down with opacity either: `text-ink-muted/70` measures 3.4:1 on a
card, so the quietest text keeps `text-ink-muted` and takes its restraint from size instead.

### Dark theme roles

Material 3 inverts the tonal roles in dark mode: the accent is lifted a step so it still reads on
a dark surface, and containers step **up** in lightness instead of down.

| Role | Dark value | Why |
| --- | --- | --- |
| `--primary` | `blue-300` (`#a5abc8`) | In dark mode a button is **blue** — orange is reserved for the ink, so the theme does not become two colour families |
| `--on-primary` | `blue-950` | Deep navy on the light blue fill (8.1:1) |
| `--primary-container` / `--on-primary-container` | `blue-800` / `blue-100` | The unselected / quiet fill — a step of blue, not of orange |
| `--secondary` / `--on-secondary` | `blue-300` / `blue-950` | Deltion blue lifted to a light tone |
| `--secondary-container` / `--on-secondary-container` | `blue-800` / `blue-100` | The `.fill` selected state |
| `--surface` / `--on-surface` | `navy-900` (`#0d0f21`) / `blue-50` | The dark canvas — the brand navy with a third of its chroma removed |
| `--surface-container-*` | `navy-950` → `navy-800` → `navy-700` → `navy-600` | Cards and panels step **up** out of the canvas |
| `--inverse-surface` / `--inverse-on-surface` | `navy-950` / `haze-100` | The band is one step *deeper* than the canvas, so hero and footer still read as bands |
| `--heading` / `--accent-text` | `orange-500` (`#f68221`) | The **true brand orange**, undiluted: 7.4:1 on the navy — the ink that makes the theme pop |
| `--inverse-primary` | `--accent-text` | The accent role, so it tunes itself per theme |
| `--outline-variant` | haze tint on `navy-900` | Hairlines stay visible on dark |
| `--active` | haze tint at 14% | BeerCSS's state layer / slider track |

**The hero and footer bands follow the theme, and they are the *lightest* surface in light mode and
the *deepest* in dark mode.** Light: pure white bands, warm paper canvas between them. Dark: navy-950
bands, navy-900 canvas. A light theme with a permanently dark hero reads as a bug, so a band is only
ever one role away from the page it sits in. Because both bands are painted with `inverse-surface`,
everything inside them uses the same theme-aware utilities as the rest of the page (`text-ink`,
`text-ink-muted`, `text-accent`, `border-line`) and switches for free.

The one deliberate exception is the **map artwork**: it paints fixed `sand-*` / `haze-*` / `orange-*`
utilities, because a historic map has no dark mode. Artwork keeps its own colours; anything that
carries or describes it uses roles.

- **Elevation needs a surface to fall on.** On white, a shadow is nearly invisible and a hairline
  is the only separation there is — so the *surface steps themselves* have to do the work (§3).
- **Check a new colour in both themes for separation, not just contrast.** A passing contrast ratio
  says nothing about whether a card is distinguishable from the page it sits on.

### Color rules

1. **Orange is a fill in light mode and ink in dark mode — never the other way round.** Light mode
   leads with orange as the bar, the selected segment and the warm tints, and writes in blue, because
   every orange dark enough to read on paper has already turned brown and stopped being the brand
   colour (rule 1 of the ramp). Dark mode fills in blue and writes in the true `#f68221`, which
   measures 7.4:1 on the navy.
2. **Text *on* the brand orange is white; text on a light orange tint is blue.** White is only ever
   placed on `orange-500` itself — the bar, the selected segment, a filled action, the artwork badge —
   and never on the `orange-100` tints (`--primary-container`), where it would be invisible; those
   carry `blue-900`. **This is the one deliberate contrast trade in the system:** white on `#f68221`
   measures **2.6:1** (blue on the same orange measures 7.8:1), so the light-mode bar and the selected
   segment are below WCAG AA. It buys the brand's own pairing and a bar that does not read as a
   different palette. Every alternative was worse — a darkened orange is brown — so if the bar is ever
   re-examined, the fix is to darken the *fill*, not to move the text. Until then this is documented
   rather than silently allowed (§11, §16).
3. **Text carrying the accent comes from a role, never from an orange utility.** `--heading` and
   `--accent-text` are `blue-500` in light mode (12.6:1 on white) and `orange-500` in dark mode, and
   `text-heading` / `text-accent` read them. Never write `text-orange-500` — it is a *fill* tone.
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

| Role | Family | Tailwind | Weights used |
| --- | --- | --- | --- |
| Headings | Montserrat | `font-display` (applied to `h1`–`h6` in `@layer base`) | 500, 600, 700, 800 |
| Body / UI | Inter | `font-sans` (default on `body`; also BeerCSS's `--font`) | 400, 500, 600, 700 |

### Scale

| Element | Classes | Notes |
| --- | --- | --- |
| Hero `h1` | `text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl` | Tight leading, never above `text-6xl` |
| Section `h2` | `text-3xl font-bold sm:text-4xl` | |
| Card `h3` | `text-lg font-bold` | |
| Body copy | `text-[15px] leading-relaxed text-ink-muted` | Cap prose at `max-w-md`–`max-w-2xl` |
| Small body / meta | `text-sm text-ink-muted` | |
| Micro / label | `text-xs text-ink-muted` | |
| Accent link / icon | `text-accent` | Never `text-orange-500` — it is a fill tone |
| Eyebrow | `text-xs font-semibold uppercase tracking-[0.22em] text-accent` | Above `h1` only; legible on both band tones |
| Chip / badge | `text-[11px] font-bold uppercase tracking-wide` | |
| Icon | `text-base` / `text-xl` | Material Symbols are sized by `font-size` |

### Type rules

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

| Purpose | Classes |
| --- | --- |
| Page gutter | `px-5 sm:px-8` |
| Content max width | `max-w-[100rem]` (1600px) on the inner container |
| Section vertical rhythm | `py-16 sm:py-20` — **the same for every section, hero included**. The hero used to run `lg:py-24`, which left a slab of dead space above the fold that matched nothing else on the page |
| Grid gutter | `gap-6` on BeerCSS's `.grid` (see §6 — the gap is multiplied by 11) |
| Card inner padding | `p-5` (the `article` itself is `no-padding` so the artwork can bleed) |
| Stacked element gap | `gap-3` (buttons), `gap-6` (footer blocks) |

**Shape** — Material 3 shape scale, so most of it comes from the components

| Element | Source |
| --- | --- |
| Buttons, fields, chips, avatars | BeerCSS `.round` / `.circle` — pill and full round |
| Cards, map panels | BeerCSS `article` (12px) — add `overflow-hidden` so artwork follows the radius; a hand-built panel uses `rounded-xl` (same 12px) |
| Icon buttons | BeerCSS `.circle` on a `<button>` |
| Anything square | Never — every surface is rounded |

**Elevation** — **there is none.** Nothing in the app casts a shadow: shadows are switched off
framework-wide in `@layer overrides` (§2), because a blurred offset edge reads as a smudge, or as a
soft gradient, and neither belongs in this language. Depth is expressed with the tools that survive
a flat page:

| Instead of a shadow | Use |
| --- | --- |
| A card on a section | One surface step (white on paper, or paper on white) |
| A panel on artwork | A solid `surface` panel, or a chip with a hairline |
| A bar over content | A tonal step, or `border-b border-line` |

| Level | Class |
| --- | --- |
| Resting | `elevate` (Bar, card, floating chip) |
| Raised | `medium-elevate` |
| Hero artwork | `large-elevate` |
| Flat / on top of artwork | `no-elevate`, or a solid surface chip |

Outlines are hairline borders in `--outline-variant` (Tailwind `border-haze-300`) or the
component's own outlined variant (`.border`), never a colored ring.

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
      <ThemeToggle />
      …
    </nav>
  </header>
  <main className="p-0">…</main>
  <footer className="inverse-surface">…</footer>
</div>
```

- `main` carries `p-0` on purpose: BeerCSS pads `main` by `0.5rem`, which would stop the hero
  band from bleeding edge to edge. The header carries `px-0` for the same reason — its own
  `px-5 sm:px-8` makes the bar line up with every section below it.
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
  as its neighbours — an *inverted* pill would put orange text on white, the one unreadable pairing.
  The standalone search icon collapses below `sm` (the hero already owns a search field) and the gaps
  tighten to `gap-2`, which is what keeps the bar inside a 320px viewport.

### Grid

Use BeerCSS's 12-column grid for page-level layout — **not** Tailwind's `grid`:

```jsx
<div className="mx-auto grid max-w-[100rem] gap-y-10 px-5 lg:gap-x-20">   {/* 12 columns */}
  <div className="s12 l6">…</div>                                     {/* full → half ≥993px */}
  <div className="s12 l6">…</div>
</div>
```

| Prefix | Applies from |
| --- | --- |
| `s` | 0 (all sizes) |
| `m` | 601px |
| `l` | 993px |

**Gap is multiplied by 11.** The grid always paints 12 tracks and 11 gutters, so a `gap` of
`G` costs `11 × G` of the container's width *before* any track gets space. A 32px gap therefore
needs 352px and overflows a phone. Rules:

- Keep plain `gap-*` at **24px or less** (safe from a 320px viewport up).
- Above that, put the big gutter on one axis only and gate it behind a breakpoint:
  `gap-y-10 lg:gap-x-20`.
- Never use BeerCSS's `.grid.large-space` (32px) / `.medium-space` for a full-width card list.

Tailwind flex utilities (`flex`, `flex-col`, `flex-wrap`, `items-center`, `gap-*`) remain the
right tool for one-dimensional rows, e.g. the hero search row or the footer.

### Containers inside `header` / `footer`

BeerCSS makes `header` and `footer` **grid** containers, and a grid item with `mx-auto` shrinks
to its content and centres itself — which silently breaks the page gutter. Every
`mx-auto max-w-[100rem]` container directly inside them needs `w-full`:

```jsx
<header …><nav className="mx-auto w-full max-w-[100rem] px-5 sm:px-8">…</nav></header>
<footer …><div className="mx-auto flex w-full max-w-[100rem] px-5 sm:px-8">…</div></footer>
```

With that in place, the logo, hero copy, section headings, card artwork and footer brand all
start on the same 20px (mobile) / 32px (desktop) gutter.

### Sections

- Anchored sections clear the sticky header via `section[id] { scroll-margin-block-start: 5rem }`
  in `index.css` — do not add `scroll-mt-*` per section.
- Sections **alternate band → surface → band**: the hero and the footer are `inverse-surface`, the
  content between them is `surface`. In light mode that is paper (`sand-200`) against white — a real
  step, because a 2% tint made the whole page read as white (§3). Cards sitting *on* a band take
  `surface` (white on paper) so they step up from it.
- Every section's inner container is `mx-auto max-w-[100rem] px-5 sm:px-8`. The 1600px cap is
  generous on purpose: at 1280px a 1920 desktop wasted a quarter of its width on each side, while
  1600px still keeps the hero's columns and the card grid at comfortable sizes.
- **Trailing icon buttons get an optical pull** (`-me-2`): a 24px glyph centred in a 40px circle
  is inset 8px, so without it the icon floats 8px inside the gutter while the logo on the other
  side sits flush against it.
- **Every icon button also carries `tap-target`**, which extends its *hit* area to the Material 3
  minimum of 48×48px without growing the 40px visual (see §11).

---

## 7. Components

Prefer a BeerCSS component over hand-built styles. These are the canonical shapes used in
`homePage.jsx`.

```jsx
// Filled action — a bare <button> is already Deltion-orange with navy text.
// `ripple` is BeerCSS's Material 3 press ripple + 10% hover/focus state layer,
// and the JS for it is part of beer.min.js — no animation code of our own.
<button type="submit" className="ripple">Zoeken</button>

// Outlined action (quiet, on dark or light). BeerCSS's outlined button defaults to
// `--primary` text, which is only 2.5:1 on white, so it takes the ink colour instead.
<button type="button" className="border text-ink ripple">Alle routes bekijken</button>

// Theme switch — the only stateful control in the header.
// See src/components/themeToggle.jsx for the <body> class + localStorage sync.
<ThemeToggle />

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

// Toggle group — BeerCSS's built-in **connected button group** (`nav.group
// .connected`): one container, 2px seams, `.active` on the selected segment.
// `w-fit` keeps the nav from stretching across its column. `@layer overrides`
// (§2) supplies the three things BeerCSS leaves too quiet: the selected segment
// takes `--primary` / `--on-primary`, the unselected one takes
// `--primary-container` (a **light orange** in light mode, a step of blue in dark),
// and the shape is the Material 3 one — pill outer corners, square seam.
<nav className="group connected mt-6 w-fit" aria-label="Kaartlaag">
  <button className={`ripple text-sm ${on ? "active" : ""}`} aria-pressed={on}>Historische kaart</button>
  <button className="ripple text-sm" aria-pressed={!on}>Actuele kaart</button>
</nav>

// Nav row inside the mobile menu — `min-h-12` keeps the row a 48px touch target
<a href="#routes" className="button left-align min-h-12 ripple fill">Routes</a>

// Search bar — nothing custom. BeerCSS already positions an <a> / <i> / <img> / <svg>
// inside a field (its "clickable icons" pattern): `prefix suffix` reserves the room at
// both ends and the trailing action is the anchor. A <button> is not a positioned slot,
// so an in-field action is a link — which is what "search" does here: jump to the list.
<form onSubmit={(event) => event.preventDefault()} className="max-w-lg">
  <div className="field round border prefix suffix text-sm">
    <Icon name="search" />                       {/* the leading icon must be the first child */}
    <label htmlFor="hero-search" className="sr-only">Zoek een route, plek of wijk</label>
    <input id="hero-search" type="search" placeholder="Zoek een route, plek of wijk…" />
    <a href="#routes" aria-label="Zoeken"><Icon name="arrow_forward" /></a>
  </div>
</form>

// Card — article is the Material 3 card; no-padding lets the artwork bleed.
// Corner: 12px (`corner_medium`) from BeerCSS, or `rounded-xl` on a hand-built panel.
// The lift is `motion-safe:` so it never fights a visitor who asked for less motion.
// Card — article is the Material 3 card; no-padding lets the artwork bleed.
// Corner: 12px (`corner_medium`) from BeerCSS, or `rounded-xl` on a hand-built panel.
// The lift is `motion-safe:` so it never fights a visitor who asked for less motion.
// `xl:col-span-3` takes the grid from 3 to 4 cards per row once there is room for
// them: 3 columns at 1600px produces ~500px cards, past Material 3's 400px ceiling
// for multi-column cards, while 4 columns lands at ~380px.
<article className="s12 m6 l4 xl:col-span-3 no-padding group flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1">
  <div className="relative h-52 overflow-hidden surface-container xl:h-64">…artwork + chips…</div>
  <div className="flex flex-1 flex-col p-5">…title, meta, footer row…</div>
</article>

// Chips overlaying artwork
<span className="chip primary absolute left-4 top-4 text-[11px] font-bold uppercase tracking-wide">…</span>
<span className="chip surface-container-lowest absolute right-4 top-4 text-[11px] font-semibold">…</span>

// Range slider (BeerCSS Material 3 slider — the empty <span /> is the filled track)
// On a phone the surrounding panel is **static under the artwork**; only from `sm`
// up does it become an overlay on the map. An overlay covered a third of a
// 350px-wide map and hid the very thing it controls.
<label className="slider w-full">
  <span className="sr-only">Schakel tussen de historische en de actuele kaart</span>
  <input type="range" min="0" max="100" defaultValue={35} onChange={…} />
  <span />
</label>

// Band (hero, footer) — `inverse-surface` is the inverted canvas tone, so it is paper in
// light mode and navy in dark mode. Its contents use the ink utilities like any other section.
<section className="inverse-surface">…</section>
```

**Color classes come from either system, but only one per element:** BeerCSS on components
(`primary`, `fill`, `surface-container-low`, `inverse-surface`) and Tailwind for layout, ink
(`text-ink`, `text-ink-muted`, `text-accent`) and hairlines (`border-line`).

---

## 8. Map artwork

Maps are **inline SVG**, never raster images, and are the one place where the palette is applied
through Tailwind paint utilities so no hex value appears in JSX.

```jsx
<rect width="610" height="390" className="fill-sand-100" />
<g className="stroke-sand-300" strokeWidth="1.5">…</g>
<polyline className="stroke-orange-500" … />
<circle className="fill-orange-500 stroke-white" strokeWidth="2.5" />
```

- `viewBox="0 0 610 390"` (hero) or `0 0 600 420` (cards), `className="block h-auto w-full"`.
- Card artwork uses `preserveAspectRatio="xMidYMid slice"` to fill a fixed-height frame
  (`h-52`, stepping up to `xl:h-64` where the columns are wide enough that a 2:1 frame would crop
  away the water band).
- **Toen layer:** `fill-sand-100` base, `fill-sand-200` blocks, `stroke-sand-300` street grid.
- **Nu layer:** `fill-haze-100` / `fill-haze-200` water, `stroke-haze-300` streets.
- **Route:** `stroke-orange-500`, `strokeWidth` 3.5 (hero) / 4 (cards), round caps and joins,
  `strokeDasharray="9 9"` (hero) / `"11 11"` (cards).
- **Stops:** a `fill-orange-500` dot with a white halo (`strokeWidth` 2.5–3, radius 5.5–6) backed
  by a larger same-color glow circle at `opacity` 0.2–0.22.
- **Layer swap:** the historic group carries `.historic-layer` and an inline
  `--historic-opacity` custom property (`1 - position / 100`); `index.css` owns the transition.
  Only CSS custom properties may be set inline.
- **Controls over artwork** get a solid `surface` panel (never a gradient scrim); labels that must
  survive cropping live in the React layer as chips, not as `<text>`.

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
below exist to keep that motion *coherent and cheap*, never to remove it.

### The motion tokens

- **The Material 3 curves are tokens**: `--ease-standard: cubic-bezier(0.2, 0, 0, 1)` and
  `--ease-exit: cubic-bezier(0.4, 0, 1, 1)` in `@theme static`. Durations stay with BeerCSS's
  `--speed1/2/3` (100/200/300ms — inside the spec's 200–300ms band).
- **200ms on the standard curve is the default for every Tailwind transition**, set once via
  `--default-transition-duration` / `--default-transition-timing-function`. A component writes
  `transition-colors` and is already on the spec curve; naming a duration again is a smell.
- Entrances come from `@theme`: `--animate-rise` → `animate-rise` (0.45s, standard curve, fill
  `both`). The hero's two columns use it with a 120ms stagger on the artwork column, so the fold
  assembles instead of blinking in.

### What animates

| Interaction | Motion | Where |
| --- | --- | --- |
| Press / click a control | **BeerCSS ripple** — the `ripple` class (600ms expanding circle) | `ripple` is on every button, toggle and nav row |
| Hover / keyboard focus a control | State layer: `currentcolor` at 10% | BeerCSS, same `ripple` class |
| Hover a route card | `motion-safe:hover:-translate-y-1`, 200ms transform | `RouteCard` |
| Toggle the theme | The sun/moon icon spins out and in (Motion, 150ms, `mode="wait"`) + the ripple | `ThemeToggle` |
| Drag the map slider | The historic layer's opacity fades over `--speed2` (200ms) | `.historic-layer` |
| Load the page | Hero columns rise 12px and fade in, staggered 120ms | `animate-rise` (CSS) |
| Open / close the mobile menu | Height + opacity, 200ms, animates **out** as well as in | `m` + `AnimatePresence` (Motion) |
| Expand the route grid | New cards fade in, removed ones fade out | `m` + `AnimatePresence` (Motion) |

### What must not animate

- **Nothing decorative on scroll.** No fade-in-up, no fly-in, no parallax as sections come into
  view: content that animates while you read it is noise, and it is the single most common way a
  site feels over-animated. Motion is used where it *explains state* — a panel opening, a list
  growing — and nowhere else.
- **Motion lives on `transform` and `opacity`.** The one exception is the mobile menu's `height`,
  because a dropdown genuinely changes the page height and Motion interpolates it frame-accurately.
  Do not add a second one without a reason as good as that.
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
  in `homePage.jsx` is 200ms on `[0.2, 0, 0, 1]` — the same values as `--ease-standard` and the
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
whereas a UI that goes completely inert reads as broken.

The CSS block is the one sanctioned `!important` outside `@layer overrides` (§2), because it has to
outrank framework animations declared later in the cascade.

> **Before you "fix" an animation, check the environment.** The speed of a machine does not matter
> here, but a reduced-motion preference does — and it is easy to have on without knowing. Motion even
> warns about it in the console: *"You have Reduced Motion enabled on your device. Animations may not
> appear as expected."* Check `matchMedia('(prefers-reduced-motion: reduce)').matches` (this project's
> VS Code integrated browser reports `true` by default), or use DevTools → Rendering → *Emulate CSS
> media feature prefers-reduced-motion* to see the difference. **A hidden/backgrounded tab also
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
  label. In a BeerCSS `.field` the label sits *inside* the field (that is what BeerCSS positions),
  wired up with `htmlFor` when it cannot wrap the control, and the icon is the field's first child.
- Icon-only controls need `aria-label`; the hamburger also exposes `aria-expanded`.
- **Tappable targets are at least 48×48px** (the Material 3 minimum). BeerCSS buttons are 40px
  tall, so a control smaller than 48px pairs with `.tap-target`, which extends the *hit* area past
  the visual edge via `::before` (BeerCSS already owns `::after` for its state layer). Growing the
  visible circle instead would overrun the bar at 320px.
- Focus is a 2px `primary` outline **offset 2px** (`:focus-visible` in `@layer base`); BeerCSS
  draws the outline, the offset keeps it off the control's own edge.
- `prefers-reduced-motion: reduce` stops movement — keyframes, the card lift and the hero
  entrance — while keeping hover/press feedback. Test it in the browser's rendering-emulation
  panel, not by eyeballing. §10 has the full description, including why the integrated browser
  can report this preference when Windows has animations on.
- Contrast is checked against the Deltion roles: `text-ink` on `--surface` ≈12.6:1, `text-heading`
  12.6:1 light / 7.4:1 dark, `text-accent` the same, muted ink ≈7:1 on the bands. **No text anywhere
  relies on opacity for restraint** — that was measured at 3.4:1 and removed. The audit reports
  **0 failures in dark mode**, and in light mode **19 elements below AA, all of them white text on the
  brand orange at 2.6:1** (the bar's logo, nav links, icons, the selected segment and the artwork
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
- Sentence case in prose; labels and badges are short (`Populair`, `Bekijk`).
- Tone: inviting and place-specific — name real Zwolle areas (Binnenstad, Assendorp, Berkum).
- Keep hero copy to one short paragraph; the design has no room for more.

---

## 13. Craft rules

The visual language above only holds up if the code holds up. These are the habits that keep it
there — they apply to every file under `split/src/`.

### Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Component / page file | **camelCase**, one component per file | `homePage.jsx`, `mapArtwork.jsx`, `themeToggle.jsx` |
| Component / wrapper file | named for what it renders | `HeroMapArtwork`, `RouteArtwork`, `ThemeToggle`, `Icon` |
| Content constants | **SCREAMING_SNAKE_CASE**, declared above the component that uses them | `NAV_LINKS`, `ROUTES`, `HERO_ROUTE`, `ROUTE_PREVIEW_COUNT` |
| Props, state, locals | **camelCase**, no abbreviations | `historicOpacity`, `visibleRoutes`, `menuOpen` |
| Custom CSS class | **kebab-case**, only in `index.css` | `.historic-layer` |
| CSS variable | **kebab-case** custom property | `--surface-container-low`, `--historic-opacity` |

- Default-export the one public piece of a file; use named exports for siblings (`mapArtwork.jsx`
  exports `HeroMapArtwork` and `RouteArtwork`).
- Data that the JSX maps over is a named constant, not an array literal buried in the markup.
- Never invent a class name that Tailwind or BeerCSS already owns (see the collision table in §2).

### Comments

- Comment **why**, not what. "`-me-2` pulls the glyph onto the gutter" earns its place; "set the
  margin" does not.
- Every component file opens with a block explaining what it owns and any integration quirk.
- Every non-obvious class combination next to framework behaviour gets a note — the BeerCSS
  quirks in this file all exist because something silently did the wrong thing once.
- Mark deliberate deviations (`/* widened on purpose */`) so the next reader does not "fix" them.

### React practice

- Function components and hooks only; one responsibility per component.
- Extract to `src/components/` once a piece is shared: `Icon`, the map artwork, `ThemeToggle`.
- Destructure props in the signature and default them (`function Icon({ name, className = "" })`).
- Derive, don't duplicate: no state that can be computed (`visibleRoutes` from `showAll`).
- Effects only to sync with something outside React. There is exactly one, in `ThemeToggle`.
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
  role → utility. The theme switch works *only* because no component names a colour directly, so
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
- Install with `npm --prefix split/split install <pkg>` and add the row to §15, so the next reader
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

| Do | Don't |
| --- | --- |
| Use BeerCSS components for Material 3 behaviour | Hand-build buttons, fields, cards or sliders |
| Paint components through the M3 roles | Override a component's color with a Tailwind `bg-*` |
| **White** text on the brand orange; blue on the light tints | White on a light orange tint, or blue on the brand orange |
| BeerCSS `.grid` + `.s12 .m6 .l4` | A bare Tailwind `grid` with `grid-cols-*` |
| Surface steps + a `border-line` hairline for depth | `elevate` / `shadow-*` — there is no elevation at all |
| Montserrat (`font-display`) for headings | Tailwind's `font-serif`, or serif body copy |
| Solid steps and hairlines | Gradients — anywhere, including SVG and overlays |
| Add new icons to the subset URL | Drop an `<i>` ligature in and hope it renders |
| `text-ink` / `text-ink-muted` / `text-accent` for text | Tailwind's `slate-*`, or any fixed grey |
| Add a role to both theme blocks in `index.css` | Hardcode a light-only colour in a component |
| camelCase identifiers, SCREAMING_SNAKE content constants | Abbreviations, or data literals inside JSX |
| Check 320px → 2560px and both themes | Ship after eyeballing one window size |
| `aria-label` on icon-only buttons | Ship an unlabelled icon button |
| `gap-*` for spacing between siblings | `mr-*`/`mt-*` chains on every child |
| Reach for a built-in slot/class first | Hand-position a control inside a component |
| Promote a repeated value to a token, then a role | Repeat a hex, a `px` or a breakpoint inline |
| Add a dependency only for a real gap, and record it | Reach for a library the stack already covers |

---

## 15. Dependencies

**The stack is closed: no new dependencies.** Decided 2026-09-14, after evaluating the candidates
below. This section exists so the decision is visible instead of re-argued.

### Rules

- **The M3 roles are hand-authored, not generated.** `index.css` derives all ~40 roles in both
  themes from the Deltion huisstijl (§3). Generating them from a seed colour would replace the
  design with a machine-toned approximation of it — the palette *is* the design here.
- **`split/backend/` is not ours.** The Express API, the database and everything server-side
  belong to the project collaborator, who installs their own dependencies when they build it. Do
  not add server packages, and do not wire the frontend to an API that does not exist yet.
- **A dependency has to replace a real gap**, not a helper that costs ten lines. If one ever
  earns its place, it is added below in the same change that uses it — never speculatively.

### Animation (decided)

**`motion` (Motion for React) is installed**, and it is the only animation dependency the project
needs. It exists for the two things CSS cannot do — a component animating **out** of the DOM, and a
list whose contents change — and it is used nowhere else. See §10 for the rules, the
`LazyMotion` setup and the bundle numbers.

Assessed 2026-09-14 before choosing:

| Candidate | What it gives | Assessment |
| --- | --- | --- |
| **`motion`** ✅ | `AnimatePresence` enter/exit, springs, layout animation, gestures, `reducedMotion` built in | **Chosen.** React-first, tree-shakeable, and its reduced-motion handling matches the CSS rule we already had. Trimmed with `LazyMotion` + `domAnimation` to ~28KB gzip |
| `gsap` | Timeline control, ScrollTrigger, SVG morphing | The most powerful option, but imperative and heavy next to a codebase where 90% of the motion is CSS. Only reconsider if scroll-driven set pieces ever become the core of the site |
| `@react-spring/web` | Physics-based springs | Good springs, weaker enter/exit story than Motion |
| `anime.js` | Tiny engine, excellent SVG support | Ideal for the map artwork specifically, but has no React integration |
| `@formkit/auto-animate` | One-attribute list transitions | Very small and effortless, but cannot choreograph — a cheap complement, not a replacement |
| `lenis` | Inertial "smooth" scrolling | **No** — it hijacks the scroll, fights the `scroll-behavior` we already set, and is an accessibility hazard on a content site. Wanted the opposite of what this project needs |

**What it is used for, and nothing more:**

1. **The mobile menu** opening and closing with a real enter/exit, instead of popping in and out of
   the DOM.
2. **The route grid** fading new cards in and removed ones out.

Deliberately **not** used for: scroll-reveal, parallax, page transitions, letter-staggered headings,
springs on hover. Everything else on the page already animates at 60fps with BeerCSS plus the CSS
tokens in §10, and a library will not make the ripple, the card lift or the hero entrance smoother.

### Installed

| Package | Covers |
| --- | --- |
| `beercss` | Material 3 components, 12-column grid, slider, ripple, Material Symbols |
| `motion` | Enter/exit and list animations (menu, route grid) — `LazyMotion` + `domAnimation`, `m.*` components |
| `tailwindcss` + `@tailwindcss/vite` | Layout utilities, the ink/hairline aliases, the token pipeline |
| `react` / `react-dom` | UI runtime |
| `express`, `mysql2`, `jsonwebtoken`, `bcryptjs` | Declared for `backend/index.mjs` — the collaborator's side, currently unused by the UI |

### Evaluated and declined

| Candidate | Would have covered | Verdict |
| --- | --- | --- |
| `material-dynamic-colors` | Generating the full M3 palette from one seed colour (already present as BeerCSS's transitive dependency) | **No** — the roles are hand-authored from the Deltion huisstijl; generating them would trade the design for an approximation |
| `@material/web` | Google's official M3 web components | **No** — duplicates BeerCSS wholesale; two M3 implementations would fight over tokens and naming |
| `@tanstack/react-query` | Server-state caching | **No** — there is no API to consume, and the backend is the collaborator's |
| `react-router-dom` | Client-side routes | Not yet — the nav links are in-page `#` anchors; revisit the moment one points at a page that is not this one |
| `leaflet` + `react-leaflet` | Real interactive tile maps | Not yet — revisit if the hand-drawn inline SVG is replaced by a real map |
| `vitest` + `@testing-library/react` | Unit and component tests | Not yet — revisit when logic moves out of the hero slider and needs a guarantee |
| `clsx` | Conditional class strings | Not yet — revisit if a class string grows past two conditional branches |

---

## 16. Material 3 spec conformance

Every Material 3 item this project **follows** is implemented in `index.css` or a component; every
item it **deviates** from is listed here with the reason, so nobody "fixes" it back.

### Following the spec

| Spec item | Where |
| --- | --- |
| Every colour role exists in both schemes (incl. `scrim`, `shadow`) | `index.css` — both blocks |
| Two static schemes selected by a `<body>` class, no wallpaper extraction | `themeToggle.jsx` |
| Tonal steps + hairlines, no shadows at all | §5 — BeerCSS elevation helpers are disabled in `@layer overrides` |
| Top app bar: brand orange (`--bar`), full-width, 48px action targets | `Navbar`, 65px tall, white text/icons at 6:1 |
| Cards: `corner_medium` (12px), 3 columns at desktop | `article.s12.m6.l4`, hero panel `rounded-xl` |
| Cards per breakpoint: 1 (mobile) / 2 / 3 (desktop), 4 when there is room | BeerCSS `s12 m6 l4` + `xl:col-span-3` |
| Section rhythm 32–64px, 4px spacing grid | `py-16 sm:py-20`, Tailwind's 4px scale |
| Motion: 200ms standard curve, exit curve available, reduced-motion respected | §10, `--ease-standard` / `--ease-exit` |
| Focus ring: 2px `primary` + 2px offset | `@layer base` + BeerCSS |
| Touch targets ≥ 48×48px | `.tap-target`, `min-h-12` on mobile nav rows |
| Body vs. label type roles (Inter) and headings (Montserrat) | §4 |
| Contrast: 4.5:1 body, 3:1 large text | §3; 0 failures in both themes |
| One filled action per section, clear button hierarchy | §7, §14 |

### Deliberate deviations

| Spec | This project | Why |
| --- | --- | --- |
| Bottom nav < 600px, rail ≥ 600px | Top app bar at every width | Five in-page anchors, not an app shell with destinations; a rail would eat a third of a phone's map. |
| Text fields 56px tall | BeerCSS `.field` = 50px | The field's floating-label geometry belongs to BeerCSS; overriding the height breaks it (§13). |
| Content capped at 960–1200px | `max-w-[100rem]` (1600px) | A map application wants width; 1280px left ~312px dead on each side of a 1920 screen. |
| Body text ~35ch | 45–65ch (`max-w-md`–`max-w-2xl`) | The hero lead wraps to six lines at 35ch and reads as a paragraph, not a lead. |
| Headings at weight 600 | `font-bold` (700) | Montserrat 700 holds its own next to the map artwork; 600 goes soft at display sizes. |
| Screen edge padding 16px mobile | `px-5` (20px) | Optical: the card artwork's own inset needs the extra 4px to look flush. |
| Dialogs, bottom sheets, snackbars, FABs | Not implemented yet | The app has no transient layer; adopt the recipes from the reference (§7, §12) when one is needed rather than inventing a variant. |
| Top app bar is `surface` | The bar is the brand orange in light mode, the brand navy in dark | The bar is where the Deltion identity lives, and it carries no content — only a title, links and icon buttons. In light mode the true `#f68221` orange carries **white** text and icons, which is the brand's own pairing; blue on orange would measure 7.8:1 but reads as a different palette, so the accessible option was declined deliberately (white on `#f68221` is 2.6:1 — §3, §11). The alternative, a darker orange bar, is brown. In dark mode the bar is the desaturated brand navy, and the orange moves into the headings, the logo and the avatar. |
| M3 expresses depth as tonal elevation **plus** a shadow, five levels deep | No shadows at all | A blurred offset edge reads as a smudge or a gradient, and the brief rules gradients out. Depth comes from surface steps and hairlines instead (§5). |
| State layers 8% hover / 12% press | BeerCSS's own values, `--active` retuned per theme | BeerCSS owns the ripple and state layer; we only correct the *tint* so it reads on dark. |
| Chips: outlined, transparent background | Filled chips over artwork | A transparent badge on a busy map disappears; artwork badges are not M3 chips (§7). |
| Connected button group for the map-layer switch | BeerCSS `nav.group.connected` + `.active`, with both segment colours and the corner shape corrected in `@layer overrides` (§7) | BeerCSS's own version steps the selected segment one tonal notch up, which is invisible on white and barely there on navy — so the group keeps its structure and takes `--primary` / `--on-primary` for the selection and `--primary-container` for the rest (light orange on paper, blue in dark mode) |

