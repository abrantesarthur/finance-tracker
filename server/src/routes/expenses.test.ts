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
const { expensesRoutes } = await import("./expenses");
import { Elysia } from "elysia";

const app = new Elysia().use(expensesRoutes);

beforeAll(() => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS budget_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      category_id INTEGER REFERENCES budget_categories(id),
      type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
});

beforeEach(() => {
  sqlite.exec("DELETE FROM expenses");
  sqlite.exec("DELETE FROM budget_categories");
  // Seed a test category
  sqlite.exec("INSERT INTO budget_categories (id, name) VALUES (1, 'Food')");
  sqlite.exec("INSERT INTO budget_categories (id, name) VALUES (2, 'Rent')");
});

describe("GET /expenses", () => {
  test("returns empty list", async () => {
    const res = await app.handle(new Request("http://localhost/expenses"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.expenses).toEqual([]);
  });

  test("returns expenses with category names", async () => {
    sqlite.exec(`
      INSERT INTO expenses (description, date, amount, payment_method, category_id, type)
      VALUES ('Groceries', '2024-01-15', -50, 'Credit Card', 1, 'discretionary')
    `);

    const res = await app.handle(new Request("http://localhost/expenses"));
    const data = await res.json();
    expect(data.expenses).toHaveLength(1);
    expect(data.expenses[0].category_name).toBe("Food");
  });

  test("filters by start_date", async () => {
    sqlite.exec(`
      INSERT INTO expenses (description, date, amount, payment_method, category_id, type)
      VALUES ('Old', '2024-01-01', -10, 'Cash', 1, 'discretionary'),
             ('New', '2024-03-01', -20, 'Cash', 1, 'discretionary')
    `);

    const res = await app.handle(
      new Request("http://localhost/expenses?start_date=2024-02-01")
    );
    const data = await res.json();
    expect(data.expenses).toHaveLength(1);
    expect(data.expenses[0].description).toBe("New");
  });

  test("filters by end_date", async () => {
    sqlite.exec(`
      INSERT INTO expenses (description, date, amount, payment_method, category_id, type)
      VALUES ('Old', '2024-01-01', -10, 'Cash', 1, 'discretionary'),
             ('New', '2024-03-01', -20, 'Cash', 1, 'discretionary')
    `);

    const res = await app.handle(
      new Request("http://localhost/expenses?end_date=2024-02-01")
    );
    const data = await res.json();
    expect(data.expenses).toHaveLength(1);
    expect(data.expenses[0].description).toBe("Old");
  });

  test("filters by category_id", async () => {
    sqlite.exec(`
      INSERT INTO expenses (description, date, amount, payment_method, category_id, type)
      VALUES ('A', '2024-01-01', -10, 'Cash', 1, 'discretionary'),
             ('B', '2024-01-01', -20, 'Cash', 2, 'discretionary')
    `);

    const res = await app.handle(
      new Request("http://localhost/expenses?category_id=2")
    );
    const data = await res.json();
    expect(data.expenses).toHaveLength(1);
    expect(data.expenses[0].description).toBe("B");
  });

  test("filters by type", async () => {
    sqlite.exec(`
      INSERT INTO expenses (description, date, amount, payment_method, category_id, type)
      VALUES ('Sub', '2024-01-01', -10, 'Cash', 1, 'subscription'),
             ('Disc', '2024-01-01', -20, 'Cash', 1, 'discretionary')
    `);

    const res = await app.handle(
      new Request("http://localhost/expenses?type=subscription")
    );
    const data = await res.json();
    expect(data.expenses).toHaveLength(1);
    expect(data.expenses[0].description).toBe("Sub");
  });
});

describe("POST /expenses", () => {
  test("creates expense (201)", async () => {
    const res = await app.handle(
      new Request("http://localhost/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Lunch",
          date: "2024-01-15",
          amount: -15,
          payment_method: "Cash",
          category_id: 1,
          type: "discretionary",
        }),
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.description).toBe("Lunch");
  });

  test("rejects missing fields (400)", async () => {
    const res = await app.handle(
      new Request("http://localhost/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Lunch",
        }),
      })
    );
    expect(res.status).toBe(400);
  });

  test("rejects invalid type (400)", async () => {
    const res = await app.handle(
      new Request("http://localhost/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Lunch",
          date: "2024-01-15",
          amount: -15,
          payment_method: "Cash",
          category_id: 1,
          type: "invalid",
        }),
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Type must be 'subscription' or 'discretionary'");
  });

  test("rejects nonexistent category (400)", async () => {
    const res = await app.handle(
      new Request("http://localhost/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Lunch",
          date: "2024-01-15",
          amount: -15,
          payment_method: "Cash",
          category_id: 999,
          type: "discretionary",
        }),
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Category not found");
  });
});

describe("DELETE /expenses/:id", () => {
  test("deletes existing record", async () => {
    sqlite.exec(
      "INSERT INTO expenses (description, date, amount, payment_method, category_id, type) VALUES ('Del', '2024-01-01', -10, 'Cash', 1, 'discretionary')"
    );
    const rows = sqlite.query("SELECT id FROM expenses WHERE description = 'Del'").all() as { id: number }[];
    const id = rows[0].id;

    const res = await app.handle(
      new Request(`http://localhost/expenses/${id}`, { method: "DELETE" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test("returns 404 for non-existent id", async () => {
    const res = await app.handle(
      new Request("http://localhost/expenses/99999", { method: "DELETE" })
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Expense not found");
  });
});
