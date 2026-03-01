# Plan 4 — Transactions UI

## Goal
Build the full Transactions tab frontend: transaction list with filters, add transaction form, and delete with confirmation.

## Preconditions
After Plans 1–3, the following is already in place:
- Monorepo running via `bun run dev` (server on 3000, web on 5173).
- Backend API fully implemented:
  - `GET /` — health check
  - `GET /categories`, `POST /categories`
  - `GET /transactions` (with query params: `start_date`, `end_date`, `category_id`, `type`), `POST /transactions`, `DELETE /transactions/:id`
- Transactions response includes `category_name` via join.
- Frontend (`web/src/App.tsx`) has a tab layout with top bar, tab bar ("Transactions" and "Categories"), and content area. Active tab tracked in React state.
- Categories tab (`web/src/components/CategoriesTab.tsx`) is fully built — list, add form, error handling.
- Tailwind CSS configured. Design uses: system font stack, indigo accent, neutral palette, rounded inputs/cards, hover-highlighted table rows.
- `init.sh` script at the project root.

## Bootstrap
**Before doing anything else**, run `bash init.sh` from the project root to install dependencies, push the DB schema, and start the dev servers. Wait for it to complete successfully. All subsequent work assumes both servers are running.

Then, seed test data so the UI can be verified against real content:
```bash
curl -s -X POST http://localhost:3000/categories -H "Content-Type: application/json" -d '{"name":"Food"}'
curl -s -X POST http://localhost:3000/categories -H "Content-Type: application/json" -d '{"name":"Transport"}'
```
Note the category IDs from the responses for use in later checks.

## Tasks

### 1. Transaction list component
- Create `web/src/components/TransactionsTab.tsx`.
- On mount, fetch `GET http://localhost:3000/transactions` and store in state.
- Render a **table** with columns: Date, Description, Amount, Category, Payment Method, Type, Actions.
  - **Date**: formatted as readable date (e.g. "Feb 28, 2026").
  - **Amount**: currency formatted (e.g. "$1,234.56"). Green text for positive, red for negative.
  - **Category**: display `category_name`.
  - **Type**: rendered as a small pill/badge. Use a subtle background color (e.g. light indigo for subscription, light gray for discretionary).
  - **Actions**: a trash/delete icon button. Gray by default, red on hover.
- Sorted by date descending (server already does this).
- **Empty state**: centered text "No transactions yet. Add one to get started."

### 2. Filter bar
- Render a filter bar **above the table** with:
  - **Start date** — `<input type="date">` labeled "From".
  - **End date** — `<input type="date">` labeled "To".
  - **Category** — `<select>` dropdown, populated by fetching `GET /categories` on mount. First option: "All Categories" (value empty).
  - **Type** — `<select>` dropdown with options: "All Types", "Subscription", "Discretionary".
  - **"Clear filters"** — a text link/button that resets all filter values.
- When any filter changes, re-fetch transactions with the appropriate query params appended.
- Styled in a horizontal row, wrapped on smaller screens. Subtle background (e.g. gray-50), rounded container, consistent padding.

### 3. Add transaction form
- A **"+ Add Transaction" button** at the top right of the tab (indigo, same style as Categories).
- Clicking it reveals an inline form (or modal) with fields:
  - Description — text input (required).
  - Date — date input, defaulting to today's date.
  - Amount — number input (required). Allow negatives.
  - Payment Method — text input (required). Placeholder: e.g. "Credit Card, Pix, Cash".
  - Category — dropdown populated from `GET /categories` (required).
  - Type — two radio buttons or a toggle: "Subscription" and "Discretionary". Default to "Discretionary".
- **"Save" button** (indigo) and **"Cancel" button** (gray outline).
- On save: `POST /transactions` with the form data. On success, close the form and re-fetch the transaction list (respecting current filters).
- On error: display the error message inline below the form in red.

### 4. Delete with confirmation
- Clicking the delete button on a transaction row opens a **confirmation dialog** (a small centered modal with backdrop).
  - Text: "Are you sure you want to delete this transaction?"
  - Shows the transaction description and amount for context.
  - **"Delete" button** (red) and **"Cancel" button** (gray).
- On confirm: `DELETE /transactions/:id`. On success, re-fetch the transaction list. On error, show an inline error.

### 5. Wire into App
- Replace the Transactions tab placeholder in `App.tsx` with the `TransactionsTab` component.
- Transactions tab should be the default active tab.

## Acceptance Checks

**All of the following checks MUST pass before this plan is considered complete. If any check fails, debug and fix the issue, then re-run the failing checks. Repeat until every check passes.**

Use the **Puppeteer MCP tools** (available via `.mcp.json` in the project root) for all UI checks.

### Check 1 — Empty state
1. `puppeteer_navigate` to `http://localhost:5173`.
2. The Transactions tab must be the default active tab.
3. `puppeteer_screenshot` — must show "No transactions yet" (or similar empty state message). Must NOT show the old placeholder text.

### Check 2 — Add a transaction (negative amount)
1. `puppeteer_click` the "+ Add Transaction" button.
2. `puppeteer_screenshot` — the form must be visible with all fields (Description, Date, Amount, Payment Method, Category dropdown, Type selector).
3. `puppeteer_fill` the fields: Description = "Lunch", Amount = "-25", Payment Method = "Credit Card". `puppeteer_select` a category and type "Discretionary". Set the date.
4. `puppeteer_click` "Save".
5. `puppeteer_screenshot` — the form must be closed. The transaction "Lunch" must appear in the table. The amount must be displayed in **red** (negative).

### Check 3 — Add a second transaction (positive amount, subscription)
1. Add another transaction: Description = "Salary", Amount = "3000", Payment Method = "Bank Transfer", Type = "Subscription".
2. `puppeteer_screenshot` — "Salary" must appear in the table. The amount must be displayed in **green** (positive). The type pill must show "subscription".

### Check 4 — Filter by type
1. `puppeteer_select` the Type filter dropdown to "Subscription".
2. `puppeteer_screenshot` — only the "Salary" transaction must be visible. "Lunch" must NOT be visible.
3. Click "Clear filters" (or reset the dropdown).
4. `puppeteer_screenshot` — both transactions must be visible again.

### Check 5 — Filter by category
1. `puppeteer_select` the Category filter dropdown to one of the seeded categories.
2. `puppeteer_screenshot` — only transactions matching that category must be shown.

### Check 6 — Delete with confirmation
1. `puppeteer_click` the delete button on the "Lunch" transaction.
2. `puppeteer_screenshot` — a confirmation dialog must be visible, showing the transaction description and amount.
3. `puppeteer_click` the "Delete" button in the dialog.
4. `puppeteer_screenshot` — the dialog must be gone. "Lunch" must no longer appear in the table. "Salary" must still be present.

### Check 7 — Cross-tab navigation
1. `puppeteer_click` the "Categories" tab.
2. `puppeteer_screenshot` — the Categories tab must render correctly (table with categories visible).
3. `puppeteer_click` the "Transactions" tab.
4. `puppeteer_screenshot` — the Transactions tab must render correctly with the remaining transaction(s).

### Check 8 — Categories tab still works
1. While on the Categories tab, `puppeteer_click` "+ Add Category", fill a new name, click "Save".
2. `puppeteer_screenshot` — the new category must appear in the list. This confirms Plan 2's work wasn't broken.

## Commit
Once ALL acceptance checks pass, create a git commit with a message like "add transactions UI with filters, forms, and delete confirmation". Stage only the files changed or added in this plan.
