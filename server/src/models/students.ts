import { query } from "../db";

export type Student = {
  id: string;
  student_no: string;
  first_name: string;
  last_name: string;
  email?: string;
  birth_date?: string;
  course_id: string;
};

export async function listStudents(search?: string, limit = 50, offset = 0) {
  const q = search
    ? `SELECT * FROM students WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR student_no ILIKE $1 ORDER BY last_name LIMIT $2 OFFSET $3`
    : `SELECT * FROM students ORDER BY last_name LIMIT $2 OFFSET $3`;
  const params = search ? [`%${search}%`, limit, offset] : [limit, offset];
  // If there's no search term the query uses $1/$2 for LIMIT/OFFSET —
  // ensure the SQL placeholders and params align.
  // (previously used LIMIT $2 OFFSET $3 which left $1 undefined.)
  if (!search) {
    // rewrite query to use $1/$2 when no search
    // keep it simple and avoid duplicating logic: replace placeholders
    // so params map correctly.
    const q2 = `SELECT * FROM students ORDER BY last_name LIMIT $1 OFFSET $2`;
    const res = await query(q2, params);
    return res.rows as Student[];
  }
  const res = await query(q, params);
  return res.rows as Student[];
}

export async function listRecentStudents(limit = 10) {
  const res = await query(
    `SELECT * FROM students
     WHERE created_at >= now() - INTERVAL '7 days'
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit],
  );
  return res.rows as Student[];
}

export async function countStudents() {
  const res = await query(`SELECT COUNT(*)::int AS count FROM students`);
  return (res.rows[0]?.count as number) || 0;
}

export async function getStudent(id: string) {
  const res = await query("SELECT * FROM students WHERE id = $1", [id]);
  return res.rows[0] as Student | undefined;
}

export async function createStudent(payload: Partial<Student>) {
  const res = await query(
    `INSERT INTO students (student_no, first_name, last_name, email, birth_date, course_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      payload.student_no,
      payload.first_name,
      payload.last_name,
      payload.email,
      payload.birth_date,
      payload.course_id,
    ],
  );
  return res.rows[0] as Student;
}

export async function updateStudent(id: string, payload: Partial<Student>) {
  const res = await query(
    `UPDATE students SET student_no = $1, first_name = $2, last_name = $3, email = $4, birth_date = $5, course_id = $6, updated_at = now() WHERE id = $7 RETURNING *`,
    [
      payload.student_no,
      payload.first_name,
      payload.last_name,
      payload.email,
      payload.birth_date,
      payload.course_id,
      id,
    ],
  );
  return res.rows[0] as Student;
}

export async function deleteStudent(id: string) {
  await query("DELETE FROM students WHERE id = $1", [id]);
  return true;
}
