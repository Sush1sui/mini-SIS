import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query } from "./db";
import {
  createSession,
  getSessionByToken,
  deleteSessionByToken,
} from "./models/sessions";

const router = new Hono();

const SESSION_COOKIE_NAME = "sid";
const SESSION_EXPIRES_HOURS = 24 * 7; // 7 days

router.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: "missing credentials" }, 400);

  const res = await query("SELECT * FROM users WHERE email = $1", [email]);
  const user = res.rows[0];
  if (!user) return c.json({ error: "invalid credentials" }, 401);

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return c.json({ error: "invalid credentials" }, 401);

  const token = uuidv4();
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRES_HOURS * 3600 * 1000,
  ).toISOString();
  await createSession(user.id, token, expiresAt);

  // set httpOnly cookie
  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
  });

  const safeUser = { id: user.id, email: user.email, role: user.role };
  return c.json({ user: safeUser });
});

router.post("/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) await deleteSessionByToken(token);
  // clear cookie
  setCookie(c, SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return c.json({ ok: true });
});

router.get("/me", async (c) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return c.json({ user: null });
  const session = await getSessionByToken(token);
  if (!session) return c.json({ user: null });
  const res = await query("SELECT id, email, role FROM users WHERE id = $1", [
    session.user_id,
  ]);
  const user = res.rows[0];
  return c.json({ user: user || null });
});

export default router;
