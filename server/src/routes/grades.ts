import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import * as gradesModel from "../models/grades";

const router = new Hono();
router.use("*", requireAuth);

router.get("/", async (c) => {
  try {
    const courseId = c.req.query("courseId") || undefined;
    const subjectId = c.req.query("subjectId") || undefined;
    const studentId = c.req.query("studentId") || undefined;
    const rows = await gradesModel.getGrades({
      courseId,
      subjectId,
      studentId,
    });
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
    if (!body.student_id || !body.subject_id || !body.course_id)
      return c.json({ error: "missing fields" }, 400);
    const grade = await gradesModel.upsertGrade(body);
    return c.json({ data: grade }, 201);
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

router.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const row = await gradesModel.getGradeById(id);
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
    // partial update via upsert to preserve uniqueness
    const existing = await gradesModel.getGradeById(id);
    if (!existing) return c.json({ error: "not found" }, 404);
    const merged = { ...existing, ...body };
    const updated = await gradesModel.upsertGrade(merged);
    return c.json({ data: updated });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

export default router;
