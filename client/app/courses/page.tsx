"use client";
import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import Protected from "../../components/Protected";
import Loading from "@/components/loading";

function CoursesList() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch("/courses?limit=100")
      .then((d) => {
        if (mounted) setCourses(d.data || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await apiFetch(`/courses/${id}`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      alert(e?.message || "Could not delete course");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Courses</h2>
        <Link href="/courses/new">
          <Button className="py-[7px] px-[12px] border-none cursor-pointer text-[#ffffff]">
            New course
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loading message="Fetching courses" />
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((c: any) => (
            <Card
              key={c.id}
              className="flex items-center justify-between px-[10px] py-[8px] my-[5px]"
            >
              <div>
                <div className="text-sm font-medium">
                  {c.code} — {c.name}
                </div>
                <div className="text-xs text-muted">{c.description}</div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/courses/${c.id}`}
                  className="text-sm text-muted hover:underline"
                >
                  Manage
                </Link>
                <Button
                  onClick={() => deleteCourse(c.id)}
                  className="text-sm text-[var(--danger)] hover:underline border-0 cursor-pointer ml-[10px] px-[10px] py-[5px]"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Protected>
      <CoursesList />
    </Protected>
  );
}
