"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from "../lib/api";
import ShadCard from "./ui/shad/card";

export default function RecentStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch("/students/recent")
      .then((d) => {
        if (mounted) setStudents(d.data || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <ShadCard className="max-w-md">
        <div>Loading…</div>
      </ShadCard>
    );

  if (!students || students.length === 0)
    return (
      <ShadCard className="max-w-md">
        <div className="text-sm text-[var(--muted)]">No recent students</div>
      </ShadCard>
    );

  return (
    <ShadCard className="max-w-md">
      <h3 className="text-sm font-medium mb-2">Recent students</h3>
      <div className="space-y-2">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                {s.first_name} {s.last_name}
              </div>
              <div className="text-xs text-[var(--muted)]">{s.student_no}</div>
            </div>
            <div>
              <Link
                href={`/students/${s.id}`}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </ShadCard>
  );
}
