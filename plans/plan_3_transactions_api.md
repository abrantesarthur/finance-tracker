# Plan 3 — Transactions API

## Goal
Implement the full transactions backend: create, delete, and list (with filtering).

## Preconditions
After Plans 1–2, the following is already in place:
- Monorepo running via `bun run dev` (server on 3000, web on 5173).
- Elysia server with CORS, health check, and categories routes (`GET /categories`, `POST /categories`) in `server/src/routes/categories.ts`.
- Routes registered in `server/src/index.ts`.
- Drizzle schema in `server/src/db/schema.ts` with `budget_categories` and `transactions` tables. DB instance in `server/src/db/index.ts`.
- Frontend has tab layout (Transactions tab renders a placeholder, Categories tab is functional).
- `init.sh` script at the project root.

## Bootstrap
**Before doing anything else**, run `bash init.sh` from the project root to install dependencies, push the DB schema, and start the dev servers. Wait for it to complete successfully. All subsequent work assumes the server is running.

## Tasks

### 1. Server — Transactions routes
- Create `server/src/routes/transactions.ts` exporting an Elysia plugin/group with:

#### `POST /transactions`
- Accepts JSON body:
  ```ts
  {
    description: string
    date: string       // ISO date, e.g. "2026-02-28"
    amount: number
    payment_method: string
    category_id: number
    type: "subscription" | "discretionary"
  }
  ```
- Validates that all fields are present and non-empty. Returns 400 with `{ error: "..." }` on validation failure.
- Validates that `category_id` references an existing category. Returns 400 if not found.
- Validates that `type` is one of the two allowed values. Returns 400 if invalid.
- Inserts into `transactions` table. Returns the created transaction (201).

#### `DELETE /transactions/:id`
- Deletes the transaction with the given ID.
- If the ID doesn't exist, returns 404 with `{ error: "Transaction not found" }`.
- On success, returns `{ success: true }`.

#### `GET /transactions`
- Returns all transactions joined with their category name.
- Response shape: `{ transactions: Array<{ id, description, date, amount, payment_method, category_id, category_name, type, created_at }> }`.
- Sorted by date descending, then by created_at descending.
- Supports optional query parameters for filtering:
  - `start_date` (string, ISO date) — include transactions on or after this date.
  - `end_date` (string, ISO date) — include transactions on or before this date.
  - `category_id` (number) — filter by category.
  - `type` (string) — filter by `subscription` or `discretionary`.
- Filters are AND-combined. Omitted filters are ignored.

### 2. Register routes
- Import and register the transactions routes in `server/src/index.ts`, same pattern as categories.

## Acceptance Checks

**All of the following checks MUST pass before this plan is considered complete. If any check fails, debug and fix the issue, then re-run the failing checks. Repeat until every check passes.**

### Check 1 — Create a category (prerequisite)
Run `curl -s -X POST http://localhost:3000/categories -H "Content-Type: application/json" -d '{"name":"TestCat"}'`. Must return a category with an `id`. Note the `id` for subsequent checks (referred to as `$CAT_ID`).

### Check 2 — Create a transaction
Run:
```bash
curl -s -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"Test purchase","date":"2026-02-28","amount":-50.00,"payment_method":"Credit Card","category_id":$CAT_ID,"type":"discretionary"}'
```
Response must be HTTP 201 with the created transaction including all fields and an `id`.

### Check 3 — Validation: missing fields
Run `curl -s -X POST http://localhost:3000/transactions -H "Content-Type: application/json" -d '{"description":"Incomplete"}'`. Response must be HTTP 400 with an error message.

### Check 4 — Validation: invalid type
Run a POST with `"type":"invalid"` and all other fields valid. Response must be HTTP 400.

### Check 5 — Validation: non-existent category
Run a POST with `"category_id": 99999` and all other fields valid. Response must be HTTP 400.

### Check 6 — List transactions with join
Run `curl -s http://localhost:3000/transactions`. Response must include a `transactions` array where each entry has a `category_name` field (not just `category_id`).

### Check 7 — Filter by type
Run `curl -s "http://localhost:3000/transactions?type=discretionary"`. Must return only transactions with `type: "discretionary"`.

### Check 8 — Filter by date range
Create a second transaction with a different date (e.g. `"2026-01-15"`). Then run `curl -s "http://localhost:3000/transactions?start_date=2026-02-01&end_date=2026-02-28"`. Must return only the February transaction, not the January one.

### Check 9 — Filter by category
Run `curl -s "http://localhost:3000/transactions?category_id=$CAT_ID"`. Must return only transactions matching that category.

### Check 10 — Delete a transaction
Run `curl -s -X DELETE http://localhost:3000/transactions/$TX_ID` (using the ID from Check 2). Response must include `"success": true`.

### Check 11 — Delete non-existent transaction
Run the same DELETE again. Response must be HTTP 404 with `"Transaction not found"`.

## Commit
Once ALL acceptance checks pass, create a git commit with a message like "add transactions API with filtering and validation". Stage only the files changed or added in this plan.
