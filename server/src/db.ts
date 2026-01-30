import { Pool } from "pg";

// Some managed Postgres providers (Supabase, etc.) require SSL/TLS.
// Allow enabling SSL via `DB_SSL=true` in env or rely on PGSSLMODE env var.
const useSsl = process.env.DB_SSL === "true";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
