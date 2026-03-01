# Finance Tracker

Personal finance tracker — single-user, localhost-only, SQLite-backed. Manages transactions, budget categories, and spending analytics.

## Stack

- **Runtime**: Bun
- **Backend**: Elysia (TypeScript), port 3000
- **Frontend**: React + Vite, port 5173
- **Database**: SQLite via Drizzle ORM
- **Monorepo**: Bun workspaces (`server/`, `web/`)

## Commands

- `bun run dev` — start both servers
- `bun run dev:server` / `bun run dev:web` — start individually

## Design System

- Use **shadcn/ui** (`@shadcn` registry) for all UI work.
- Only build custom components if no shadcn component fits the need.
- Reference specific shadcn blocks/examples as starting points (e.g., `chart-area-interactive`).
- Use shadcn primitives for layout and interaction: `card` for containers, `table` for lists, `dialog` for modals, `tabs`/`select` for navigation, `field` for form layout.
