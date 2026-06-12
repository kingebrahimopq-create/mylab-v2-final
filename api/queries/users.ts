import { getDb } from "./connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@db/schema";

export async function findUserByUnionId(unionId: string): Promise<User | null> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.unionId, unionId)).limit(1);
  return result[0] || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function createUser(data: {
  unionId: string;
  name: string;
  email: string | null;
  avatar: string | null;
  role: "user" | "admin";
}): Promise<number> {
  const db = getDb();
  const result = await db.insert(users).values({
    unionId: data.unionId,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role,
  }).$returningId();
  return result[0].id;
}

export async function updateUserLastSignIn(id: number): Promise<void> {
  const db = getDb();
  await db.update(users)
    .set({ lastSignInAt: new Date() })
    .where(eq(users.id, id));
}
