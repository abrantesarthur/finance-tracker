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

## Roadmap
- use https://ui.shadcn.com/ as the design system. Update readme to mention this. How we use it? 
- Display a cashflow graph with net spend in the last day, week, month, quarter and year. Get inspiration from Robinhood.
- Figure out how to save the state .db file safely. Add instructions to readme about how to retrieve it.
- Decide on a design style (colors, fonts, etc). Get inpiration from Robinhood and pinterest pages.
- Support a net worth section including my investments.
- Display runway based on my spend and net worth
- Pull card transactions automatically from my bank accounts and reconcile them into the sqlite db file.
- Think of other cool analytics I can run on all this data, especially using AI.
