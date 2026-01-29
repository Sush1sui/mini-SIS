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
          <div>
            <label className="text-xs text-muted">Code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="BSCS"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create course"}
          </Button>
        </form>
      </div>
    </Protected>
  );
}
