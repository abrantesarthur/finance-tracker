import { Elysia, t } from "elysia";
import { db } from "../db";
import { transactions, budgetCategories } from "../db/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";

export const transactionsRoutes = new Elysia()
  .onError(({ code, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "All fields are required" };
    }
  })
  .get("/transactions", async ({ query }) => {
    const conditions = [];

    if (query.start_date) {
      conditions.push(gte(transactions.date, query.start_date));
    }
    if (query.end_date) {
      conditions.push(lte(transactions.date, query.end_date));
    }
    if (query.category_id) {
      conditions.push(eq(transactions.categoryId, Number(query.category_id)));
    }
    if (query.type) {
      conditions.push(eq(transactions.type, query.type));
    }

    const rows = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        date: transactions.date,
        amount: transactions.amount,
        payment_method: transactions.paymentMethod,
        category_id: transactions.categoryId,
        category_name: budgetCategories.name,
        type: transactions.type,
        created_at: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(budgetCategories, eq(transactions.categoryId, budgetCategories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactions.date), desc(transactions.createdAt));

    return { transactions: rows };
  })
  .post(
    "/transactions",
    async ({ body, set }) => {
      const { description, date, amount, payment_method, category_id, type } = body;

      if (!description || !date || amount == null || !payment_method || !category_id || !type) {
        set.status = 400;
        return { error: "All fields are required" };
      }

      if (type !== "subscription" && type !== "discretionary") {
        set.status = 400;
        return { error: "Type must be 'subscription' or 'discretionary'" };
      }

      const category = await db
        .select()
        .from(budgetCategories)
        .where(eq(budgetCategories.id, category_id))
        .limit(1);

      if (category.length === 0) {
        set.status = 400;
        return { error: "Category not found" };
      }

      const [created] = await db
        .insert(transactions)
        .values({
          description,
          date,
          amount,
          paymentMethod: payment_method,
          categoryId: category_id,
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
        category_id: t.Number(),
        type: t.String(),
      }),
    }
  )
  .delete("/transactions/:id", async ({ params, set }) => {
    const id = Number(params.id);
    const deleted = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();

    if (deleted.length === 0) {
      set.status = 404;
      return { error: "Transaction not found" };
    }

    return { success: true };
  });
