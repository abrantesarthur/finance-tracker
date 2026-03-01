# Plan 2 — Categories API & UI

## Goal
Implement the full budget categories feature: backend API endpoints and a frontend Categories tab with a list and add form.

## Preconditions
After Plan 1, the following is already in place:
- Monorepo with `server/` and `web/` workspaces, runnable via `bun run dev`.
- Elysia server on port 3000 with CORS enabled, health check at `GET /`.
- Drizzle ORM configured with SQLite (`finance.db`), schema in `server/src/db/schema.ts` with `budget_categories` and `transactions` tables.
- Drizzle db instance exported from `server/src/db/index.ts`.
- React + Vite frontend on port 5173 with Tailwind CSS configured.
- `web/src/App.tsx` exists with minimal content.
- `init.sh` script at the project root.

## Bootstrap
**Before doing anything else**, run `bash init.sh` from the project root to install dependencies, push the DB schema, and start the dev servers. Wait for it to complete successfully. All subsequent work assumes both servers are running.

## Tasks

### 1. Server — Categories routes
- Create `server/src/routes/categories.ts` exporting an Elysia plugin/group with:
  - `GET /categories` — returns all categories sorted alphabetically by name. Response: `{ categories: Array<{ id, name, created_at }> }`.
  - `POST /categories` — accepts `{ name: string }` in the body. Inserts into `budget_categories`. Returns the created category. If the name already exists, return a 409 with `{ error: "Category already exists" }`.
- Register the categories routes in `server/src/index.ts`.

### 2. Frontend — App layout with tabs
- Refactor `web/src/App.tsx` to render:
  - A **top bar** with the text "Finance Tracker" on the left. Styled: white background, subtle bottom border, padding.
  - A **tab bar** with two tabs: "Transactions" and "Categories". Use local React state to track the active tab. Active tab gets an indigo underline/highlight.
  - A **content area** that renders the active tab's component.
- For now, the Transactions tab can render a placeholder: `<div>Transactions — coming soon</div>`.

### 3. Frontend — Categories tab
- Create `web/src/components/CategoriesTab.tsx`:
  - On mount, fetch `GET http://localhost:3000/categories` and store in state.
  - Render a **"+ Add Category" button** (top right, indigo/accent).
  - Render a **table** with columns: Name, Created At.
    - Created At formatted as a readable date string.
    - Sorted alphabetically by name.
    - Rows have subtle hover highlight.
  - **Empty state**: if no categories, show centered text "No categories yet".
  - Clicking "+ Add Category" shows an **inline form** (above the table or as a modal):
    - Name text input (auto-focused).
    - "Save" button (indigo) and "Cancel" button (gray outline).
    - On save: POST to `/categories`, on success close form and refresh list.
    - On 409 (duplicate): show inline red error text "Category already exists".
    - On other error: show generic inline error.

### 4. Styling
- Apply the design principles from the spec:
  - System font stack, neutral palette, whitespace-heavy.
  - Buttons: primary (indigo bg, white text), secondary (gray border, gray text).
  - Table: clean borders, rounded container, hover rows.
  - Inputs: bordered, rounded, consistent padding.
- All styling via Tailwind utility classes.

## Acceptance Checks

**All of the following checks MUST pass before this plan is considered complete. If any check fails, debug and fix the issue, then re-run the failing checks. Repeat until every check passes.**

### Check 1 — Categories API: create
Run `curl -X POST http://localhost:3000/categories -H "Content-Type: application/json" -d '{"name":"Groceries"}'`. The response must return the created category with an `id`, `name` of "Groceries", and a `created_at` timestamp.

### Check 2 — Categories API: duplicate rejection
Run the same POST again with `{"name":"Groceries"}`. The response must be HTTP 409 with body containing `"Category already exists"`.

### Check 3 — Categories API: list
Run `curl http://localhost:3000/categories`. The response must include a `categories` array containing the "Groceries" entry.

### Check 4 — UI: Tab layout
Use **Puppeteer MCP tools**:
1. `puppeteer_navigate` to `http://localhost:5173`.
2. `puppeteer_screenshot` — confirm the top bar shows "Finance Tracker" and two tabs ("Transactions", "Categories") are visible.

### Check 5 — UI: Categories empty state
1. Delete `server/finance.db` and re-run `bash init.sh` (or clear the categories table) to start fresh.
2. `puppeteer_navigate` to `http://localhost:5173`.
3. `puppeteer_click` the "Categories" tab.
4. `puppeteer_screenshot` — confirm the text "No categories yet" is visible.

### Check 6 — UI: Add category end-to-end
1. `puppeteer_click` the "+ Add Category" button.
2. `puppeteer_screenshot` — confirm the form is visible with a name input.
3. `puppeteer_fill` the name input with "Groceries".
4. `puppeteer_click` the "Save" button.
5. `puppeteer_screenshot` — confirm the form is gone and "Groceries" appears in the table.

### Check 7 — UI: Duplicate error
1. `puppeteer_click` "+ Add Category" again.
2. `puppeteer_fill` the name input with "Groceries".
3. `puppeteer_click` "Save".
4. `puppeteer_screenshot` — confirm an inline error "Category already exists" is visible.

### Check 8 — UI: Transactions placeholder
1. `puppeteer_click` the "Transactions" tab.
2. `puppeteer_screenshot` — confirm placeholder text is visible (e.g. "coming soon").

## Commit
Once ALL acceptance checks pass, create a git commit with a message like "add categories API and UI with tab layout". Stage only the files changed or added in this plan.
