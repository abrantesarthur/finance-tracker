import { Elysia, t } from "elysia";
import { db } from "../db";
import { income } from "../db/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";

export const incomeRoutes = new Elysia()
  .onError(({ code, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "All fields are required" };
    }
  })
  .get("/income", async ({ query }) => {
    const conditions = [];

    if (query.start_date) {
      conditions.push(gte(income.date, query.start_date));
    }
    if (query.end_date) {
      conditions.push(lte(income.date, query.end_date));
    }

    const rows = await db
      .select({
        id: income.id,
        description: income.description,
        date: income.date,
        amount: income.amount,
        created_at: income.createdAt,
      })
      .from(income)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(income.date), desc(income.createdAt));

    return { income: rows };
  })
  .post(
    "/income",
    async ({ body, set }) => {
      const { description, date, amount } = body;

      if (!description || !date || amount == null) {
        set.status = 400;
        return { error: "All fields are required" };
      }

      if (amount <= 0) {
        set.status = 400;
        return { error: "Amount must be greater than zero" };
      }

      const [created] = await db
        .insert(income)
        .values({ description, date, amount })
        .returning();

      set.status = 201;
      return created;
    },
    {
      body: t.Object({
        description: t.String(),
        date: t.String(),
        amount: t.Number(),
      }),
    }
  )
  .delete("/income/:id", async ({ params, set }) => {
    const id = Number(params.id);
    const deleted = await db
      .delete(income)
      .where(eq(income.id, id))
      .returning();

    if (deleted.length === 0) {
      set.status = 404;
      return { error: "Income not found" };
    }

    return { success: true };
  });
