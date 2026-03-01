# Finance Tracker

Personal finance tracker — single-user, localhost-only, SQLite-backed. Manages transactions, budget categories, and spending analytics.

## Stack

- **Runtime**: Bun
- **Backend**: Elysia (TypeScript), port 3000
- **Frontend**: React + Vite, port 5173
- **Database**: SQLite via Drizzle ORM
- **Monorepo**: Bun workspaces (`server/`, `web/`)

## Setup

- Run `./init.sh` at the start of a session to install deps, push the DB schema, and start both dev servers (backend :3000, frontend :5173). It blocks while servers run.

## Commands

- `bun run dev` — start both servers
- `bun run dev:server` / `bun run dev:web` — start individually

## Dev Servers

- When running `bun run dev` (or `./init.sh`) as a background task, **always stop it** (via `TaskStop`) once validation is complete. Never leave dev servers running after finishing a task.

## Validation

- Every plan that touches the frontend **must** include validation steps (at least 2 and ideally more than 5)
- These palsn should instruct using Puppeteer mcp server to verify changes.
- Keep iterating until any issues are addressed and all validation checks pass

## Commits

- Start the subject line with a lowercase verb (e.g., `add`, `fix`, `refactor`, `replace`)
- Follow with a short summary on the first line
- Add a blank line then bullet points describing the key changes

## Design System

- Use **shadcn/ui** (`@shadcn` registry) for all UI work.
- Only build custom components if no shadcn component fits the need.
- Reference specific shadcn blocks/examples as starting points (e.g., `chart-area-interactive`).
- Use shadcn primitives for layout and interaction: `card` for containers, `table` for lists, `dialog` for modals, `tabs`/`select` for navigation, `field` for form layout.
