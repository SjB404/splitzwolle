# Zwolle Routes

A Dutch web app for walking and cycling routes through Zwolle. You can compare a map of Zwolle from
1652 with today's satellite view, browse popular routes and points of interest, and build your own
route by picking places on a map. The route you build lives in the URL, so you can share it as a link.

The site itself is in Dutch; the code and comments are in English.

## Features

- **Then and now**: drag the slider on the home page (or tap *Toen* / *Nu*) to fade between the
  1652 map and a current satellite photo.
- **Routes**: filter and search the route list, save routes (stored in your browser), read and
  write reviews.
- **Route builder**: pick places on the map; the app plans a walking or cycling route between them
  with the Google Routes API, and the URL updates with every pick
  (`/routes/custom/peperbus,sassenpoort`).
- **Points of interest**: every place on a map, with filters by category and era.
- **Accounts and contact**: register and log in (email/password or Google), and a contact form.
- **Light and dark theme**, remembered between visits.

## Tech stack

| Part | Used |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router |
| Styling | BeerCSS (Material 3 components) + Tailwind CSS 4 |
| Animation | Motion (`motion/react`) |
| Maps | Google Maps JavaScript API (Places + Routes) |
| Backend | Express 5, MySQL (`mysql2`), JWT auth, bcrypt, Google OAuth |
| Tests | Vitest + Testing Library (unit), Playwright (end-to-end), Supertest (API) |

## Getting started

The app lives in the `split/` folder. Either `cd split` and run the commands as `npm run …`, or
run them from the repo root with `--prefix split` like below.

```bash
npm --prefix split install
npm --prefix split run dev          # frontend on http://localhost:5173
```

The maps need a Google Maps API key. Copy `split/.env.example` to `split/.env.local` and fill in
`VITE_GOOGLE_MAPS_API_KEY`. Without a key the site still works: every map is replaced by a drawn
fallback.

The backend needs a MySQL database (defaults: `localhost`, user `root`, no password, database
`swolla`; override them in the env file):

```bash
npm --prefix split run dev:server   # api on http://localhost:3000
```

Other commands:

```bash
npm --prefix split run build        # typecheck + production build
npm --prefix split run preview      # serve the production build
npm --prefix split run lint         # oxlint
```

## How it works

### Frontend (`split/src`)

- **`main.tsx`** starts the app, **`App.tsx`** maps URLs to pages and wraps every page in the same
  top bar and footer.
- **`pages/`** has one file per page. A page owns the state its parts share (filters, the picked
  places) and lays out components in order.
- **`components/`** holds the building blocks (navbar, hero, cards, filters, the map), one per file.
- **`data/`** holds the content (routes, places, images) and the logic: the Google Maps loader and
  API calls, the search, URL helpers in `navigation.ts`, and the saved routes in `localStorage`.
- **`types.ts`** describes the shape of a route, a place and the filters.
- **`data/api.ts`** is the one fetch helper for the backend; `session.ts` (who is logged in) and
  `reviews.ts` (load and post reviews) use it. If the API isn't running, the reviews fall back to
  sample reviews so the page still has content.

**Styling.** BeerCSS provides the Material 3 components (buttons, fields, chips, cards, the
slider); Tailwind handles layout and spacing. `index.css` defines the whole colour palette from two
brand colours (Deltion orange and blue) and a light and dark version of every colour role. The
theme is a `light` or `dark` class on `<body>`; components never check the theme themselves.

**Maps.** The home page map is two images on top of each other: the slider sets the opacity of
the 1652 map. Every other map is Google Maps, drawn by `components/areaMap.tsx`. Place coordinates
come from the Places API, and route lines from the Routes API. If an API call fails, the app falls
back to its own straight-line estimate instead of breaking.

**Route builder.** `/routes/custom/<place-ids>` is the state: the page reads the picked places from
the URL and writes the URL back on every pick, so refreshing or sharing the link gives the same
route. `usePlannedRoute.ts` asks Google for the route between the picked places.

**Animations.** Short (120–200ms) and only where something changes state: the mobile menu folds
down, panels fold open and shut, cards slide into place when you filter, the slider glides when you
tap *Toen* / *Nu*. The timings are in `motion.ts`. They also play when the operating system has
"reduce motion" turned on, on purpose.

### Backend (`split/backend`)

An Express API mounted at `/api`:

| Route | Does |
| --- | --- |
| `/api/auth` | login, logout, `/auth/me` (who is logged in, used by the navbar), Google sign-in |
| `/api/users/register` | create an account |
| `/api/contact` | store a contact form message |
| `/api/reviews` | route reviews: `GET /reviews/view?routeID=…` and `POST /reviews` (logged in) |
| `/api/admin/users` | user management for admins (built and tested, not used yet) |

`db.ts` creates the MySQL connection pool, and `middleware/userAuthenticator.ts` checks the JWT on
protected routes. All settings come from environment variables (see `split/.env.example`).

## Tests

```bash
npm --prefix split run test          # unit + component tests (vitest)
npm --prefix split run test:backend  # api tests, with a stubbed database
npm --prefix split run test:e2e      # browser tests (playwright; run test:e2e:install once first)
npm --prefix split run test:all      # all three
```

- `split/tests/unit/`: data helpers, components and pages, rendered with Testing Library.
- `split/tests/e2e/`: the real site in Chromium (navigation, the builder, layout at every width,
  accessibility, the theme switch). It starts its own dev server with the maps key turned off.
- `split/backend/routes/tests/`: every API route against a fake database.

## Project structure

```
split/
├── src/
│   ├── App.tsx, main.tsx, index.css, motion.ts, types.ts
│   ├── pages/          one file per page
│   ├── components/     all components, one per file
│   ├── data/           content, Google Maps calls, search, url helpers
│   └── assets/         map images and place photos (WebP)
├── backend/            Express API
├── tests/              unit and e2e tests
└── .env.example        every setting the app and api read
```
