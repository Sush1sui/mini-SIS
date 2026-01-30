"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiFetch from "../../../lib/api";
import Protected from "../../../components/Protected";
import ShadInput from "../../../components/ui/shad/input";
import ShadButton from "../../../components/ui/shad/button";
import ShadCard from "../../../components/ui/shad/card";

export default function NewStudentForm() {
  const router = useRouter();
  const [studentNo, setStudentNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiFetch("/courses?limit=100")
      .then((d) => {
        if (mounted) setCourses(d.data || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify({
          student_no: studentNo,
          first_name: firstName,
          last_name: lastName,
          course_id: courseId,
        }),
      });
      router.push(`/students/${res.data.id}`);
    } catch (e: any) {
      alert(e?.message || "Could not create student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Protected>
      <ShadCard className="max-w-md p-[10px] mt-[32px]">
        <h2 className="text-lg font-semibold mb-4">New student</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="my-[10px]">
            <label className="text-xs text-[var(--muted)]">Student no</label>
            <ShadInput
              value={studentNo}
              className="py-[5px] px-[7px] mt-[5px]"
              onChange={(e) => setStudentNo(e.target.value)}
              placeholder="S1234"
            />
          </div>
          <div className="my-[10px]">
            <label className="text-xs text-[var(--muted)]">First name</label>
            <ShadInput
              value={firstName}
              className="py-[5px] px-[7px] mt-[5px]"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="my-[10px]">
            <label className="text-xs text-[var(--muted)]">Last name</label>
            <ShadInput
              value={lastName}
              className="py-[5px] px-[7px] mt-[5px]"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="my-[10px]">
            <label className="text-xs text-[var(--muted)]">Course</label>
            <select
              className="rounded-md border px-3 py-2 w-full bg-transparent border-[var(--card-border)] text-[var(--fg)] mt-[5px]"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Choose course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {`${c.code} — ${c.name}`}
                </option>
              ))}
            </select>
          </div>
          <div className="w-[100%] flex items-center justify-center">
            <ShadButton
              type="submit"
              className="w-[300px] mt-[10px] text-[var(--danger)] cursor-pointer border-none py-[8px] px-[10px]"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create student"}
            </ShadButton>
          </div>
        </form>
      </ShadCard>
    </Protected>
  );
}
