import { readFile } from "fs/promises";
import { Client } from "pg";

async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: bun run server/scripts/run_sql.ts path/to/file.sql");
    process.exit(1);
  }

  const fileArg = process.argv[2];
  const filePath = fileArg.startsWith("/")
    ? fileArg
    : process.cwd() + "/" + fileArg;

  const sql = await readFile(filePath, "utf8");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not set in env");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    // Execute the SQL file contents
    await client.query(sql);
    console.log("OK:", fileArg);
  } catch (err) {
    console.error("ERROR executing", fileArg);
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
