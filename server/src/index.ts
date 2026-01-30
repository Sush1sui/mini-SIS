import { Hono } from "hono";
import { serve } from "bun";
import authRouter from "./auth";
import studentsRouter from "./routes/students";
import coursesRouter from "./routes/courses";
import subjectsRouter from "./routes/subjects";
import gradesRouter from "./routes/grades";

const app = new Hono();

// Hono-native CORS handling for development
app.use("*", async (c, next) => {
  const origin =
    typeof c.req.header === "function" ? c.req.header("origin") || "" : "";
  const allowed = process.env.ALLOWED_ORIGIN || "http://localhost:3000";
  if (origin && origin === allowed) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    c.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
  }

  if (c.req.method === "OPTIONS") {
    const headers = new Headers();
    if (origin && origin === allowed) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Credentials", "true");
      headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
      );
      headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      );
    }
    return new Response("", { status: 204, headers });
  }

  return next();
});

app.get("/", (c) => {
  return c.text("Mini School SIS - Hono + Bun");
});

// mount auth routes
app.route("/auth", authRouter);
// mount students routes
app.route("/students", studentsRouter);
app.route("/courses", coursesRouter);
app.route("/subjects", subjectsRouter);
app.route("/grades", gradesRouter);

const port = Number(process.env.PORT) || 4000;
const BUN_MANUAL = process.env.BUN_MANUAL === "1";

// When running with `bun <file>` Bun may automatically start a server
// if the module exports a fetch handler. To avoid attempting to listen
// twice (and getting EADDRINUSE), skip the manual `serve()` call when
// Bun is present unless the `BUN_MANUAL=1` env var is set.
if (typeof Bun !== "undefined" && !BUN_MANUAL) {
  console.log(
    `Detected Bun runtime — skipping manual serve (Bun will auto-serve).`,
  );
} else {
  console.log(`Starting Mini SIS server on port ${port}`);
  serve({ fetch: app.fetch, port });
}

let retryTimer: ReturnType<typeof setTimeout> | null = null;
let isPinging = false;
const SERVER_LINK = process.env.SERVER_LINK;

async function attemptPing() {
  if (!SERVER_LINK || isPinging) return;
  isPinging = true;
  try {
    const res = await fetch(SERVER_LINK, { method: "GET" });
    console.log(`Ping successful (${res.status})`);
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  } catch (err) {
    console.log(`Ping failed, scheduling retry: ${err}`);
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(() => void attemptPing(), 5000);
  } finally {
    isPinging = false;
  }
}

// Run immediate first check, then every 10 minutes
void attemptPing();
setInterval(() => void attemptPing(), 10 * 60 * 1000);

export default app;
