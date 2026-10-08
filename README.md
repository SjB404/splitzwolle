# splitzwolle

Zwolle Routes — a Dutch route planner for walking and cycling through Zwolle, with a historic
map layer beside the present-day map.

## Start here

| I want to… | Read |
| --- | --- |
| Build or change UI | [`docs/DESIGN.md`](docs/DESIGN.md) — the design system |
| Know the project rules | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) |
| See the frontend rules auto-applied to my files | [`.github/instructions/frontend.instructions.md`](.github/instructions/frontend.instructions.md) |

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

