import { query } from "../db";

export type Reservation = {
  id: string;
  student_id: string;
  subject_id: string;
  reserved_at?: string;
  status?: string;
};

export async function createReservation(studentId: string, subjectId: string) {
  const res = await query(
    `INSERT INTO subject_reservations (student_id, subject_id) VALUES ($1,$2) RETURNING *`,
    [studentId, subjectId],
  );
  return res.rows[0] as Reservation;
}

export async function deleteReservation(studentId: string, subjectId: string) {
  await query(
    `DELETE FROM subject_reservations WHERE student_id=$1 AND subject_id=$2`,
    [studentId, subjectId],
  );
}

export async function listReservationsForStudent(studentId: string) {
  const res = await query(
    `SELECT sr.* , s.code, s.title, s.units FROM subject_reservations sr JOIN subjects s ON s.id = sr.subject_id WHERE sr.student_id = $1`,
    [studentId],
  );
  return res.rows;
}
