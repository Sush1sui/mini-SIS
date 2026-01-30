"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import apiFetch from "../../../lib/api";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import Protected from "../../../components/Protected";
import Loading from "@/components/loading";
import Link from "next/link";

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

  async function deleteSubject(idToDelete: string) {
    if (!confirm("Delete this subject? This cannot be undone.")) return;
    try {
      await apiFetch(`/subjects/${idToDelete}`, { method: "DELETE" });
      setSubjects((prev) => prev.filter((s) => s.id !== idToDelete));
    } catch (e: any) {
      alert(e?.message || "Could not delete subject");
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loading message="Loading…" />
      </div>
    );
  if (!course) return <div>Course not found</div>;

  return (
    <Protected>
      <div className="space-y-6 mt-[20px]">
        <Card className="my-[20px]">
          <div className="flex items-center justify-between">
            <div className="px-[10px]">
              <h3 className="text-lg font-semibold">
                {course.code} — {course.name}
              </h3>
              <div className="text-sm text-muted mb-[10px]">
                {course.description}
              </div>
            </div>
          </div>
        </Card>

        <Card className="my-[20px] px-[10px] pb-[10px]">
          <h4 className="font-medium">Add subject</h4>
          <form onSubmit={addSubject} className="space-y-3">
            <div className="flex flex-col gap-3">
              <div className="w-full flex flex-col my-[10px]">
                <label className="text-xs text-muted">Code</label>
                <Input
                  placeholder="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="py-[5px] px-[7px]"
                  style={{
                    width: "100px",
                  }}
                />
              </div>
              <div className="w-full flex flex-col my-[10px]">
                <label className="text-xs text-muted">Title</label>
                <Input
                  placeholder="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="py-[5px] px-[7px]"
                  style={{
                    width: "200px",
                  }}
                />
              </div>
              <div className="w-full flex flex-col my-[10px]">
                <label className="text-xs text-muted">Units</label>
                <Input
                  placeholder="units"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="py-[5px] px-[7px]"
                  style={{
                    width: "100px",
                  }}
                />
              </div>
            </div>
            <Button
              className="border-0 cursor-pointer py-[7px] px-[15px] text-[#ffffff] mt-[10px]"
              type="submit"
            >
              Create subject
            </Button>
          </form>
        </Card>

        <div>
          <h4 className="mb-3 font-medium">Subjects</h4>
          <div className="grid gap-3">
            {subjects.map((s) => (
              <Card
                key={s.id}
                className="flex items-center justify-between px-[10px] py-[8px] my-[5px]"
              >
                <div>
                  <div className="text-sm font-medium">
                    {s.code} — {s.title}
                  </div>
                  <div className="text-xs text-muted">Units: {s.units}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/${course.id}/${s.id}`}
                    className="text-sm text-muted hover:underline"
                  >
                    Manage
                  </Link>
                  <Button
                    onClick={() => deleteSubject(s.id)}
                    className="text-sm text-[var(--danger)] border-0 cursor-pointer px-[10px] py-[5px] ml-[10px]"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Protected>
  );
}
