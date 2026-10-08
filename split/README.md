# Zwolle Routes — frontend

The Vite + React app behind **Zwolle Routes**, a Dutch walking-and-cycling route planner for
Zwolle with a historic map layer beside the present-day map. The app, its data, its tests and the
Express API all live in this folder.

## Scripts

| Task                    | Command                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| Dev server              | `npm run dev` — http://localhost:5173                               |
| Production build        | `npm run build` (`tsc -b` + Vite)                                   |
| Lint                    | `npm run lint` (oxlint)                                             |
| Preview the build       | `npm run preview`                                                   |
| API dev server          | `npm run dev:server` — http://localhost:3000 (talks to MySQL)       |
| Unit + component tests  | `npm run test`                                                      |
| Coverage                | `npm run test:coverage`                                             |
| API tests               | `npm run test:backend`                                              |
| End-to-end tests        | `npm run test:e2e` (one-off `npm run test:e2e:install`)             |
| Everything              | `npm run test:all`                                                  |

From the repo root, prefix every command with `--prefix split` (see the root README).

## Where to look

- `src/` — one `pages/` file per route, one flat `components/` folder, `data/` for content and logic
- `backend/` — the Express API, mounted at `/api`
- `tests/unit/`, `tests/e2e/`, `backend/routes/tests/` — the three suites

Read [`../docs/DESIGN.md`](../docs/DESIGN.md) before touching UI; the root
[`README.md`](../README.md) points at the rest of the documentation
(`PROJECT-MAP.md`, `TESTPLAN.md`, `BACKEND.md`).
