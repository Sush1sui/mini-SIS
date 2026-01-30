"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import apiFetch from "../../lib/api";
import ShadInput from "../../components/ui/shad/input";
import ShadButton from "../../components/ui/shad/button";
import ShadCard from "../../components/ui/shad/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      // notify other client components to refresh auth state
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("auth"));
      router.push("/students");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full min-w-[340px] max-w-[540px] px-6">
        <ShadCard className="glass-card">
          <div className="text-center mb-4">
            <div className="login-avatar">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                  fill="rgba(255,255,255,0.2)"
                />
                <path
                  d="M4 20c0-3.3137 2.6863-6 6-6h4c3.3137 0 6 2.6863 6 6v0H4z"
                  fill="rgba(255,255,255,0.04)"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--fg)]">
              Admin sign in
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Use your admin credentials to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="my-[12px]">
              <label className="text-xs text-[var(--muted)]">Email</label>
              <div className="mt-1">
                <ShadInput
                  value={email}
                  className="py-[5px] px-[7px]"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="my-[12px]">
              <label className="text-xs text-[var(--muted)]">Password</label>
              <div className="mt-1">
                <ShadInput
                  type="password"
                  value={password}
                  className="py-[5px] px-[7px]"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 my-[12px]">{error}</div>
            )}

            <div className="mt-[20px]">
              <ShadButton
                type="submit"
                size="md"
                className="login-cta border-none cursor-pointer text-[var(--danger)] h-[30px]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </ShadButton>
            </div>
          </form>
        </ShadCard>
      </div>
    </div>
  );
}
