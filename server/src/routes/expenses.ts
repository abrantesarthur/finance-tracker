import { Elysia, t } from "elysia";
import { db } from "../db";
import { expenses } from "../db/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";

export const expensesRoutes = new Elysia()
  .onError(({ code, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "All fields are required" };
    }
  })
  .get("/expenses", async ({ query }) => {
    const conditions = [];

    if (query.start_date) {
      conditions.push(gte(expenses.date, query.start_date));
    }
    if (query.end_date) {
      conditions.push(lte(expenses.date, query.end_date));
    }
    if (query.category) {
      conditions.push(eq(expenses.category, query.category));
    }
    if (query.type) {
      conditions.push(eq(expenses.type, query.type));
    }

    const rows = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        date: expenses.date,
        amount: expenses.amount,
        payment_method: expenses.paymentMethod,
        category: expenses.category,
        type: expenses.type,
        created_at: expenses.createdAt,
      })
      .from(expenses)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expenses.date), desc(expenses.createdAt));

    return { expenses: rows };
  })
  .post(
    "/expenses",
    async ({ body, set }) => {
      const { description, date, amount, payment_method, category, type } = body;

      if (!description || !date || amount == null || !payment_method || !category || !type) {
        set.status = 400;
        return { error: "All fields are required" };
      }

      if (type !== "subscription" && type !== "discretionary") {
        set.status = 400;
        return { error: "Type must be 'subscription' or 'discretionary'" };
      }

      const [created] = await db
        .insert(expenses)
        .values({
          description,
          date,
          amount,
          paymentMethod: payment_method,
          category,
          type,
        })
        .returning();

      set.status = 201;
      return created;
    },
    {
      body: t.Object({
        description: t.String(),
        date: t.String(),
        amount: t.Number(),
        payment_method: t.String(),
        category: t.String(),
        type: t.String(),
      }),
    }
  )
  .delete("/expenses/:id", async ({ params, set }) => {
    const id = Number(params.id);
    const deleted = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();

    if (deleted.length === 0) {
      set.status = 404;
      return { error: "Expense not found" };
    }

    return { success: true };
  });
