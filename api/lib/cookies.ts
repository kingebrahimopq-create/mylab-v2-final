import { getCookie } from "hono/cookie";
import type { Context } from "hono";

export function getSessionToken(c: Context): string | undefined {
  return getCookie(c, "session");
}
