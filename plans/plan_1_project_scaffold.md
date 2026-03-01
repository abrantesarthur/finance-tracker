# Plan 1 — Project Scaffold & Health Check

## Goal
Set up the monorepo structure, install all dependencies, configure the database layer, and deliver a working health check endpoint with a minimal frontend that proves end-to-end connectivity.

## Preconditions
- Bun is installed on the machine.
- The directory `/Users/arthurabrantes/Documents/projects/finance-tracker` exists and may contain spec/plan files — do not delete them.

## Tasks

### 1. Root monorepo setup
- Create `package.json` at the root with:
  - `"name": "finance-tracker"`
  - `"workspaces": ["server", "web"]`
  - Scripts: `"dev:server"`, `"dev:web"`, `"dev"` (runs both concurrently via `bun run --filter`)
- Create `tsconfig.json` with strict TypeScript config, targeting ESNext.

### 2. Server workspace (`server/`)
- `server/package.json` with dependencies: `elysia`, `drizzle-orm`, `better-sqlite3`, `drizzle-kit`.
- `server/tsconfig.json`.
- `server/src/index.ts` — Elysia app on port 3000 with CORS enabled for `http://localhost:5173`.
  - `GET /` returns `{ status: "ok" }`.
- `server/src/db/schema.ts` — Drizzle schema with both tables defined:
  - `budget_categories`: id (integer PK autoincrement), name (text, unique, not null), created_at (text, default ISO now).
  - `transactions`: id (integer PK autoincrement), description (text, not null), date (text, not null), amount (real, not null), payment_method (text, not null), category_id (integer, FK → budget_categories.id), type (text, not null), created_at (text, default ISO now).
- `server/src/db/index.ts` — creates the SQLite connection (`finance.db` in server root) and exports the Drizzle db instance.
- `server/src/db/migrate.ts` — a script that pushes the schema to the database (use `drizzle-kit push`).
- `server/drizzle.config.ts` — Drizzle Kit config pointing at the schema and db file.
- Add a `"db:push"` script to `server/package.json` that runs schema push.

### 3. Web workspace (`web/`)
- Scaffold with `bun create vite web --template react-ts` (or equivalent manual setup).
- Install Tailwind CSS v4 and configure it.
- `web/src/App.tsx` — minimal page that fetches `GET http://localhost:3000/` and displays the status.
- Clean up default Vite boilerplate (remove default CSS, logos, counter app).

### 4. Create `init.sh`
Create `init.sh` in the project root. This script is used by all future plans to bootstrap the app. It must:
1. Run `bun install` at the project root.
2. Push the database schema (`bun run --filter server db:push`).
3. Start the dev servers in the background (`bun run dev &`).
4. Wait until both `http://localhost:3000` and `http://localhost:5173` are responding (poll with curl, timeout after 30 seconds, exit 1 on failure).
5. Print a success message when both are up.

The script should be idempotent — safe to run even if `node_modules` already exists or the DB is already created. Make it executable (`chmod +x`).

### 5. Initialize git
- Run `git init` in the project root.
- Create a `.gitignore` that excludes `node_modules/`, `*.db`, `dist/`, `.env`, and other standard entries.

## Acceptance Checks

**All of the following checks MUST pass before this plan is considered complete. If any check fails, debug and fix the issue, then re-run the failing checks. Repeat until every check passes.**

### Check 1 — `init.sh` runs without errors
Run `bash init.sh` from the project root. It must exit 0 and print a success message. Both `http://localhost:3000` and `http://localhost:5173` must be reachable.

### Check 2 — Health check API
Run `curl http://localhost:3000/`. The response must be `{"status":"ok"}` (or equivalent JSON with status "ok").

### Check 3 — Database exists with correct tables
Run `sqlite3 server/finance.db ".tables"`. The output must list both `budget_categories` and `transactions`.

### Check 4 — Frontend renders health check
Use the **Puppeteer MCP tools** (available via `.mcp.json` in the project root):
1. `puppeteer_navigate` to `http://localhost:5173`.
2. `puppeteer_screenshot` — the page must show the health check status text ("ok" or similar). It must NOT be a blank page, an error page, or the default Vite template.

## Commit
Once ALL acceptance checks pass, create a git commit with a clear message summarizing what was done (e.g. "scaffold monorepo with health check, DB schema, and init script"). Stage all relevant files — do NOT commit `node_modules/`, `*.db`, or `dist/`.
