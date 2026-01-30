"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import apiFetch from "../../../lib/api";
import Protected from "../../../components/Protected";
import ShadCard from "../../../components/ui/shad/card";
import ShadInput from "../../../components/ui/shad/input";
import ShadButton from "../../../components/ui/shad/button";
import { Button } from "@/components/ui/button";

type Course = { id: string; code: string; name: string };
type Subject = { id: string; code: string; title: string; course_id: string };

function StudentProfile() {
  const pathname = usePathname();
  const id = pathname ? (pathname.split("/").pop() as string) : "";
  const [student, setStudent] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjectsForStudentCourse, setSubjectsForStudentCourse] = useState<
    Subject[]
  >([]);
  // grade form state
  const [gradeVals, setGradeVals] = useState<Record<string, string>>({
    subject_id: "",
    course_id: "",
    prelim: "",
    midterm: "",
    finals: "",
  });
  const [gradeCourseSubjects, setGradeCourseSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const s = await apiFetch(`/students/${id}`);
        const g = await apiFetch(`/grades?studentId=${id}`);
        const cs = await apiFetch("/courses");
        if (!mounted) return;
        setStudent(s.data);
        // fetch reservations for this student
        try {
          const resv = await apiFetch(`/students/${id}/reservations`);
          setReservations(resv.data || []);
        } catch (e) {
          setReservations([]);
        }
        setGrades(g.data || []);
        setCourses(cs.data || []);
        // fetch subjects for the student's course if available
        if (s.data?.course_id) {
          const subjResp = await apiFetch(
            `/subjects?courseId=${s.data.course_id}&limit=100`,
          );
          setSubjectsForStudentCourse(subjResp.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        mounted && setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function addReservation() {
    if (!subjectId) return;
    try {
      const res = await apiFetch(`/students/${id}/reservations`, {
        method: "POST",
        body: JSON.stringify({ subject_id: subjectId }),
      });
      // If we have subject metadata locally, merge it into the incoming reservation
      const incoming = res.data;
      const subj = subjectsForStudentCourse.find(
        (s) => s.id === incoming.subject_id,
      );
      const enriched = subj
        ? { ...incoming, code: subj.code, title: subj.title }
        : incoming;
      setReservations((prev) => [enriched, ...prev]);
      setSubjectId("");
    } catch (e: any) {
      alert(e?.message || "Could not add reservation");
    }
  }

  async function removeReservation(subjectIdToRemove: string) {
    if (!confirm("Remove reservation for this subject?")) return;
    try {
      await apiFetch(`/students/${id}/reservations/${subjectIdToRemove}`, {
        method: "DELETE",
      });
      setReservations((prev) =>
        prev.filter((r) => r.subject_id !== subjectIdToRemove),
      );
    } catch (e: any) {
      alert(e?.message || "Could not remove reservation");
    }
  }

  function computeRemarks(final_grade: number | null) {
    if (final_grade === null || final_grade === undefined) return null;
    return final_grade <= 3 ? "Passed" : "Failed";
  }

  function computeFinalGradeFromValues(
    prelim: number | null,
    midterm: number | null,
    finals: number | null,
  ) {
    const nums: number[] = [];
    if (prelim !== null && prelim !== undefined) nums.push(prelim);
    if (midterm !== null && midterm !== undefined) nums.push(midterm);
    if (finals !== null && finals !== undefined) nums.push(finals);
    if (nums.length === 0) return null;
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return Number(avg.toFixed(2));
  }

  async function addGrade() {
    try {
      // basic validation
      if (!gradeVals.course_id || !gradeVals.subject_id) {
        alert("Please select a course and subject before saving a grade.");
        return;
      }
      const prelim = gradeVals.prelim === "" ? null : Number(gradeVals.prelim);
      const midterm =
        gradeVals.midterm === "" ? null : Number(gradeVals.midterm);
      const finals = gradeVals.finals === "" ? null : Number(gradeVals.finals);

      const provided = [prelim, midterm, finals].filter(
        (v) => v !== null,
      ) as number[];
      for (const v of provided) {
        if (Number.isNaN(v) || v < 0 || v > 100) {
          alert("Scores must be numbers between 0 and 100");
          return;
        }
      }

      const final_grade = computeFinalGradeFromValues(prelim, midterm, finals);
      const payload = {
        student_id: id,
        subject_id: gradeVals.subject_id,
        course_id: gradeVals.course_id,
        prelim: prelim !== null ? prelim : null,
        midterm: midterm !== null ? midterm : null,
        finals: finals !== null ? finals : null,
        final_grade,
        remarks: computeRemarks(final_grade),
      };
      const res = await apiFetch("/grades", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // Upsert: replace existing grade for same subject or id, otherwise prepend
      setGrades((prev) => {
        const incoming = res.data;
        const idx = prev.findIndex(
          (g) => g.id === incoming.id || g.subject_id === incoming.subject_id,
        );
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = incoming;
          return next;
        }
        return [incoming, ...prev];
      });
      setGradeVals({
        subject_id: "",
        course_id: "",
        prelim: "",
        midterm: "",
        finals: "",
      });
    } catch (e: any) {
      alert(e?.message || "Could not add grade");
    }
  }

  if (loading) return <div>Loading…</div>;
  if (!student) return <div>Student not found</div>;

  return (
    <div className="space-y-6 mt-[32px]">
      <ShadCard className="px-[10px] py-[5px]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--fg)]">
              {student.first_name} {student.last_name}
            </h3>
            <div className="text-sm text-[var(--muted)]">
              {student.student_no}
              {student.course_id &&
                (() => {
                  const found = courses.find((c) => c.id === student.course_id);
                  return found ? ` • ${found.code} — ${found.name}` : "";
                })()}
            </div>
          </div>
        </div>
      </ShadCard>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ShadCard className="px-[10px] py-[5px]">
          <h4 className="font-medium">Reservations</h4>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-48 max-w-xs min-w-0 rounded-md border px-3 py-2 bg-transparent border-[var(--card-border)] text-[var(--fg)] mb-[12px]"
            >
              <option value="">Choose subject</option>
              {subjectsForStudentCourse.map((s) => (
                <option key={s.id} value={s.id}>
                  {`${s.code} — ${s.title}`}
                </option>
              ))}
            </select>
            <ShadButton
              className="border-0 cursor-pointer text-[var(--danger)] py-[5px] px-[10px] mb-[20px]"
              onClick={addReservation}
            >
              Reserve
            </ShadButton>
          </div>
          <div className="mt-4 space-y-2">
            {reservations.length === 0 && (
              <div className="text-sm text-[var(--muted)]">No reservations</div>
            )}
            {reservations.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 my-[5px]"
              >
                <div className="text-sm truncate">
                  {r.title ? `${r.code} — ${r.title}` : r.subject_id}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => removeReservation(r.subject_id)}
                    className="text-xs text-[var(--danger)] hover:underline border-0 cursor-pointer py-[5px] px-[10px]"
                  >
                    Unreserve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ShadCard>

        <ShadCard className="px-[10px] py-[5px]">
          <h4 className="mb-3 font-medium">Grades</h4>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <select
                value={gradeVals.course_id}
                onChange={async (e) => {
                  const cid = e.target.value;
                  setGradeVals((prev) => ({
                    ...prev,
                    course_id: cid,
                    subject_id: "",
                  }));
                  if (cid) {
                    const subj = await apiFetch(
                      `/subjects?courseId=${cid}&limit=200`,
                    );
                    setGradeCourseSubjects(subj.data || []);
                  } else {
                    setGradeCourseSubjects([]);
                  }
                }}
                className="w-[300px] rounded-md border px-3 py-2 bg-transparent border-[var(--card-border)] text-[var(--fg)] mb-[12px]"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.code} — ${c.name}`}
                  </option>
                ))}
              </select>

              <select
                value={gradeVals.subject_id}
                onChange={(e) =>
                  setGradeVals((prev) => ({
                    ...prev,
                    subject_id: e.target.value,
                  }))
                }
                className="w-[300px] rounded-md border px-3 py-2 bg-transparent border-[var(--card-border)] text-[var(--fg)] mb-[12px]"
              >
                <option value="">Select subject</option>
                {gradeCourseSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {`${s.code} — ${s.title}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <ShadInput
                placeholder="prelim"
                value={gradeVals.prelim}
                onChange={(e) =>
                  setGradeVals({ ...gradeVals, prelim: e.target.value })
                }
                className="mb-[5px] h-[32px] px-[10px]"
                style={{ width: "100px" }}
              />
              <ShadInput
                placeholder="midterm"
                value={gradeVals.midterm}
                onChange={(e) =>
                  setGradeVals({ ...gradeVals, midterm: e.target.value })
                }
                className="mb-[5px] h-[32px] px-[10px]"
                style={{ width: "100px" }}
              />
              <ShadInput
                placeholder="finals"
                value={gradeVals.finals}
                onChange={(e) =>
                  setGradeVals({ ...gradeVals, finals: e.target.value })
                }
                className="mb-[5px] h-[32px] px-[10px]"
                style={{ width: "100px" }}
              />
            </div>
            <ShadButton
              className="border-0 cursor-pointer text-[var(--danger)] py-[5px] px-[10px] mt-[10px] mb-[20px]"
              onClick={addGrade}
            >
              Save grade
            </ShadButton>
          </div>
          <div className="mt-4 space-y-2">
            {grades.length === 0 && (
              <div className="text-sm text-[var(--muted)]">No grades</div>
            )}
            {grades.map((g, idx) => {
              const subj =
                gradeCourseSubjects.find((s) => s.id === g.subject_id) ||
                subjectsForStudentCourse.find((s) => s.id === g.subject_id);
              const subjLabel = subj
                ? `${subj.code} — ${subj.title}`
                : g.subject_id
                  ? g.subject_id
                  : "—";
              return (
                <div
                  key={`${g.subject_id ?? g.id ?? "grade"}-${idx}`}
                  className="flex items-center justify-between my-[5px]"
                >
                  <div>
                    <div className="text-sm truncate">{subjLabel}</div>
                    <div className="text-xs text-[var(--muted)]">
                      Final: {g.final_grade ?? "—"}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--muted)] truncate">
                    Prelim {g.prelim} · Mid {g.midterm} · Final {g.finals}
                  </div>
                </div>
              );
            })}
          </div>
        </ShadCard>
      </div>
    </div>
  );
}

export default function ProtectedStudentProfile() {
  return (
    <Protected>
      <StudentProfile />
    </Protected>
  );
}
