import { query } from "../db";

export type Course = {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export async function listCourses(search?: string, limit = 50, offset = 0) {
  if (search) {
    const res = await query(
      `SELECT * FROM courses WHERE code ILIKE $1 OR name ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset],
    );
    return res.rows as Course[];
  }
  const res = await query(
    `SELECT * FROM courses ORDER BY name LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return res.rows as Course[];
}

export async function getCourse(id: string) {
  const res = await query("SELECT * FROM courses WHERE id = $1", [id]);
  return res.rows[0] as Course | undefined;
}

export async function createCourse(payload: Partial<Course>) {
  const res = await query(
    `INSERT INTO courses (code, name, description) VALUES ($1,$2,$3) RETURNING *`,
    [payload.code, payload.name, payload.description],
  );
  return res.rows[0] as Course;
}

export async function updateCourse(id: string, payload: Partial<Course>) {
  const res = await query(
    `UPDATE courses SET code=$1, name=$2, description=$3, updated_at=now() WHERE id=$4 RETURNING *`,
    [payload.code, payload.name, payload.description, id],
  );
  return res.rows[0] as Course;
}

export async function deleteCourse(id: string) {
  await query("DELETE FROM courses WHERE id = $1", [id]);
  return true;
}
