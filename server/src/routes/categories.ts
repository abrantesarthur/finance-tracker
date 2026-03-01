import { Elysia, t } from "elysia";
import { db } from "../db";
import { budgetCategories } from "../db/schema";
import { asc } from "drizzle-orm";

export const categoriesRoutes = new Elysia()
  .get("/categories", async () => {
    const categories = await db
      .select()
      .from(budgetCategories)
      .orderBy(asc(budgetCategories.name));
    return { categories };
  })
  .post(
    "/categories",
    async ({ body, set }) => {
      try {
        const [created] = await db
          .insert(budgetCategories)
          .values({ name: body.name })
          .returning();
        return created;
      } catch (err: any) {
        if (err.message?.includes("UNIQUE constraint failed")) {
          set.status = 409;
          return { error: "Category already exists" };
        }
        throw err;
      }
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  );
