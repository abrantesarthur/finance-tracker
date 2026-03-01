import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { mock } from "bun:test";
import * as schema from "../db/schema";

// Set up in-memory DB and mock the db module before importing routes
const sqlite = new Database(":memory:");
sqlite.exec("PRAGMA foreign_keys = ON");
const testDb = drizzle(sqlite, { schema });

mock.module("../db", () => ({ db: testDb }));

// Now import after mocking
const { incomeRoutes } = await import("./income");
import { Elysia } from "elysia";

const app = new Elysia().use(incomeRoutes);

beforeAll(() => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
});

beforeEach(() => {
  sqlite.exec("DELETE FROM income");
});

describe("GET /income", () => {
  test("returns empty list", async () => {
    const res = await app.handle(new Request("http://localhost/income"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.income).toEqual([]);
  });

  test("returns sorted results (newest first)", async () => {
    sqlite.exec(`
      INSERT INTO income (description, date, amount) VALUES
        ('Salary', '2024-01-15', 3000),
        ('Freelance', '2024-02-10', 500),
        ('Bonus', '2024-01-20', 1000)
    `);

    const res = await app.handle(new Request("http://localhost/income"));
    const data = await res.json();
    expect(data.income).toHaveLength(3);
    expect(data.income[0].description).toBe("Freelance");
    expect(data.income[1].description).toBe("Bonus");
    expect(data.income[2].description).toBe("Salary");
  });

  test("filters by start_date", async () => {
    sqlite.exec(`
      INSERT INTO income (description, date, amount) VALUES
        ('Old', '2024-01-01', 100),
        ('New', '2024-03-01', 200)
    `);

    const res = await app.handle(
      new Request("http://localhost/income?start_date=2024-02-01")
    );
    const data = await res.json();
    expect(data.income).toHaveLength(1);
    expect(data.income[0].description).toBe("New");
  });

  test("filters by end_date", async () => {
    sqlite.exec(`
      INSERT INTO income (description, date, amount) VALUES
        ('Old', '2024-01-01', 100),
        ('New', '2024-03-01', 200)
    `);

    const res = await app.handle(
      new Request("http://localhost/income?end_date=2024-02-01")
    );
    const data = await res.json();
    expect(data.income).toHaveLength(1);
    expect(data.income[0].description).toBe("Old");
  });

  test("filters by date range", async () => {
    sqlite.exec(`
      INSERT INTO income (description, date, amount) VALUES
        ('Jan', '2024-01-15', 100),
        ('Feb', '2024-02-15', 200),
        ('Mar', '2024-03-15', 300)
    `);

    const res = await app.handle(
      new Request(
        "http://localhost/income?start_date=2024-02-01&end_date=2024-02-28"
      )
    );
    const data = await res.json();
    expect(data.income).toHaveLength(1);
    expect(data.income[0].description).toBe("Feb");
  });
});

describe("POST /income", () => {
  test("creates income (201)", async () => {
    const res = await app.handle(
      new Request("http://localhost/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Salary",
          date: "2024-01-15",
          amount: 3000,
        }),
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.description).toBe("Salary");
    expect(data.amount).toBe(3000);
  });

  test("rejects missing fields (400)", async () => {
    const res = await app.handle(
      new Request("http://localhost/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Salary" }),
      })
    );
    expect(res.status).toBe(400);
  });

  test("rejects zero amount (400)", async () => {
    const res = await app.handle(
      new Request("http://localhost/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Nothing",
          date: "2024-01-15",
          amount: 0,
        }),
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Amount must be greater than zero");
  });

  test("rejects negative amount (400)", async () => {
    const res = await app.handle(
      new Request("http://localhost/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Negative",
          date: "2024-01-15",
          amount: -50,
        }),
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Amount must be greater than zero");
  });
});

describe("DELETE /income/:id", () => {
  test("deletes existing record", async () => {
    sqlite.exec(
      "INSERT INTO income (description, date, amount) VALUES ('ToDelete', '2024-01-01', 100)"
    );
    const rows = sqlite.query("SELECT id FROM income WHERE description = 'ToDelete'").all() as { id: number }[];
    const id = rows[0].id;

    const res = await app.handle(
      new Request(`http://localhost/income/${id}`, { method: "DELETE" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test("returns 404 for non-existent id", async () => {
    const res = await app.handle(
      new Request("http://localhost/income/99999", { method: "DELETE" })
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Income not found");
  });

  test("deleted record gone from GET", async () => {
    sqlite.exec(
      "INSERT INTO income (description, date, amount) VALUES ('Gone', '2024-01-01', 50)"
    );
    const rows = sqlite.query("SELECT id FROM income WHERE description = 'Gone'").all() as { id: number }[];
    const id = rows[0].id;

    await app.handle(
      new Request(`http://localhost/income/${id}`, { method: "DELETE" })
    );

    const res = await app.handle(new Request("http://localhost/income"));
    const data = await res.json();
    expect(data.income.find((i: { id: number }) => i.id === id)).toBeUndefined();
  });
});
