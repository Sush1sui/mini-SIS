"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import apiFetch from "../../../lib/api";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import Protected from "../../../components/Protected";

export default function NewCourse() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/courses", {
        method: "POST",
        body: JSON.stringify({ code, name, description }),
      });
      router.push(`/courses/${res.data.id}`);
    } catch (e: any) {
      alert(e?.message || "Could not create course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Protected>
      <div className="max-w-md">
        <h2 className="text-lg font-semibold mb-4">New course</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="my-[10px]">
            <label className="text-xs text-muted">Code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="py-[5px] px-[7px] mt-[5px]"
              placeholder="BSCS"
            />
          </div>
          <div className="my-[10px]">
            <label className="text-xs text-muted">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="py-[5px] px-[7px] mt-[5px]"
            />
          </div>
          <div className="my-[10px]">
            <label className="text-xs text-muted">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="py-[5px] px-[7px] mt-[5px]"
            />
          </div>
          <div className="w-full flex justify-center items-center mt-[10px]">
            <Button
              type="submit"
              variant="primary"
              className="w-[300px] mt-[10px] text-[var(--danger)] cursor-pointer border-none py-[8px] px-[10px]"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create course"}
            </Button>
          </div>
        </form>
      </div>
    </Protected>
  );
}
