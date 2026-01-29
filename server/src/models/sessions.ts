import { query } from "../db";

export type Session = {
  id: string;
  session_token: string;
  user_id: string;
  data?: any;
  expires_at?: string;
};

export async function createSession(
  userId: string,
  token: string,
  expiresAt?: string,
) {
  const res = await query(
    `INSERT INTO sessions (session_token, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *`,
    [token, userId, expiresAt],
  );
  return res.rows[0] as Session;
}

export async function getSessionByToken(token: string) {
  const res = await query(`SELECT * FROM sessions WHERE session_token = $1`, [
    token,
  ]);
  return res.rows[0] as Session | undefined;
}

export async function deleteSessionByToken(token: string) {
  await query(`DELETE FROM sessions WHERE session_token = $1`, [token]);
}

export async function deleteSessionsByUser(userId: string) {
  await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}
