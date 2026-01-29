import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { getSessionByToken } from "../models/sessions";
import { query } from "../db";

export async function requireAuth(c: Context, next: any) {
  const token = getCookie(c, "sid");
  if (!token) return c.json({ error: "unauthenticated" }, 401);
  const session = await getSessionByToken(token);
  if (!session) return c.json({ error: "unauthenticated" }, 401);
  const res = await query("SELECT id, email, role FROM users WHERE id = $1", [
    session.user_id,
  ]);
  const user = res.rows[0];
  if (!user) return c.json({ error: "unauthenticated" }, 401);
  // attach user to context
  try {
    c.set("user", user);
  } catch (e) {}
  return next();
}

export function getUserFromContext(c: Context) {
  try {
    return c.get("user");
  } catch (e) {
    return undefined;
  }
}
