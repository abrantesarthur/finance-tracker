import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "./db";
import { categoriesRoutes } from "./routes/categories";
import { transactionsRoutes } from "./routes/transactions";

const app = new Elysia()
  .use(cors({ origin: "http://localhost:5173" }))
  .get("/", () => ({ status: "ok" }))
  .use(categoriesRoutes)
  .use(transactionsRoutes)
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
