import { query } from "../db";

export type Subject = {
  id: string;
  course_id: string;
  code: string;
  title: string;
  units?: number;
  created_at?: string;
  updated_at?: string;
};

export async function listSubjects(
  courseId?: string,
  search?: string,
  limit = 50,
  offset = 0,
) {
  if (courseId && search) {
    const res = await query(
      `SELECT * FROM subjects WHERE course_id = $1 AND (code ILIKE $2 OR title ILIKE $2) ORDER BY title LIMIT $3 OFFSET $4`,
      [courseId, `%${search}%`, limit, offset],
    );
    return res.rows as Subject[];
  }
  if (courseId) {
    const res = await query(
      `SELECT * FROM subjects WHERE course_id = $1 ORDER BY title LIMIT $2 OFFSET $3`,
      [courseId, limit, offset],
    );
    return res.rows as Subject[];
  }
  const res = await query(
    `SELECT * FROM subjects ORDER BY title LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return res.rows as Subject[];
}

export async function getSubject(id: string) {
  const res = await query("SELECT * FROM subjects WHERE id = $1", [id]);
  return res.rows[0] as Subject | undefined;
}

export async function createSubject(payload: Partial<Subject>) {
  const res = await query(
    `INSERT INTO subjects (course_id, code, title, units) VALUES ($1,$2,$3,$4) RETURNING *`,
    [payload.course_id, payload.code, payload.title, payload.units || 0],
  );
  return res.rows[0] as Subject;
}

export async function updateSubject(id: string, payload: Partial<Subject>) {
  // Get existing row so we don't overwrite non-provided fields with undefined
  const existing = await getSubject(id);
  if (!existing) return undefined as any;
  const course_id = payload.course_id ?? existing.course_id;
  const code = payload.code ?? existing.code;
  const title = payload.title ?? existing.title;
  const units = payload.units ?? existing.units ?? 0;
  const res = await query(
    `UPDATE subjects SET course_id=$1, code=$2, title=$3, units=$4, updated_at=now() WHERE id=$5 RETURNING *`,
    [course_id, code, title, units, id],
  );
  return res.rows[0] as Subject;
}

export async function deleteSubject(id: string) {
  await query("DELETE FROM subjects WHERE id = $1", [id]);
  return true;
}
