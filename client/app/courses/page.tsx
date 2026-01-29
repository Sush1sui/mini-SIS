"use client";
import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/api";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import Protected from "../../components/Protected";

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Courses</h2>
        <Link href="/courses/new">
          <Button>New course</Button>
        </Link>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid gap-4">
          {courses.map((c: any) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">
                  {c.code} — {c.name}
                </div>
                <div className="text-xs text-muted">{c.description}</div>
              </div>
              <div>
                <Link
                  href={`/courses/${c.id}`}
                  className="text-sm text-muted hover:underline"
                >
                  Manage
                </Link>
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
