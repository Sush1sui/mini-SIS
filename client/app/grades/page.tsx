"use client";
import { useEffect, useState } from "react";
import Protected from "../../components/Protected";
import apiFetch from "../../lib/api";
import { cropString } from "../../lib/utils";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

type Course = { id: string; code: string; name: string };
type Subject = { id: string; code: string; title: string; course_id: string };

export default function GradesSheetPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({});
  const [savedAll, setSavedAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiFetch("/courses?limit=200")
      .then((d) => {
        if (mounted) setCourses(d.data || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    setSubjects([]);
    apiFetch(`/subjects?courseId=${courseId}&limit=200`)
      .then((d) => {
        if (mounted) setSubjects(d.data || []);
      })
      .catch(() => {});
    // fetch students and filter by course
    apiFetch("/students?limit=1000")
      .then((d) => {
        const all = d.data || [];
        const inCourse = all.filter((s: any) => s.course_id === courseId);
        if (mounted) setStudents(inCourse);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !subjectId) {
      setGradesMap({});
      return;
    }
    setLoading(true);
    let mounted = true;
    apiFetch(`/grades?courseId=${courseId}&subjectId=${subjectId}`)
      .then((d) => {
        const g = d.data || [];
        const map: Record<string, any> = {};
        g.forEach((gr: any) => {
          const localFinal = gr.final_grade ?? computeFinalGrade(gr);
          map[gr.student_id] = {
            ...gr,
            prelim: gr.prelim ?? "",
            midterm: gr.midterm ?? "",
            finals: gr.finals ?? "",
            remarks: computeRemarks(localFinal),
          };
        });
        if (mounted) setGradesMap(map);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [courseId, subjectId]);

  function onChangeGrade(
    studentId: string,
    field: "prelim" | "midterm" | "finals",
    value: string,
  ) {
    setGradesMap((prev) => {
      const cur =
        prev[studentId] ||
        ({
          student_id: studentId,
          course_id: courseId,
          subject_id: subjectId,
          prelim: "",
          midterm: "",
          finals: "",
        } as any);
      const updated = { ...cur, [field]: value } as any;
      // always compute remarks from current scores
      const newFinal = computeFinalGrade(updated);
      updated.remarks = computeRemarks(newFinal);
      return { ...prev, [studentId]: updated };
    });
  }

  function computeRemarks(finalGrade: number | null) {
    if (finalGrade === null || finalGrade === undefined) return null;
    return finalGrade <= 3 ? "Passed" : "Failed";
  }

  function isValidScore(v: string) {
    if (v === "" || v === null || v === undefined) return true;
    const n = Number(v);
    return !Number.isNaN(n) && n >= 0 && n <= 100;
  }

  function computeFinalGrade(g: any) {
    const nums: number[] = [];
    if (g.prelim !== undefined && g.prelim !== "") nums.push(Number(g.prelim));
    if (g.midterm !== undefined && g.midterm !== "")
      nums.push(Number(g.midterm));
    if (g.finals !== undefined && g.finals !== "") nums.push(Number(g.finals));
    if (nums.length === 0) return null;
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;

    return Number(avg.toFixed(2));
  }

  async function saveRow(studentId: string) {
    const g = gradesMap[studentId];
    if (!g) return;
    if (
      !isValidScore(String(g.prelim)) ||
      !isValidScore(String(g.midterm)) ||
      !isValidScore(String(g.finals))
    ) {
      alert("Scores must be numbers between 0 and 100");
      return;
    }
    try {
      setSavingRows((p) => ({ ...p, [studentId]: true }));
      const final_grade = computeFinalGrade(g);
      const payload = {
        student_id: studentId,
        subject_id: g.subject_id || subjectId,
        course_id: g.course_id || courseId,
        prelim: g.prelim !== "" ? Number(g.prelim) : null,
        midterm: g.midterm !== "" ? Number(g.midterm) : null,
        finals: g.finals !== "" ? Number(g.finals) : null,
        final_grade,
        remarks: computeRemarks(final_grade),
      };
      const res = await apiFetch("/grades", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const returned = res.data;
      const returnedFinal = returned.final_grade ?? computeFinalGrade(returned);
      returned.remarks = computeRemarks(returnedFinal);
      setGradesMap((prev) => ({ ...prev, [studentId]: returned }));
      setSavedRows((p) => ({ ...p, [studentId]: true }));
      setTimeout(
        () => setSavedRows((p) => ({ ...p, [studentId]: false })),
        2000,
      );
    } catch (e: any) {
      alert(e?.message || "Could not save grade");
    } finally {
      setSavingRows((p) => ({ ...p, [studentId]: false }));
    }
  }

  async function saveAll() {
    setSaving(true);
    try {
      const entries = Object.values(gradesMap);
      const promises = entries.map((g: any) => {
        const final_grade = computeFinalGrade(g);
        return apiFetch("/grades", {
          method: "POST",
          body: JSON.stringify({
            student_id: g.student_id,
            subject_id: g.subject_id || subjectId,
            course_id: g.course_id || courseId,
            prelim: g.prelim !== "" ? Number(g.prelim) : null,
            midterm: g.midterm !== "" ? Number(g.midterm) : null,
            finals: g.finals !== "" ? Number(g.finals) : null,
            final_grade,
            remarks: computeRemarks(final_grade),
          }),
        });
      });
      const results = await Promise.all(promises);
      // merge server responses into local map, but compute remarks from final
      setGradesMap((prev) => {
        const next = { ...prev };
        results.forEach((r: any) => {
          if (r && r.data && r.data.student_id) {
            const returned = r.data;
            const retFinal =
              returned.final_grade ?? computeFinalGrade(returned);
            returned.remarks = computeRemarks(retFinal);
            next[returned.student_id] = returned;
          }
        });
        return next;
      });
      setSavedAll(true);
      setTimeout(() => setSavedAll(false), 2000);
    } catch (e: any) {
      alert(e?.message || "Could not save grades");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <select
              className="w-48 max-w-xs rounded-md border-[var(--card-border)] px-3 py-2 bg-transparent text-transparent"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {`${c.code} — ${c.name}`}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--fg)] text-sm">
              {courseId
                ? cropString(`${courses.find((x) => x.id === courseId)?.code || ""} — ${courses.find((x) => x.id === courseId)?.name || ""}`, 48)
                : "Select course"}
            </span>
          </div>
          <div className="relative">
            <select
              className="w-48 max-w-xs rounded-md border-[var(--card-border)] px-3 py-2 bg-transparent text-transparent"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!courseId}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {`${s.code} — ${s.title}`}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--fg)] text-sm">
              {subjectId
                ? cropString(`${subjects.find((x) => x.id === subjectId)?.code || ""} — ${subjects.find((x) => x.id === subjectId)?.title || ""}`, 48)
                : "Select subject"}
            </span>
          </div>
          <div className="ml-auto">
            <Button
              className="border-0 cursor-pointer"
              onClick={saveAll}
              disabled={saving || !subjectId}
              size="sm"
            >
              {saving ? "Saving..." : savedAll ? "Saved" : "Save all"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div>Loading grades…</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto divide-y divide-[var(--card-border)]">
                <thead>
                  <tr className="text-left text-sm text-muted">
                    <th className="p-3">Student</th>
                    <th className="p-3">Student No</th>
                    <th className="p-3">Prelim</th>
                    <th className="p-3">Midterm</th>
                    <th className="p-3">Finals</th>
                    <th className="p-3 text-center">Remarks</th>
                    <th className="p-3 text-center">Final Grade</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const g = gradesMap[s.id] || {
                      prelim: "",
                      midterm: "",
                      finals: "",
                    };
                    const hasAnyScore = [g.prelim, g.midterm, g.finals].some(
                      (v) => v !== "" && v !== null && v !== undefined,
                    );
                    const localFinal = computeFinalGrade(g);
                    const displayedRemarks =
                      g.remarks ?? computeRemarks(localFinal);
                    return (
                      <tr key={s.id} className="border-t">
                        <td className="p-3">
                          {s.first_name} {s.last_name}
                        </td>
                        <td className="p-3 text-sm text-muted">
                          {s.student_no}
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={String(g.prelim ?? "")}
                            onChange={(e) =>
                              onChangeGrade(s.id, "prelim", e.target.value)
                            }
                            className={`w-40 py-2 text-center ${
                              !isValidScore(String(g.prelim ?? ""))
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={String(g.midterm ?? "")}
                            onChange={(e) =>
                              onChangeGrade(s.id, "midterm", e.target.value)
                            }
                            className={`w-40 py-2 text-center ${
                              !isValidScore(String(g.midterm ?? ""))
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={String(g.finals ?? "")}
                            onChange={(e) =>
                              onChangeGrade(s.id, "finals", e.target.value)
                            }
                            className={`w-40 py-2 text-center ${
                              !isValidScore(String(g.finals ?? ""))
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <div className="text-sm text-[var(--muted)]">
                            {computeRemarks(localFinal) ?? "—"}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="text-sm w-14 mx-auto">
                            {localFinal ?? "—"}
                          </div>
                        </td>
                        <td className="p-3 text-center flex items-center justify-center border-0 cursor-pointer">
                          <Button
                            className="border-0 cursor-pointer"
                            onClick={() => saveRow(s.id)}
                            disabled={
                              !subjectId ||
                              saving ||
                              !hasAnyScore ||
                              savingRows[s.id]
                            }
                            size="sm"
                          >
                            {savingRows[s.id]
                              ? "Saving..."
                              : savedRows[s.id]
                                ? "Saved"
                                : "Save"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
