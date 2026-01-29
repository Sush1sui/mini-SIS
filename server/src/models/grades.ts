import { query } from "../db";

export type Grade = {
  id: string;
  student_id: string;
  subject_id: string;
  course_id: string;
  prelim?: number;
  midterm?: number;
  finals?: number;
  final_grade?: number;
  remarks?: string;
  encoded_by_user_id?: string;
};

export async function upsertGrade(payload: Partial<Grade>) {
  // upsert using unique constraint (student_id, subject_id, course_id)
  const res = await query(
    `INSERT INTO grades (student_id, subject_id, course_id, prelim, midterm, finals, final_grade, remarks, encoded_by_user_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (student_id, subject_id, course_id) DO UPDATE
     SET prelim = EXCLUDED.prelim, midterm = EXCLUDED.midterm, finals = EXCLUDED.finals, final_grade = EXCLUDED.final_grade, remarks = EXCLUDED.remarks, encoded_by_user_id = EXCLUDED.encoded_by_user_id, updated_at = now()
     RETURNING *`,
    [
      payload.student_id,
      payload.subject_id,
      payload.course_id,
      payload.prelim,
      payload.midterm,
      payload.finals,
      payload.final_grade,
      payload.remarks,
      payload.encoded_by_user_id,
    ],
  );
  return res.rows[0] as Grade;
}

export async function getGrades(filter: {
  courseId?: string;
  subjectId?: string;
  studentId?: string;
}) {
  const clauses: string[] = [];
  const params: any[] = [];
  let i = 1;
  if (filter.courseId) {
    clauses.push(`course_id = $${i++}`);
    params.push(filter.courseId);
  }
  if (filter.subjectId) {
    clauses.push(`subject_id = $${i++}`);
    params.push(filter.subjectId);
  }
  if (filter.studentId) {
    clauses.push(`student_id = $${i++}`);
    params.push(filter.studentId);
  }
  const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";
  const res = await query(
    `SELECT * FROM grades ${where} ORDER BY created_at DESC`,
    params,
  );
  return res.rows as Grade[];
}

export async function getGradeById(id: string) {
  const res = await query("SELECT * FROM grades WHERE id = $1", [id]);
  return res.rows[0] as Grade | undefined;
}
