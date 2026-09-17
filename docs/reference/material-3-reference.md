# Material 3 Reference — implementation spec

The upstream Material 3 spec, distilled. **This file is the "what the spec says";**
[`docs/DESIGN.md`](../DESIGN.md) is "what this project decided" and always wins where the two
disagree — [`§16 Spec conformance`](../DESIGN.md#16-material-3-spec-conformance) lists every
deliberate deviation, with the reason.

Placeholders from the original draft are resolved for this project:

| Placeholder | This project |
| --- | --- |
| `[DESIGN_FILE_PATH]` | `docs/DESIGN.md` (decisions) + `split/src/index.css` (the role values) |
| `[theme_toggle_mechanism]` | the `light` / `dark` class on `<body>`, owned by `split/src/components/themeToggle.jsx` |
| `[dark_mode_mechanism]` | `body.dark` (BeerCSS reads the same class) |

House rules that override the spec: **no gradients anywhere**, the palette is the
**Deltion huisstijl** (blue · orange · white — never M3's baseline purple), and the UI
implementation is **BeerCSS + Tailwind**, so component metrics come from BeerCSS rather than
from the pixel values below.

---

## 0. Theming rules (critical)

- All colors come from the project's design file: `docs/DESIGN.md` + `split/src/index.css`.
- Reference colors by ROLE NAME only (e.g. `primary`, `surface-container-high`). Never hardcode
  hex values.
- Two static schemes exist: light and dark. Switch via the `<body>` class.
- Dynamic color / system wallpaper extraction: NOT used. Ignore it.
- State layers: apply as opacity overlays on the resolved role color.
  - Hover: 8% of `on_*` color
  - Focus: 12% of `on_*` color
  - Press/Active: 12% of `on_*` color
  - Disabled: 38% opacity on content, 12% of surface on container

### Color roles (all defined for light + dark in `index.css`)

primary, on_primary, primary_container, on_primary_container,
secondary, on_secondary, secondary_container, on_secondary_container,
tertiary, on_tertiary, tertiary_container, on_tertiary_container,
error, on_error, error_container, on_error_container,
background, on_background,
surface, on_surface, surface_variant, on_surface_variant,
surface_container_lowest, surface_container_low, surface_container,
surface_container_high, surface_container_highest,
outline, outline_variant,
inverse_surface, inverse_on_surface, inverse_primary,
scrim, shadow

> In CSS these are kebab-case: `--surface-container-high`, `--on-primary` (BeerCSS's own naming).

### Surface container scale (nested depth, lightest → darkest in light mode, inverted in dark)

surface_container_lowest → surface_container_low → surface_container → surface_container_high →
surface_container_highest

---

## 1. Typography

Fonts:

- **Body / labels / UI text:** Inter (weights 400, 500, 600)
- **Headings / titles / display:** Montserrat (weights 400, 500, 600, 700)

Font stack (CSS):

- Body: `font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`
- Headings: `font-family: 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;`

Load via `@font-face` or a CDN (this project uses the Google Fonts link in `split/index.html`).
Preload the weights you actually use.

### Type scale

| Token | Font | Size | Weight | Line height | Tracking | Use |
|-------|------|------|--------|-------------|----------|-----|
| display_large | Montserrat | 57px | 600 | 64px | -0.25px | Hero, splash |
| display_medium | Montserrat | 45px | 600 | 52px | 0 | |
| display_small | Montserrat | 36px | 600 | 44px | 0 | |
| headline_large | Montserrat | 32px | 600 | 40px | 0 | Section headers |
| headline_medium | Montserrat | 28px | 600 | 36px | 0 | |
| headline_small | Montserrat | 24px | 600 | 32px | 0 | |
| title_large | Montserrat | 22px | 600 | 28px | 0 | Card titles |
| title_medium | Montserrat | 16px | 600 | 24px | 0.15px | Subtitles |
| title_small | Montserrat | 14px | 600 | 20px | 0.1px | |
| body_large | Inter | 16px | 400 | 24px | 0.5px | Primary body |
| body_medium | Inter | 14px | 400 | 20px | 0.25px | Secondary body |
| body_small | Inter | 12px | 400 | 16px | 0.4px | Captions, fine print |
| label_large | Inter | 14px | 500 | 20px | 0.1px | Buttons, nav items |
| label_medium | Inter | 12px | 500 | 16px | 0.5px | Chips, badges |
| label_small | Inter | 11px | 500 | 16px | 0.6px | Minimum label |

### Rules

- **Montserrat** for: `display_*`, `headline_*`, `title_*` — anything that reads as a heading.
- **Inter** for: `body_*`, `label_*` — anything that reads as content, label or UI text.
- Body text max width: ~45–65ch for readability in this project (the spec's 35ch breaks the hero
  lead into six lines — see DESIGN.md §16).
- Use `title_large` or `headline_small` for card/section titles.
- Use `body_large` for primary content, `body_medium` for secondary.
- Use `label_large` for all button labels.
- Montserrat at 600 reads slightly heavier than Inter at 500 — intentional, it creates hierarchy.
- If a component has both a title and body, the title uses Montserrat and the body uses Inter.
- Never mix fonts within a single text node.

---

## 2. Shape (corner radius)

| Token | Radius | Use |
|-------|--------|-----|
| corner_none | 0px | |
| corner_extra_small | 4px | Chips, small badges |
| corner_small | 8px | Text fields, list items |
| corner_medium | 12px | Cards (default) |
| corner_large | 16px | FAB, dialogs |
| corner_extra_large | 28px | Sheets, large modals, bottom nav |
| corner_full | 9999px (pill) | Buttons, FAB, search bar, chips |

---

## 3. Elevation

Depth is expressed via **tonal elevation** (primary color overlay) FIRST, shadow SECOND.

| Level | Tonal overlay (primary at) | Shadow | Typical use |
|-------|---------------------------|--------|-------------|
| 0 | 0% | none | Flat surfaces |
| 1 | ~3% | 0 1px 2px rgba(0,0,0,0.3) | Cards (resting) |
| 2 | ~6% | 0 1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15) | Cards (hover), FAB resting |
| 3 | ~9% | 0 4px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3) | FAB hover, app bar (scrolled) |
| 4 | ~12% | 0 6px 10px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3) | Dialogs |
| 5 | ~15% | 0 8px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3) | Overlays, snackbars |

On web: `box-shadow` plus a `::before` pseudo-element with `background: primary` at the specified
opacity for the tonal layer. In this project BeerCSS's `elevate` / `medium-elevate` /
`large-elevate` helpers already do exactly that — use them instead of hand-writing a shadow.

---

## 4. Spacing

- Base unit: 4px. All spacing is a multiple of 4px.
- Common values: 4, 8, 12, 16, 24, 32, 48, 64
- Component internal padding: 16px (cards), 8px (chips), 24px (button horizontal)
- Section spacing: 24px (between components), 32–64px (between sections)
- Screen edge padding: 16px (mobile), 24px (tablet), 32px (desktop)

---

## 5. Buttons

### Hierarchy (HIGH → LOW emphasis). Use ONE per screen at each level max

| Variant | Background | Text/Icon | Border | Use |
|---------|-----------|-----------|--------|-----|
| Filled | `primary` | `on_primary` | none | Primary action. ONE per screen. |
| Elevated | `surface_container_low` | `primary` | none + elevation 1 | On busy/colored backgrounds |
| Filled tonal | `secondary_container` | `on_secondary_container` | none | Secondary important ("Add", "Next") |
| Outlined | transparent | `primary` | 1px `outline` | Secondary/alternative ("Cancel") |
| Text | transparent | `primary` | none | Low emphasis, navigational ("Learn more") |

### Specs

- Height: 40px (default). Sizes: XS=24, S=32, M=40, L=48, XL=56
- Horizontal padding: 24px (M), 16px (S)
- Corner: `corner_full` (pill)
- Icon: 18px, 8px gap to label
- Label: `label_large` (14px, weight 500)
- Min touch target: 48×48px (use padding if the button is smaller)
- State layers: 8% hover, 12% press (on `on_*` color)

### Button groups

**Standard button group** — buttons side by side with a gap. On press/active the interacted button
EXPANDS (default 150% width) and neighbours COMPRESS. `expandedRatio`: 0 = none, 0.5 = 150%
(default), 1 = 200%. Inner padding: XS=18px, S=12px, M=8px, L=8px, XL=8px. Use Filled, Filled
Tonal or Outlined styles (NOT Text or Icon).

**Connected button group** (replaces "segmented buttons") — buttons share a single container,
separated by a 2px gap. Outer corners rounded (`corner_full`), inner corners square (0px).
Selected: `secondary_container` bg + `on_secondary_container` content. Unselected: transparent bg
+ `on_surface` content. Inner padding: XS=4px, S=8px, M=8px, L=16px, XL=20px. Use for view
switchers, filter toggles, single/multi-select within a tight group.

> This project's historic/current map switch is a connected-button-group case;
> it is currently two independent outlined/filled buttons — see DESIGN.md §16.

### Split buttons (action + variant)

Two parts: leading (primary action) + trailing (secondary, usually a chevron). Trailing part is
narrower. On trailing press, reveal a menu of variant actions. Available in Filled, Filled Tonal
and Outlined.

---

## 6. Icon buttons

| Style | Background | Icon color |
|-------|-----------|-----------|
| Standard | transparent | `on_surface_variant` |
| Filled tonal | `secondary_container` | `on_secondary_container` |
| Outlined | transparent + 1px `outline` border | `on_surface_variant` |
| Filled | `primary` | `on_primary` |

- Sizes: XS=24px, S=32px, M=40px (default), L=48px
- Icon size: 24px (M), 20px (S), 18px (XS)
- Toggle icon buttons: morph circle → rounded square when selected; icon swaps outlined → filled
- Min touch target: 48×48px regardless of visual size (use padding) — this project uses the
  `.tap-target` utility for exactly that (BeerCSS's default circle is 40px)

---

## 7. Floating action button (FAB)

| Size | Dimensions | Corner |
|------|-----------|--------|
| Small | 40×40px | 12px |
| Medium (default) | 56×56px | 16px |
| Large | 96×96px | 28px |
| Extended | 56px height, variable width | 16px |

- Elevation: 3 (resting), 4 (hover)
- Background: `primary_container`, icon: `on_primary_container`
- One FAB per screen for the primary action
- Position: bottom-right (desktop), bottom-center or bottom-right (mobile)
- FAB menu (expressive): the FAB expands to reveal related actions in a row

---

## 8. Cards

| Variant | Background | Border | Elevation | Use |
|---------|-----------|--------|-----------|-----|
| Elevated | `surface` | none | 1 (resting), 2 (hover) | Default, interactive |
| Filled | `surface_container` | none | 0 | Non-interactive, grouped content |
| Outlined | `surface` | 1px `outline_variant` | 0 | Low emphasis, dense layouts |

- Corner: `corner_medium` (12px)
- Content padding: 16px
- Media: full-bleed top (no top radius on the image) or contained with 12px radius
- Max width: 400px (single column), 320px (multi-column)

---

## 9. Chips

All chips: pill (`corner_full`), height 32px, label `label_medium`.

| Type | Use | Selected state |
|------|-----|----------------|
| Assist | Triggers an action with context (icon + label) | N/A |
| Filter | Multi-select filtering | `secondary_container` bg + checkmark |
| Input | Compact data entry (removable) | `secondary_container` bg + X |
| Suggestion | Suggests a query/option | N/A |

- Unselected: transparent bg + 1px `outline` border + `on_surface_variant` text
- Horizontal padding: 16px (with icon), 12px (text only)
- Icon: 18px, 8px gap to label

> Labels/badges drawn **on top of map artwork** are not chips in this sense; they are badges and
> stay filled for legibility (DESIGN.md §7).

---

## 10. Navigation

### Responsive strategy

| Breakpoint | Navigation pattern |
|-----------|-------------------|
| < 600px (mobile) | Bottom navigation bar |
| 600–840px (tablet) | Navigation rail (collapsed, icons only) |
| ≥ 840px (desktop) | Navigation rail (expanded, icons + labels) OR side nav drawer |

**This project uses a top app bar at every width** (it is a landing page with five anchor links,
not an app shell with N destinations) — see DESIGN.md §16.

### Bottom navigation bar (mobile)

- Height: 80px; background `surface_container`; max 5 items
- Indicator: 80×32px pill in `secondary_container` behind the selected icon
- Selected: `on_secondary_container` icon + label; unselected `on_surface_variant`
- Label: `label_medium`; icon 24px; fixed to the bottom, full width

### Navigation rail (tablet/desktop)

- Width: 80px (collapsed) or 200px (expanded)
- Same color/indicator logic as the navigation bar
- Fixed to the left edge, full height; top padding 16px, items 16px apart

### Top app bar

| Variant | Height | Use |
|---------|--------|-----|
| Small | 64px | Default, dense layouts |
| Center | 64px | Title centered, search bar below |
| Large | 152px (collapses to 64px on scroll) | Hero-style headers |

- Background: `surface` (flat at rest), gains elevation 3 on scroll
- Title: `title_large` (large) or `title_medium` (small/center)
- Action icons: icon buttons on the right, 48px hit area each

### Tabs (sub-navigation within a page)

- Height: 48px
- Primary (non-scrollable): max 5 tabs, equal width, sliding pill indicator
- Scrollable: snap behavior, variable width
- Selected: `primary` indicator (pill or underline) + `on_surface` label
- Unselected: `on_surface_variant` label, no indicator
- Label: `label_large`

---

## 11. Text fields

| Style | Background | Border | Corner |
|-------|-----------|--------|--------|
| Filled (default) | `surface_container_highest` | none (bottom border 1px `on_surface_variant`) | 8px top |
| Outlined | transparent | 1px `outline` (all sides) | 8px all |

- Height: 56px
- Label floats from inside to top on focus/fill (animated, 200ms)
- Label (floating): `label_medium`, `on_surface_variant`
- Input text: `body_large`, `on_surface`
- Placeholder: `body_large`, `on_surface_variant` at 38% opacity
- Leading/trailing icon: 24px, 16px from the edge
- Helper text: `body_small`, `on_surface_variant`, below the field
- Error state: border/label → `error`, background (filled) → `error_container`
- Focused: bottom border (filled) or full border (outlined) → `primary`, 2px width
- Disabled: 38% opacity on all content

> BeerCSS's `.field` is 50px tall with its own label geometry; this project keeps BeerCSS's metric
> rather than overriding it (DESIGN.md §16).

---

## 12. Dialogs, sheets, snackbars

### Dialog

- Corner `corner_extra_large` (28px); max width 560px; elevation 6
- Background `surface_container_high`; title `title_large`; body `body_medium`
- Actions: text buttons, right-aligned, `label_large`
- Scrim: `scrim` color (typically black at 32–40% opacity)

### Bottom sheet (mobile) / side panel (desktop)

- Corner `corner_extra_large` on top (or left for a desktop side panel)
- Drag handle: 32×4px pill, `on_surface_variant` at 30% opacity
- Background `surface_container`; states hidden → partial (60%) → expanded (90%)
- On desktop use a side panel (right drawer) instead of a bottom sheet

### Snackbar

- Corner `corner_extra_small` (4px); height 48px; elevation 3
- Background `inverse_surface`; text `inverse_on_surface`; action `inverse_primary`
- Position: bottom-center (mobile), bottom-left (desktop)
- Auto-dismiss: 4–10 seconds; max 1 visible at a time (queue the rest)

---

## 13. Lists

| Type | Use |
|------|-----|
| One-line | Single text item |
| Two-line | Title + subtitle |
| Three-line | Title + 2 lines of body |
| With icon | Leading icon + text |
| With media | Leading image + text |

- Height: 56px (one/two-line), 72px (three-line)
- Padding: 16px horizontal
- Divider: 1px `outline_variant`, 16px inset from the left
- Leading icon: 24px, 16px from the edge, `on_surface_variant`
- Title: `title_medium`, `on_surface`; subtitle: `body_medium`, `on_surface_variant`
- Trailing icon: 24px, 16px from the right edge
- Selected: `secondary_container` background (full width)

---

## 14. Progress & loading

- Linear (determinate): 4px height, `primary` fill, `surface_container_highest` track
- Linear (indeterminate): two segments animating
- Circular (determinate): 24px or 40px, 4px stroke, `primary`
- Circular (indeterminate): rotating arc
- Use indeterminate for unknown duration, determinate when progress is known
- Never block interaction with a full-screen loader unless absolutely necessary

---

## 15. Switches & sliders

### Switch

- Track 52×32px, `corner_full`; thumb 24px (off), 28px (on)
- Off: track `surface_container_highest`, thumb `outline`
- On: track `primary`, thumb `on_primary`
- Disabled: 38% opacity

### Slider

- Track: 4px height, `corner_full`
- Active track `primary`; inactive track `surface_container_highest`
- Thumb: 16px circle, `primary`, expands to 20px on drag
- Value indicator: appears above the thumb on drag, `inverse_surface` background

### Checkbox

- 18×18px, 2px border `outline` (unchecked), `primary` fill + `on_primary` check (checked)
- Corner 2px; 48px touch target

### Radio

- 20px outer circle, 10px inner dot
- Unchecked: 2px border `outline`; checked: `primary` border + `primary` dot

---

## 16. Motion

- Default duration: 200–300ms for most transitions
- Easing: `cubic-bezier(0.2, 0, 0, 1)` (standard)
- Expressive/spring: `cubic-bezier(0.2, 0, 0, 1)` for enter, `cubic-bezier(0.4, 0, 1, 1)` for exit
- Shape morphing: animate `border-radius` between states (e.g. toggle button circle → square)
- Tactile: on press, scale to 0.97 + slight translate toward the pointer
- Page transitions: fade + slight slide (8px) forward, fade + slight slide back
- Never animate layout-shifting properties (width, height, top, left) — use `transform` and `opacity`
- Respect `prefers-reduced-motion`: disable all non-essential animations

> Both curves are tokens in `split/src/index.css` (`--ease-standard`, `--ease-exit`) and the
> 200ms/standard-curve pair is the **default** for every Tailwind `transition-*` utility.

---

## 17. Accessibility

- All interactive elements: minimum 48×48px touch/click target
- Color contrast: 4.5:1 for body text, 3:1 for large text (≥24px or ≥18px bold)
- Never rely on color alone — pair with icons, labels or shape changes
- All images: `alt` text (empty string for decorative)
- All icon buttons: `aria-label`
- All form fields: associated `<label>`
- Focus states: visible focus ring (2px `primary` outline, 2px offset)
- Keyboard: all interactive elements reachable via Tab, operable via Enter/Space
- Screen readers: use ARIA roles for custom components (`role="tablist"`, `aria-selected`, …)
- Dynamic content: `aria-live="polite"` for updates (snackbars, toasts)

---

## 18. Responsive layout

### Breakpoints

| Name | Min width | Layout |
|------|-----------|--------|
| Mobile | 0px | Single column, bottom nav, bottom sheets |
| Tablet | 600px | 1–2 columns, nav rail (collapsed) |
| Desktop | 840px | 2–3 columns, nav rail (expanded) or sidebar |
| Wide | 1200px | Max content width 960px, centered |

### Layout rules

- Use CSS Grid or Flexbox. Define a max content width (960–1200px) centered on wide screens.
- Navigation switches pattern at breakpoints (bottom bar → rail → sidebar)
- Cards: 1 column (mobile), 2 (tablet), 3 (desktop)
- Dialogs: full-width on mobile (16px margin), centered with max-width on desktop
- FAB: bottom-right on desktop, bottom-center on mobile
- Text fields: full-width on mobile, can be paired (50/50) on desktop
- Touch targets: 48px minimum on mobile, 32px acceptable on desktop (mouse)

> This project's layout breakpoints come from BeerCSS (`m` ≥ 601px, `l` ≥ 993px) and Tailwind
> (`sm` 640, `lg` 1024, `xl` 1280) — see DESIGN.md §6. The content cap is 1600px on purpose.

---

## 19. Design file integration

Your design file is the single source of truth for:

- All color role values (light + dark)
- Typography overrides (if any)
- Shape overrides (if any)
- Spacing tokens (if any)
- Component-specific overrides

Rules:

- Read all design tokens from the design file at build time
- Expose them as CSS custom properties: `--md-primary`, `--md-on-primary`,
  `--md-surface-container-high`, etc.
- Component styles reference these variables, never raw values
- If a token is missing from the design file, fall back to the M3 baseline value for that role
- Dark mode: swap the variable set via `body.dark`
- Do NOT define component-level colors in component files — always pull from the token layer

> In this project the "design file" is `split/src/index.css`: `@theme static` holds the Deltion
> ramps, and `:root, body.light` / `body.dark` hold every M3 role. BeerCSS reads those variables
> directly, so no `--md-` prefix is used.

---

## 20. Decision rules (quick reference)

| Situation | Use |
|-----------|-----|
| One primary action per screen | Filled button |
| Secondary important action | Filled tonal button |
| Cancel / alternative | Outlined button |
| Low-emphasis link-style | Text button |
| Mutually exclusive options (≤5) | Connected button group |
| Related actions with emphasis shift | Standard button group |
| Action + variant (e.g. Send/Schedule) | Split button |
| Primary action on a page (floating) | FAB |
| Filter/search options | Filter chips |
| Removable items (tags, recipients) | Input chips |
| Sub-page navigation (≤5) | Tabs |
| Top-level navigation | Bottom bar (mobile) / rail (desktop) |
| Confirm / alert / form | Dialog |
| Extended content (mobile) | Bottom sheet |
| Extended content (desktop) | Side panel / drawer |
| Transient notification | Snackbar |
| Repetitive items | List |
| Grouped related content | Card |
| Toggle on/off | Switch |
| Select one from many (ordered) | Radio group |
| Select multiple (ordered) | Checkbox group |
| Select one from many (unordered, ≤5) | Connected button group |
| Continuous value | Slider |
| Loading (known duration) | Determinate progress |
| Loading (unknown duration) | Indeterminate progress |

---

## 21. Do's and don'ts

✅ DO:

- Reference colors by role name via CSS variables, never hex
- Use one filled button per screen maximum
- Use the surface_container scale for nested depth
- Apply state layer opacities to all interactive elements
- Maintain 48px minimum touch targets
- Use `label_large` for buttons, `body_large` for primary content
- Animate with `transform` and `opacity` only
- Respect `prefers-reduced-motion`
- Use semantic HTML + ARIA for accessibility
- Keep spacing on the 4px grid

❌ DON'T:

- Don't hardcode hex values in components
- Don't use drop shadow as the primary depth cue (tonal overlay first)
- Don't use Text or Icon buttons inside button groups (they have no container)
- Don't exceed 5 items in bottom navigation or primary tabs
- Don't use more than one filled button per screen
- Don't animate layout-shifting properties
- Don't rely on color alone for state indication
- Don't use fixed pixel widths for content (use max-width + responsive)
- Don't use Google Sans (proprietary) — use Inter/Montserrat
- Don't implement dynamic color / wallpaper extraction
- Don't mix M3 components with non-M3 visual styles in the same view
