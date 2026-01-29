import { Client } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    // default admin credentials
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.ADMIN_PASSWORD || "adminpass";

    const res = await client.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (res.rows.length > 0) {
      console.log("Admin user already exists, skipping");
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    await client.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3)",
      [email, hash, "admin"],
    );
    console.log("Admin user created:", email);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
