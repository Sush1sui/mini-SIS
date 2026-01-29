"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import apiFetch from "../../../lib/api";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import Protected from "../../../components/Protected";

export default function CourseManagePage() {
  const pathname = usePathname();
  const id = pathname ? (pathname.split("/").pop() as string) : "";
  const [course, setCourse] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState("3");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const c = await apiFetch(`/courses/${id}`);
        const s = await apiFetch(`/subjects?courseId=${id}&limit=200`);
        if (!mounted) return;
        setCourse(c.data);
        setSubjects(s.data || []);
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

  async function addSubject(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await apiFetch("/subjects", {
        method: "POST",
        body: JSON.stringify({
          course_id: id,
          code,
          title,
          units: Number(units),
        }),
      });
      setSubjects((prev) => [res.data, ...prev]);
      setCode("");
      setTitle("");
      setUnits("3");
    } catch (e: any) {
      alert(e?.message || "Could not create subject");
    }
  }

  if (loading) return <div>Loading…</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <Protected>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {course.code} — {course.name}
              </h3>
              <div className="text-sm text-muted">{course.description}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="mb-3 font-medium">Add subject</h4>
          <form onSubmit={addSubject} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Input
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="units"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
            </div>
            <Button type="submit">Create subject</Button>
          </form>
        </Card>

        <div>
          <h4 className="mb-3 font-medium">Subjects</h4>
          <div className="grid gap-3">
            {subjects.map((s) => (
              <Card key={s.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {s.code} — {s.title}
                  </div>
                  <div className="text-xs text-muted">Units: {s.units}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Protected>
  );
}
