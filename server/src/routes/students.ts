import { Hono } from "hono";
import { requireAuth, getUserFromContext } from "../middleware/auth";
import * as studentsModel from "../models/students";

const router = new Hono();

// protect all students routes
router.use("*", requireAuth);

router.get("/recent", async (c) => {
  try {
    const rows = await studentsModel.listRecentStudents(10);
    return c.json({ data: rows });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

// return total count of students
router.get("/count", async (c) => {
  try {
    const { countStudents } = await import("../models/students");
    const count = await countStudents();
    return c.json({ data: { count } });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

router.get("/", async (c) => {
  try {
    const search = c.req.query("search") || undefined;
    const limit = Number(c.req.query("limit") || 50);
    const offset = Number(c.req.query("offset") || 0);
    const rows = await studentsModel.listStudents(search, limit, offset);
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
    if (
      !body.student_no ||
      !body.first_name ||
      !body.last_name ||
      !body.course_id
    ) {
      return c.json({ error: "missing fields" }, 400);
    }
    const created = await studentsModel.createStudent(body);
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
    const row = await studentsModel.getStudent(id);
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json({ data: row });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

// list reservations for a student
router.get("/:id/reservations", async (c) => {
  try {
    const id = c.req.param("id");
    const { listReservationsForStudent } =
      await import("../models/reservations");
    const rows = await listReservationsForStudent(id);
    return c.json({ data: rows });
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
    const updated = await studentsModel.updateStudent(id, body);
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
    await studentsModel.deleteStudent(id);
    return c.json({ ok: true });
  } catch (err: any) {
    const { mapPgError } = await import("../utils/dbErrors");
    const e = mapPgError(err);
    return c.json({ error: e.message }, { status: e.status } as any);
  }
});

// Reservations: reserve a subject for a student
router.post("/:id/reservations", async (c) => {
  const studentId = c.req.param("id");
  const { subject_id } = await c.req.json();
  if (!subject_id) return c.json({ error: "missing subject_id" }, 400);
  // validate subject belongs to student's course
  const st = await studentsModel.getStudent(studentId);
  if (!st) return c.json({ error: "student not found" }, 404);
  const subj = await (
    await import("../models/subjects")
  ).getSubject(subject_id);
  if (!subj) return c.json({ error: "subject not found" }, 404);
  if (subj.course_id !== st.course_id)
    return c.json({ error: "subject not in student course" }, 400);
  const { createReservation } = await import("../models/reservations");
  try {
    const r = await createReservation(studentId, subject_id);
    return c.json({ data: r }, 201);
  } catch (e: any) {
    return c.json({ error: e.message || "error" }, 400);
  }
});

router.delete("/:id/reservations/:subjectId", async (c) => {
  const studentId = c.req.param("id");
  const subjectId = c.req.param("subjectId");
  const { deleteReservation } = await import("../models/reservations");
  await deleteReservation(studentId, subjectId);
  return c.json({ ok: true });
});

export default router;
