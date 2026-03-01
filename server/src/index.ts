import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "./db";
import { expensesRoutes } from "./routes/expenses";
import { incomeRoutes } from "./routes/income";

const app = new Elysia()
  .use(cors({ origin: "http://localhost:5173" }))
  .get("/", () => ({ status: "ok" }))
  .use(expensesRoutes)
  .use(incomeRoutes)
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
