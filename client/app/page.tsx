"use client";
import React, { useEffect, useState } from "react";
import apiFetch from "../lib/api";
import Link from "next/link";
import ShadCard from "../components/ui/shad/card";
import ShadButton from "../components/ui/shad/button";
import Protected from "../components/Protected";

export default function Dashboard() {
  const [studentsTotal, setStudentsTotal] = useState<number | null>(null);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // fetch exact count from the server
        const cnt = await apiFetch("/students/count");
        const recent = await apiFetch("/students/recent");
        const c = await apiFetch("/courses");
        if (!mounted) return;
        setStudentsTotal(
          typeof cnt?.data?.count === "number" ? cnt.data.count : 0,
        );
        setRecentStudents(recent?.data || []);
        setCourses(Array.isArray(c?.data) ? c.data : []);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Protected>
      <div>
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link href="/students/new">
              <ShadButton>New Student</ShadButton>
            </Link>
            <Link href="/courses/new">
              <ShadButton variant="outline">New Course</ShadButton>
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ShadCard className="p-4">
            <div className="text-sm text-muted">Total Students</div>
            <div className="mt-2 text-2xl font-bold">
              {loading ? "—" : studentsTotal}
            </div>
          </ShadCard>
          <ShadCard className="p-4">
            <div className="text-sm text-muted">Courses</div>
            <div className="mt-2 text-2xl font-bold">
              {loading ? "—" : courses.length}
            </div>
          </ShadCard>
          <ShadCard className="p-4">
            <div className="text-sm text-muted">Recent Activity</div>
            <div className="mt-2 text-2xl font-bold">{loading ? "—" : "—"}</div>
          </ShadCard>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-medium">Recent Students</h2>
          <div className="overflow-hidden rounded border">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-surface text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Student No</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  (recentStudents || []).slice(0, 10).map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="p-3">{s.student_no}</td>
                      <td className="p-3">
                        <Link
                          href={`/students/${s.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Protected>
  );
}
