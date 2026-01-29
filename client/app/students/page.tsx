"use client";
import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/api";
import Link from "next/link";
import Protected from "../../components/Protected";
import ShadCard from "../../components/ui/shad/card";
import ShadButton from "../../components/ui/shad/button";
import ShadInput from "../../components/ui/shad/input";
import RecentStudents from "../../components/RecentStudents";

function StudentsList() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    apiFetch("/students?limit=20")
      .then((d) => {
        if (mounted) setStudents(d.data || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Students</h2>
          <div className="text-sm text-[var(--muted)]">
            Manage your student roster
          </div>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <ShadInput
            placeholder="Search students..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link href="/students/new">
            <ShadButton>New student</ShadButton>
          </Link>
        </div>
      </div>
      {loading ? (
        <div>Loading…</div>
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
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--fg)] truncate">
                    {s.first_name} {s.last_name}
                  </div>
                  <div className="text-xs text-[var(--muted)] truncate">
                    {s.student_no} — {s.course_id}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href={`/students/${s.id}`}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    View
                  </Link>
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
