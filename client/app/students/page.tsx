"use client";
import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/api";
import Link from "next/link";
import Protected from "../../components/Protected";
import ShadCard from "../../components/ui/shad/card";
import ShadButton from "../../components/ui/shad/button";
import ShadInput from "../../components/ui/shad/input";
import RecentStudents from "../../components/RecentStudents";
import Loading from "@/components/loading";

function StudentsList() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchStudents(search = "") {
      try {
        setLoading(true);
        const url = search
          ? `/students?limit=200&search=${encodeURIComponent(search)}`
          : "/students?limit=200";
        const d = await apiFetch(url);
        if (mounted) setStudents(d.data || []);
      } catch (e) {
        // ignore
      } finally {
        mounted && setLoading(false);
      }
    }

    fetchStudents(q);

    return () => {
      mounted = false;
    };
  }, []);

  // when query changes, debounce and fetch
  useEffect(() => {
    const t = setTimeout(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const url = q
            ? `/students?limit=200&search=${encodeURIComponent(q)}`
            : "/students?limit=200";
          const d = await apiFetch(url);
          if (mounted) setStudents(d.data || []);
        } catch (e) {
          // ignore
        } finally {
          mounted && setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, 1000);
    return () => clearTimeout(t);
  }, [q]);

  async function deleteStudent(id: string) {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    try {
      await apiFetch(`/students/${id}`, { method: "DELETE" });
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      alert(e?.message || "Could not delete student");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Students</h2>
          <div className="text-sm text-[var(--muted)] mb-[4px]">
            Manage your students
          </div>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto mb-[12px]">
          <ShadInput
            className="h-[20px] p-[5px] w-[200px] mr-[20px]"
            placeholder="Search students..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link href="/students/new">
            <ShadButton className="border-none cursor-pointer text-[#ffffff] bg-[var(--primary)] py-[5px] px-[10px]">
              New student
            </ShadButton>
          </Link>
        </div>
      </div>
      {loading ? (
        <div>
          <Loading message="Loading students…" />
        </div>
      ) : (
        <div className="grid gap-4">
          {students
            .filter((s) => {
              if (!q) return true;
              const t = (
                s.first_name +
                " " +
                s.last_name +
                " " +
                s.student_no
              ).toLowerCase();
              return t.includes(q.toLowerCase());
            })
            .map((s) => (
              <ShadCard
                key={s.id}
                className="flex items-center justify-between gap-4 py-[4px] px-[10px]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--fg)] truncate">
                    {s.first_name} {s.last_name}
                  </div>
                  <div className="text-xs text-[var(--muted)] truncate">
                    {s.student_no} — {s.course_id}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/students/${s.id}`}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    View
                  </Link>
                  <ShadButton
                    onClick={() => deleteStudent(s.id)}
                    className="border-none cursor-pointer text-[var(--danger)] ml-[10px] px-[10px] py-[5px]"
                  >
                    Delete
                  </ShadButton>
                </div>
              </ShadCard>
            ))}
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Protected>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <StudentsList />
        </div>
        <div className="md:col-span-1">
          <RecentStudents />
        </div>
      </div>
    </Protected>
  );
}
