# Finance Tracker

A personal finance tracker for managing transactions and budget categories. Single-user, localhost-only, SQLite-backed.

## Getting Started

```bash
# Clone and install
git clone <repo-url> && cd finance-tracker
bun install

# Initialize DB
bun run --filter server db:push

# Start both servers
bun run dev
```

Or use the init script to do it all at once:

```bash
./init.sh
```

The API runs at `http://localhost:3000` and the UI at `http://localhost:5173`.

## API

| Method   | Path                 | Description              |
| -------- | -------------------- | ------------------------ |
| `GET`    | `/`                  | Health check             |
| `GET`    | `/categories`        | List budget categories   |
| `POST`   | `/categories`        | Create a category        |
| `GET`    | `/transactions`      | List transactions (filterable) |
| `POST`   | `/transactions`      | Add a transaction        |
| `DELETE` | `/transactions/:id`  | Remove a transaction     |

**Transaction filters** (query params on `GET /transactions`): date range, category, type (`subscription` | `discretionary`).