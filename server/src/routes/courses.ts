import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import * as coursesModel from "../models/courses";

const router = new Hono();
router.use("*", requireAuth);

router.get("/", async (c) => {
  try {
    const search = c.req.query("search") || undefined;
    const limit = Number(c.req.query("limit") || 50);
    const offset = Number(c.req.query("offset") || 0);
    const rows = await coursesModel.listCourses(search, limit, offset);
    return c.json({ data: rows });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

router.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.code || !body.name)
      return c.json({ error: "missing fields" }, 400);
    const created = await coursesModel.createCourse(body);
    return c.json({ data: created }, 201);
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

router.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const row = await coursesModel.getCourse(id);
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ data: row });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

router.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const updated = await coursesModel.updateCourse(id, body);
    return c.json({ data: updated });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

router.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await coursesModel.deleteCourse(id);
    return c.json({ ok: true });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

export default router;
