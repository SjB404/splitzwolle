# Zwolle Routes — app

The frontend, the Express API and the tests for **Zwolle Routes**. See the
[README in the repo root](../README.md) for what the app does and how it works.

## Scripts

Run these from this folder (or from the repo root with `--prefix split`).

| Task                   | Command                                                   |
| ---------------------- | --------------------------------------------------------- |
| Dev server             | `npm run dev` — http://localhost:5173                     |
| Production build       | `npm run build` (typecheck + Vite)                        |
| Preview the build      | `npm run preview`                                         |
| Lint                   | `npm run lint` (oxlint)                                   |
| API dev server         | `npm run dev:server` — http://localhost:3000 (needs MySQL) |
| Unit + component tests | `npm run test`                                            |
| Coverage               | `npm run test:coverage`                                   |
| API tests              | `npm run test:backend`                                    |
| End-to-end tests       | `npm run test:e2e` (run `npm run test:e2e:install` once)  |
| Everything             | `npm run test:all`                                        |

## Setup

Copy `.env.example` to `.env.local` and add a Google Maps API key. Without one the maps show a
fallback, and everything else works.

## Where to look

- `src/`: `pages/` (one per route), `components/` (one flat folder), `data/` (content and logic)
- `backend/`: the Express API, mounted at `/api`
- `tests/unit/`, `tests/e2e/`, `backend/routes/tests/`: the three test suites
