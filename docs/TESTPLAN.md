# Test plan — Zwolle Routes

Everything here is machine-run: 563 tests in two suites.

- **Unit + component tests** — Vitest + jsdom + React Testing Library. `split/split/tests/unit/`.
- **End-to-end tests** — Playwright + Chromium against a real dev server. `split/split/tests/e2e/`.

| Suite                 | Files | Tests                                                                 | Time   |
| --------------------- | ----- | --------------------------------------------------------------------- | ------ |
| Unit + component      | 27    | 454                                                                   | ~14 s  |
| End-to-end            | 8     | 109                                                                   | ~4 min |
| Coverage (unit suite) | —     | 96.9 % statements · 94.1 % branches · 96.1 % functions · 97.9 % lines | —      |

## How the suite survives a change

This is the property that matters most, so it is a design rule rather than an accident:

1. **The specs read the app's own data and the app's own functions.** `tests/e2e/app.ts` re-exports
   `ROUTES`, `POINTS_OF_INTEREST`, `filterRoutes`, `filterPointsOfInterest`, `NAV_LINKS`,
   `FOOTER_COLUMNS`, `formatDistance`, `isActiveLink` and the paths, so the expectations are computed
   instead of written down. Add a route and the smoke, overflow, accessibility and detail-page cases
   appear by themselves; change a filter bucket and the facet sweep follows it.
2. **One tripwire per dataset, on purpose.** Only `ROUTES` (8) and `POINTS_OF_INTEREST` (9) are
   asserted as counts, in one test each, because a content change _should_ be acknowledged once. Every
   other check is an invariant (a property, a partition, an ordering) or is derived from the data, so
   it cannot go stale.
3. **Copy is the contract.** User-facing Dutch strings are asserted as they are written in the
   components, so renaming a label fails a test on purpose. The few strings that are repeated across
   specs are the ones a rename will point at.
4. **Tags let the suite be run in slices.** Every e2e group carries one:
   `@smoke` · `@nav` · `@builder` · `@list` · `@poi` · `@route` · `@theme` · `@layout` · `@a11y`.
5. **Nothing is asserted that the environment cannot provide.** The maps key is off in both suites, a
   fake google api covers the API surface the map component uses, and the live tiles are the one thing
   left to the browser by hand.

## How to run

| What                       | Command (from the repo root)                 |
| -------------------------- | -------------------------------------------- |
| Unit + component tests     | `npm --prefix split/split run test`          |
| Watch mode                 | `npm --prefix split/split run test:watch`    |
| Coverage (with thresholds) | `npm --prefix split/split run test:coverage` |
| End-to-end tests           | `npm --prefix split/split run test:e2e`      |
| Everything                 | `npm --prefix split/split run test:all`      |

Playwright's browser is a one-off install: `npm --prefix split/split run test:e2e:install`.

Slices and re-runs, which is what makes the suite cheap to live with day to day:

```bash
npm --prefix split/split run test -- --changed HEAD      # vitest: only what the last commit touched
npm --prefix split/split run test -- tests/unit/routes   # one file (a substring is enough)
npm --prefix split/split run test:watch                  # rerun on save
npm --prefix split/split run test:e2e -- --last-failed   # playwright: only what failed last time
npm --prefix split/split run test:e2e -- --grep @builder # playwright: one tagged group
npm --prefix split/split run test:e2e -- --ui            # playwright: time-travel through a run
```

## The environment the tests run in

1. **The Google Maps key is switched off for the tests.** Playwright starts its own dev server on port
   **4321** (not 5173) with `VITE_GOOGLE_MAPS_API_KEY=""`; Vitest sets the same empty value. Every map
   renders its `MapUnavailable` fallback, and the suite never touches a billed, quota-limited, or
   referrer-restricted API. The fallback _is_ the behaviour under test here — the live maps are checked
   by hand at 5173.
2. **The CDNs are answered locally.** `tests/e2e/fixtures.ts` fulfils every request to
   `fonts.googleapis.com`, `fonts.gstatic.com` and `maps.googleapis.com` with an empty 200, so a slow
   or offline CDN cannot make a test flaky and no console error comes from a failed request.
3. **The same fixture collects console errors and uncaught page errors** and hands them to the test as
   `errors`, so "the page is quiet" is asserted instead of assumed.
4. **jsdom is given the two functions it lacks** (`window.scrollTo`, `Element.scrollIntoView`), and
   `tests/setup.ts` resets `<body>`, `document.title` and `localStorage` before every test.

Motion is left at its own defaults in the browser, so tests that count cards after a filter change
await the list instead of reading it once: a card that leaves a grid stays in the DOM until its fade
has run (`waitFor` in vitest, `toHaveCount` in Playwright).

## A vitest quirk this repo has to live with

The test files use the globals `describe` / `it` / `expect` / `vi` (`test.globals: true`) and never
`import { … } from "vitest"`. With this toolchain an imported copy of the runner cannot see the
running suite, and _every_ file fails with “Vitest failed to find the current suite” the moment test
code runs — the setup file included, which is why `tests/setup.ts` imports nothing from vitest either.
`tests/unit/environment.test.ts` is the canary that keeps this honest.

## What each layer owns

| Layer                        | What it owns                                                                                               | Where                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Data & pure helpers          | the domain rules: filtering, sorting, distances, durations, paths, the area box, the map api's own parsing | `tests/unit/*.test.ts`             |
| Shared components            | one component's markup, props and behaviour                                                                | `tests/unit/components/*.test.tsx` |
| Sections                     | one band/column/card of a page                                                                             | `tests/unit/sections/*.test.tsx`   |
| Pages                        | the composition: route → state → sections                                                                  | `tests/unit/pages/*.test.tsx`      |
| The app                      | the real router, the shell, the scroll behaviour                                                           | `tests/unit/app.test.tsx`          |
| The site as a reader sees it | routing, urls, both palettes, the real browser                                                             | `tests/e2e/*.spec.ts`              |

`tests/unit/fakeMaps.ts` is the fake google api the map tests drive the component with.

## Test cases

### 1. Unit — data and pure helpers

**`format.ts`** — the Dutch decimal, `"1,1 km"`, `"45 min"` / `"2 u"` / `"1 u 09"`, `"4,9"`, `"1.204"`.

**`data/area.ts`** — the corners come from the bounds, the centre is the mean, `isInArea` accepts the
corners and rejects a point just outside each side, `pointsInArea` keeps only what is inside.

**`data/routeGeometry.ts`** — the haversine (0 for a point and itself, symmetric, 111.2 km per degree),
the pace per way of travelling, the 1-minute floor, and `straightRoute`'s street factor, path identity
and empty answer.

**`data/routes.ts`** — the dataset tripwire; then, per route (generated, so a new route adds a case):
places that all resolve and sit inside the area, and a numeric shape the cards can print. Plus the
lookups (`routePoints` drops an unknown id, `routeCoordinates`, `routeStart`), the filters (property
checks over the whole list: the search matches exactly the routes whose haystack contains the needle;
the popularity/theme/difficulty facets equal the data's own selection; the distance buckets are the
documented boundaries and partition the list; facets combine; a nonsense query is empty), the
resting-value check, `getRelatedRoutes` (never itself, never twice, same theme first, then by rating)
and `buildReviewBreakdown` (five buckets, ever-bigger share on five stars, bars that add up).

**`data/pointsOfInterest.ts`** — the dataset tripwire; per place (generated): inside the area and a
card's worth of fields. Then the categories, both eras, the distance derived from the Grote Markt, the
lookup, and the filter (property checks for the query, the categories, and the three sorts whose order
is the documented rule).

**`data/navigation.ts`** — the path constants, the bar's links, the footer's groups, the contact
details and their `tel:` form, and `isActiveLink`'s whole table (exact on home, prefix on a sub-page,
hash ignored).

**`data/directions.ts`** — origin/destination, the waypoints of a longer route, the literal pipes, the
travel mode.

**`data/search.ts`** — first that the index and the content agree in both directions (a record whose
id is gone, and content without a record, are both bugs), then properties over every record: found by
its own title (any case), by a word from the title, by a word from its meta; nothing for nonsense;
only ids of the kind that was asked for.

**`data/maps.ts`** — the five exports, their alt text, their fingerprinted asset path, the pixel size.

**`shared/map/googleMaps.ts`** — the module the app talks to google through, driven by a fake api:
the key and the two switches, the loader (refuses without a key, one script, the api's own query
parameters, the callback that resolves it), a rejected key reaching listeners before and after the
fact, `mapOptions` (centre, zoom, the restriction's bounds built fresh every call, the development map
id until the project has a cloud one, no `strictBounds`), the line colours from the theme token, the
colour scheme from `<body>`, the static map url (one place is a marker, two are a line) and
`requestDirections` (nothing under two places, the api's answer parsed, `WALKING`/`BICYCLING` spelled
the api's way — the measured trap — intermediates kept, the 1-minute floor, no route, a refusal
remembered for the session, and the cache that answers the same question once).

### 2. Unit — shared components

`Icon`, `StarRating` (rounding, filled/muted, the Dutch label), `TextButton`, `EmptyState` (h2 vs h3),
`ClearFiltersButton`, `FilterPanel` (the live count, the reset only when there is something to reset),
`FilterSelect`, `SearchField` (the icon first, as BeerCSS requires), `SectionSearchBar`, `MapLegend`,
`MapChip`, `RouteCard` (title, link, distance/duration, score, chips, the popular badge with its
switch), `RouteGrid`, `RouteShape` (nothing for no points, invalid coordinates dropped, repeats
collapsed, ends drawn bigger, everything inside the box), `MapImage` (size, lazy/eager, decorative),
`MapSnapshot` (the fallback, and the picture path with a stubbed environment — including a failed
image falling back for good), `ThemeToggle` (the stored value, `<body>`, `aria-pressed`), `Breadcrumb`,
`PageTitle`, `Container`, `SectionHeading`, `Navbar` (the links, `aria-current`, the search and
account links, the mobile menu) and `Footer` (the landmark, the groups, the contact details, the year).

### 3. Unit — sections

`RouteFilters` (the search box and four selects in **one row**, with the live count), `RouteResults`
(a page of results, "Toon meer", the empty state), `RouteOverviewCard` (the wide card: title, two-line
description, stars, and the two actions — the title loads the route into the builder, the arrow opens
the dialog), `RouteDialog` (the platform's `<dialog>`: opens, closes, clears on escape, holds the route
detail page's own sections), `RouteShareButton` (the placeholder), `PoiFilters`, `PoiResults`,
`PoiCard`, `PoiPicker`, `RoutePlanSummary` (the hint under two places, the stop list, the three status
lines, the Google Maps link), `RouteFacts`, `RouteStops`, `RouteStory`, `RouteSummary`,
`RatingBreakdown`, `ReviewCard`, `ReviewForm` (the live figure, the step, and a submit that stores
nothing), `RouteReviews` (content only, no band of its own) and `RouteReviewsPanel` (closed on the
average and the count, opened by one button with `aria-expanded`).

### 4. Unit — pages and the app

- `HomePage` — the hero, the slider's default position and its two words, three route cards and five
  place tiles, both search bars (including their empty states), the strip links.
- `RoutesPage` — three urls, one page, rendered through the **real router** (the url is the state, so a
  bare `MemoryRouter` would hand the page no parameters at all): the builder (the picker, the map chip,
  the mode switch, the summary and the estimate, the share action waiting for a second place), the
  ready-made list (a filter narrowing and collapsing it, the reset, a card's title loading that route's
  places and writing them to the url, the bookmark saving and unsaving into `localStorage`, the
  ownership filter narrowing to them), the built-route url (places seeded, an id that does not exist
  ignored, the Google Maps link in visit order), and a route's own url (its title, trail, theme, area,
  the builder seeded from it, a bicycle route opening on a bicycle, the reviews folded away until asked
  for, and an unknown id landing on the 404).
- `PointsOfInterestPage` — the list, a category chip, the search, the three sorts, the reset, the
  selection renaming the map chip, the highlight dropping when the place is filtered away.
- `NotFoundPage` — the default wording, its own wording, the tab title.
- `App` — the **real** router: the pages the paths in `data/navigation.ts` point at, every route's own
  `/routes/public/<id>` page, a route's old `/routes/<id>` url redirected to it, the built-route url, the
  catch-all, the account path (which has no page — pinned), `/planning` redirecting to the builder, and
  `ScrollToTop` in both of its modes (the top, and a hash target).

### 5. End-to-end — the site in a browser

- `smoke.spec.ts` (`@smoke`) — one case **per page derived from the content**: 200, one `h1`, the right
  `document.title`, one `main`, one banner, one footer, no console or page errors; the map fallback and
  no google dom wherever a map is drawn; the builder still computing a route with no key; the shell's
  brand, theme switch and contact band; no broken images.
- `navigation.spec.ts` (`@nav`) — a case **per bar link from `NAV_LINKS`**: it navigates, and then the
  app's own `isActiveLink` decides which links the test expects to carry `aria-current`; the contact
  link scrolling to the footer band; the brand going home; the search shortcut; the account link's
  two entrances landing on the 404 (pinned); the footer's groups and contact details; the mobile menu
  opening, navigating, closing; the 404's own wording for a route that does not exist.
- `theme.spec.ts` (`@theme`) — light by default, the flip, the choice surviving a reload (applied
  during the parse, before the first paint), following the reader across pages, and the palette really
  repainting.
- `routes.spec.ts` (`@builder`, `@list`) — every place in the area is offered as a chip with the right
  era grouping; two places build a route (numbered, summarised, estimated, cleared, shareable by url);
  the mode switch; the facet sweep, which walks **every option of every filter select** (ownership
  included) and compares the cards on screen with what `filterRoutes` says, plus the live count; the
  filters sitting beside the search box; **every card's title loading its places into the builder** and
  its arrow opening the route's own page; the route's own page (title, trail, seeded builder, reviews
  folded out and back, an unknown id on the 404); the share action **copying the route's url** through
  the real clipboard, and staying disabled until there are two places.
- `points-of-interest.spec.ts` (`@poi`) — the count, every category chip (compared with
  `filterPointsOfInterest`), the search on name/area/category, the three sorts compared with the
  module's order, the selection renaming the map chip, the highlight dropping, the reset, the hand-off
  into the builder.
- `responsive.spec.ts` (`@layout`) — no horizontal overflow on **every url the app serves** at 320 /
  390 / 768 / 1024 / 1440 / 1920, in the dark palette too; the footer below the content; no box shadow
  anywhere; **one corner** on every card, chip, field, field control, action and menu of every page
  (read as a computed style, not a baseline); a control beside a field sharing the field control's own
  height, top and bottom; a full-width mobile menu row staying inside its column at 320px.
- `a11y.spec.ts` (`@a11y`) — on **every url**: one `h1`, every image with alt text or hidden, every
  link/button with an accessible name, every field with a label, no duplicate id, heading levels that
  do not skip (the allowance map is empty: the builder's band carries the `h2` the picker's `h3` groups
  need), and the shell's landmarks.

## What is deliberately not covered

| Not covered                                                    | Why, and what covers it instead                                                                                                                                                                                                                                              |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The live Google Maps tiles, the real Places/Routes/Static APIs | They need a key, a billing account and a quota; the automated suite runs without one. `googleMaps.ts`'s logic is covered against a fake api, the component's map-building path against a fake map, and the fallback in both suites. The live map is checked by hand at 5173. |
| Pixel-level appearance                                         | No screenshot baselines: they are device- and font-dependent, and this repo's visual rules (no gradients, no shadows, the one corner, the card ratios, both palettes) are asserted as computed style and DOM invariants instead.                                                             |
| The Express backend                                            | `backend/index.mjs` is a collaborator's stub with no endpoints yet, and it needs MySQL. `docs/BACKEND.md` is the full list of what is still front-of-house only.                                                                                                             |
| Real reduced-motion behaviour                                  | Motion runs at its defaults; the OS preference is a `MotionConfig` feature of the app, not something a test can fake convincingly.                                                                                                                                           |

## Traps the suite encodes (learned while writing it)

| Trap                                                                                                 | What the tests do about it                                                                                                                         |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| A card that leaves a motion grid stays in the DOM until its fade ends.                               | Counts after a list change are awaited: `waitFor` in vitest, `toHaveCount` (which retries) in Playwright.                                          |
| BeerCSS paints a decorative `<span>` over its checkbox, so a click on the input is intercepted.      | The e2e helper clicks the `<label>` that wraps both, which the browser resolves to the control.                                                    |
| Playwright's `getByText` is a _substring_ match.                                                     | Counts and labels are asserted with `{ exact: true }` or scoped to a `.chip` / a `dl` — the map's sr-only description repeats the visible strings. |
| An `evaluate`/`evaluateAll` callback runs **in the browser**, so it cannot see the spec's variables. | The value is handed over as an argument (`evaluateAll(fn, PREFIX)`); a bare closure throws `ReferenceError: … is not defined` at run time.         |
| `toHaveURL` with a regex is matched against the whole url, anchors included.                         | Url patterns are relative strings or unanchored regexes.                                                                                           |
| A fake class named `Map` shadows the global `Map` inside its own body.                               | The fake api's classes are named `StubMap` / `StubPolyline` / `StubBounds` / `StubMarker`.                                                         |
| `m` (motion) components need `LazyMotion`; `Link` needs a router.                                    | `tests/unit/motionProvider.tsx` and the `renderWithMotion` / `renderWithRouter` helpers.                                                           |
| jsdom has no `matchMedia`, no persistent `<body>` class, and neither scroll function.                | `tests/setup.ts` stubs all four.                                                                                                                   |
| jest-dom's `toBeCloseTo(x, digits)` takes digits, not a tolerance; `(2.65).toFixed(1)` is `"2.6"`.   | The geometry tests use bounds and digits, never a tolerance.                                                                                       |

## Changing things — what happens when you do

| You change…                                | What follows, and what to look at                                                                                                                                                                                                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A route or a place** (add, remove, edit) | Nothing has to be edited: the generated unit cases, the smoke/overflow/a11y cases and the builder/filter sweeps all read the data. The two dataset tripwires (`8` routes, `9` places) are the only numbers to update, and `searchIndex.json` must gain or lose the matching record or `search.test.ts` fails on purpose. |
| **A page or a url**                        | Add it to `src/data/navigation.ts` and it is covered by the smoke, overflow and a11y sweeps; the bar-link cases come from `NAV_LINKS`; the page's own `h1`/title wording is in `STATIC_PAGES` (one line).                                                                                                                |
| **A new filter, option or bucket**         | The facet sweep walks whatever the select offers and compares against `filterRoutes`, so a new theme, difficulty or distance bucket is exercised without a test edit. A new _facet_ needs one entry in the sweep's list.                                                                                                 |
| **A route's own page, a new section**      | The per-route detail cases are generated from `ROUTES`; a new section on a page needs its own section test and, if it renders text a reader reads, a line in the page test.                                                                                                                                              |
| **UI copy**                                | Expect a failing assertion naming the string, and update the string in the test — that is the intent. Repeated labels live in one spec each, so it is one edit per string.                                                                                                                                               |
| **A design token or a class recipe**       | `docs/DESIGN.md` is the source of truth and the tests assert behaviour (no shadow, no overflow, contrast-light invariants) rather than token values.                                                                                                                                                                     |
| **A file moves**                           | Only the import path in the test changes; nothing else depends on the layout.                                                                                                                                                                                                                                            |
| **A new dependency**                       | The stack is closed (UI dependencies), so a new runtime package is a decision, not a test change. Dev-only test tooling is already in place.                                                                                                                                                                             |
| **Google's api surface**                   | `src/googleMaps.d.ts` (the hand-written types), `tests/unit/fakeMaps.ts` (the fake the map is driven with) and `tests/unit/googleMaps.test.ts` (the parsing) all mirror it; the fake is what tells you what the app really touches.                                                                                      |

## Findings (things the suite documents as current behaviour)

| #   | Finding                                                                                                                                          | Test that pins it                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| 1   | `/inloggen` has **no route** in `App.tsx`, so the navbar avatar and the footer's Account column both land on the 404 page.                       | `app.test.tsx`, `navigation.spec.ts`           |
| 2   | The share button copies the route's url and nothing more: there is no stored route behind it, so the link stops working if the places change.    | `routeShareButton.test.tsx`, `routes.spec.ts`  |
| 3   | `RatingBreakdown` prints `"1 beoordelingen"` for a single review (no singular form).                                                             | `ratingBreakdown.test.tsx`                     |
| 4   | `ReviewForm` only prevents the default: a submitted review is not stored anywhere.                                                               | `reviewForm.test.tsx`, `routeReviews.test.tsx` |
| 5   | The strips and the results list show a slice (3 / 5 / 6) while the live count reports every match.                                               | `homePage.test.tsx`, `routes.spec.ts`          |
| 6   | The results list collapses when a filter changes, so "Toon meer" cannot leave the reader on a list nobody asked for.                             | `routesPage.test.tsx`, `routes.spec.ts`        |
| 7   | A saved route lives only in this browser (`localStorage`), so it does not follow the reader anywhere. `docs/BACKEND.md` lists what is behind it. | `routes.test.tsx`, `routes.spec.ts`            |
