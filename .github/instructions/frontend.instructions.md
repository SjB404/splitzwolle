---
description: "Use when building or editing UI in this project — React components, pages, JSX/TSX, styling, BeerCSS or Tailwind classes, colors, typography, or design tokens. Covers the Zwolle Routes Material 3 design system (BeerCSS + Deltion colors), component recipes, and React best practices. Read docs/DESIGN.md for the full reference."
applyTo:
  - "split/src/**/*.ts"
  - "split/src/**/*.tsx"
  - "split/src/**/*.css"
---

# Frontend rules — Zwolle Routes

Full reference: `docs/DESIGN.md`. Read it before adding a new section or component. These are the
rules that always apply.

## Look

- Material 3 via BeerCSS, Deltion colours (orange, blue, white). Light and dark theme.
- No shadows, no gradients. Surfaces are separated by tone and a 2px `border-line`.
- One corner radius: `--radius-box` (1.75rem, `rounded-box`; a single row ≤56px tall becomes a pill by itself). Buttons/chips 40px, fields 48px.
- Text is left-aligned. No justified text.

## Colour

- Use role tokens, not ramp colours: `text-ink`, `text-ink-muted`, `text-heading`, `text-accent`,
  `border-line`, `bg-selected text-on-selected`, `bg-bar text-on-bar`, `bg-avatar text-on-avatar`,
  and BeerCSS `surface-*` / `inverse-surface` classes.
- Raw `orange-500` / `blue-500` only for things that look the same in both themes (route line, map
  dots, legend, numbered stop badges).
- Never orange text on a light background. Orange is for fills (actions, selected state).
- Light-mode neutrals come from the `mist-*` ramp; don't mix blue with white for greys.
- A new role goes in both `:root, body.light` and `body.dark` in `src/index.css`.

## Typography

- Headings use Montserrat automatically; use `text-display` (hero), `text-headline` (page h1),
  `text-title` (section h2), `text-xl`/`text-lg` for h3.
- Eyebrow: `text-xs font-semibold uppercase tracking-[0.22em] text-accent`.
- One h1 per page; don't skip heading levels.
- UI copy is Dutch; code and comments are English.

## Layout

- Wrap content in `Container`; sections are `<section className="py-band">`.
- Column layouts: BeerCSS `.grid` + `s12 m6 l4`. Card grids are `s12 m6 l4`. Everything else: flex.
- Mobile first: stack on phones, side panels go under the main content.
- Paths only come from `src/data/navigation.ts`.

## Components

- Filled button: bare `<button>` (or `.button` on a link). Outlined: `button border text-ink`.
  Icon button: `circle transparent`. All get `ripple tap-target`.
- Choice chip: `chip medium tap-target ripple`, selected adds
  `bg-selected text-on-selected border-transparent` plus `aria-pressed`.
- Reuse `SearchField`, `FilterSelect`, `ClearFiltersButton`, `EmptyState`, `PageHeader`,
  `SectionHeading`, `StarRating`, `AreaMap` instead of rebuilding them.
- Cards are `<article>`. Full-bleed children need `rounded-none`. A whole-card link is an
  `absolute inset-0` `<Link>` as the last child.
- Icons: `<Icon name="…" />`. Add every new icon name to the `icon_names` subset in `index.html`.

## Maps

- All interactive maps go through `components/areaMap.tsx` and `data/googleMaps.ts`.
- Keep Google's UI off; zoom is our own `ZoomControls`.
- Maps must still work without an API key (fallback panel). Tests run without one.
- Don't restyle the hero slider; it is the stock BeerCSS slider.

## Motion

- Use `m.*` (not `motion.*`) and the presets in `src/motion.ts`: `MOTION_TRANSITION` (200ms),
  `MOTION_EXIT` (150ms), `MOTION_SWAP` (120ms), `COLLAPSE`, `LIST_ITEM`, `POPUP`.
- Card grids: `LIST_ITEM` inside `<AnimatePresence initial={false} mode="popLayout">`.
- Keep durations between 120 and 200ms. No scroll, entrance or stagger animations.
- Hover lift uses `transition-[translate]`, never `transition-transform`.
- Reduced motion is deliberately ignored (`MotionConfig reducedMotion="never"`). Don't add it back
  without asking.

## Accessibility

- `tap-target` on every button, chip and icon link (48px hit area).
- Never remove focus outlines.
- Toggles use `aria-pressed`; icon-only buttons need `aria-label`; decorative icons are hidden.
- Counts and status messages use `aria-live="polite"` on an element that stays mounted.
- Menus and popups close on Escape.

## BeerCSS gotchas

- A plain `grid` class is BeerCSS's 12-column grid. Use `inline-grid` or flex for anything else.
- `.transparent` forces `color: inherit !important`; use `bg-transparent` if the text colour must change.
- Every element gets `position: relative` and `border-radius: inherit` from the reset.
- A `<ul>` directly inside `<nav>` becomes a dropdown; wrap it in a `<div>`.
- `.fixed` on a header/footer means sticky.
- To beat BeerCSS: a rule in `@layer components`, or `!important` in `@layer overrides`.

## Code

- One component per camelCase file in `src/components/`; pages end in `Page`.
- Tailwind first; CSS only for what utilities can't do, placed next to its component.
- Comments short and about *why*. Keep existing BeerCSS-workaround comments.
- No new UI, icon or animation libraries.
- When a change touches something written in `docs/DESIGN.md`, update it in the same change.
