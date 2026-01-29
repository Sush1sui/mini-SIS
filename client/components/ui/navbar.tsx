"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import ShadButton from "./shad/button";
import apiFetch from "../../lib/api";
import useAuth from "../../lib/useAuth";

export default function Navbar() {
  const { user, loading } = useAuth();

  const router = useRouter();
  async function handleSignOut() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    // notify client listeners to refresh auth state (if any)
    if (typeof window !== "undefined") window.dispatchEvent(new Event("auth"));
    router.push("/login");
  }

  return (
    <header className="w-full border-b px-6 py-4 bg-[var(--surface)]/60 backdrop-blur-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-semibold text-[var(--fg)] mr-6"
          >
            <div className="h-8 w-8 rounded-full bg-[var(--primary)]/90" />
            <span className="ml-1">Mini SIS</span>
          </Link>

          {/* fixed spacer to guarantee gap between brand and links */}
          <div className="w-6" />

          {user && (
            <nav
              className="nav-links flex items-center whitespace-nowrap"
              style={{ marginLeft: 24, columnGap: 16 }}
            >
              <Link
                href="/students"
                className="text-sm text-[var(--fg)]/90 hover:underline ml-4"
              >
                Students
              </Link>
              <Link
                href="/courses"
                className="text-sm text-[var(--fg)]/90 hover:underline ml-4"
              >
                Courses
              </Link>
              <Link
                href="/grades"
                className="text-sm text-[var(--fg)]/90 hover:underline ml-4"
              >
                Grades
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <ShadButton variant="ghost" onClick={handleSignOut}>
              Sign out
            </ShadButton>
          ) : (
            <ShadButton variant="ghost" onClick={() => router.push("/login")}>
              Sign in
            </ShadButton>
          )}
        </div>
      </div>
    </header>
  );
}
