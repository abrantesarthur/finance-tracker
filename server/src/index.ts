import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "./db";

const app = new Elysia()
  .use(cors({ origin: "http://localhost:5173" }))
  .get("/", () => ({ status: "ok" }))
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
