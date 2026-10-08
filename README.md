# splitzwolle

Zwolle Routes — a Dutch route planner for walking and cycling through Zwolle, with a historic
map layer beside the present-day map.

## Start here

| I want to… | Read |
| --- | --- |
| Build or change UI | [`docs/DESIGN.md`](docs/DESIGN.md) — the design system |
| Understand how the repo is wired | [`docs/PROJECT-MAP.md`](docs/PROJECT-MAP.md) |
| Know the project rules | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) |
| See the frontend rules auto-applied to my files | [`.github/instructions/frontend.instructions.md`](.github/instructions/frontend.instructions.md) |
| See what the server does | [`docs/BACKEND.md`](docs/BACKEND.md) |
| See how a change is verified | [`docs/TESTPLAN.md`](docs/TESTPLAN.md) |

**`docs/DESIGN.md` is the single source of truth for anything visual** — colors, type,
spacing, component recipes, motion, accessibility, and copy. Update it there first, then in code.

## Quick start

The Vite project lives in the `split/` folder, so run commands from the repo root
with `--prefix`:

```bash
npm --prefix split install
npm --prefix split run dev      # http://localhost:5173
npm --prefix split run build
npm --prefix split run lint
```

The Express API lives in `split/backend/` and talks to MySQL
(host, user, password and database default to `localhost` / `root` / `""` / `swolla`;
the overrides and the Google OAuth keys are in `split/.env.example`):

```bash
npm --prefix split run dev:server   # http://localhost:3000
```

## Tests

```bash
npm --prefix split run test         # unit + component (vitest)
npm --prefix split run test:backend # the api's own suite
npm --prefix split run test:e2e     # browser (playwright; one-off test:e2e:install)
npm --prefix split run test:all     # all three
```

The backend suite runs on a stubbed database with no env file, and the e2e suite starts its own
dev server with the maps key switched off — see `docs/TESTPLAN.md` for what each layer owns.

