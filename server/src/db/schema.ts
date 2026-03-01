import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  date: text("date").notNull(),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  category: text("category").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const income = sqliteTable("income", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  date: text("date").notNull(),
  amount: real("amount").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
