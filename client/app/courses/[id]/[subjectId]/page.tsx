"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import apiFetch from "../../../../lib/api";
import Protected from "../../../../components/Protected";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import Link from "next/dist/client/link";
import Loading from "@/components/loading";

export default function SubjectEditPage() {
  const pathname = usePathname() || "";
  // expected path: /courses/:courseId/:subjectId
  const parts = pathname.split("/").filter(Boolean);
  const courseId = parts[1] || "";
  const subjectId = parts[2] || "";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState("3");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (!subjectId) return;
        const res = await apiFetch(`/subjects/${subjectId}`);
        if (!mounted) return;
        const s = res.data;
        setCode(s.code || "");
        setTitle(s.title || "");
        setUnits(String(s.units ?? "3"));
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
  }, [subjectId]);

  async function save(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!subjectId) return;
    setSaving(true);
    try {
      const body = { code, title, units: Number(units) };
      await apiFetch(`/subjects/${subjectId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      // go back to course page
      router.push(`/courses/${courseId}`);
    } catch (err: any) {
      alert(err?.message || "Could not save subject");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!subjectId) return;
    if (!confirm("Delete this subject? This cannot be undone.")) return;
    try {
      await apiFetch(`/subjects/${subjectId}`, { method: "DELETE" });
      router.push(`/courses/${courseId}`);
    } catch (err: any) {
      alert(err?.message || "Could not delete subject");
    }
  }

  if (loading)
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loading message="Loading subject…" />
      </div>
    );

  return (
    <Protected>
      <div className="max-w-3xl mx-auto mt-8">
        <Link href={`/courses/${courseId}`}>
          <Button className="mt-[20px] border-0 cursor-pointer text-[#ffffff] px-[15px] py-[7px]">
            &larr; Back to course
          </Button>
        </Link>
        <h2 className="text-lg font-semibold mb-4">Edit subject</h2>
        <form onSubmit={save} className="space-y-4">
          <div className="my-[10px]">
            <label className="text-xs text-muted">Code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 px-[15px] py-[7px]"
            />
          </div>
          <div className="my-[10px]">
            <label className="text-xs text-muted">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 px-[15px] py-[7px]"
            />
          </div>
          <div className="my-[10px]">
            <label className="text-xs text-muted">Units</label>
            <Input
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="mt-1 px-[15px] py-[7px]"
            />
          </div>

          <div className="flex items-center justify-evenly w-full mt-[20px]">
            <Button
              type="submit"
              className="border-0 text-[#ffffff] px-[15px] py-[7px] cursor-pointer"
              disabled={saving || loading}
            >
              {saving ? "Saving…" : "Save"}
            </Button>

            <Button
              type="button"
              onClick={remove}
              disabled={saving || loading}
              className="border-0 text-[var(--danger)] text-[#ffffff] px-[15px] py-[7px] cursor-pointer"
            >
              Delete
            </Button>
          </div>
        </form>
      </div>
    </Protected>
  );
}
