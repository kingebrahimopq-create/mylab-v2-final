import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof createDrizzle> | undefined;

function createDrizzle() {
  const pool = createPool(env.databaseUrl);
  return drizzle(pool, {
    mode: "planetscale",
    schema: fullSchema,
  });
}

export function getDb() {
  if (!instance) {
    instance = createDrizzle();
  }
  return instance;
}
