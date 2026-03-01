# Finance Tracker

A personal finance tracker for managing transactions and budget categories. Single-user, localhost-only, SQLite-backed.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)

## Stack

| Layer    | Tech                    |
| -------- | ----------------------- |
| Runtime  | Bun                     |
| Backend  | Elysia (port 3000)      |
| Frontend | React + Vite (port 5173)|
| Database | SQLite via Drizzle ORM  |
| Styling  | Tailwind CSS            |

Monorepo with Bun workspaces: `server/` and `web/`.

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

## Project Structure

```
├── server/
│   ├── src/
│   │   ├── index.ts          # API entrypoint
│   │   ├── db/
│   │   │   ├── schema.ts     # Drizzle schema
│   │   │   └── index.ts      # DB connection
│   │   └── routes/
│   │       ├── categories.ts
│   │       └── transactions.ts
│   └── drizzle.config.ts
├── web/
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── TransactionsTab.tsx
│           └── CategoriesTab.tsx
├── init.sh
└── package.json
```

## License

MIT
