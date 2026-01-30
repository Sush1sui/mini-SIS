"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    <header className="w-full border-b px-8 py-6 bg-[var(--surface)]/60 backdrop-blur-sm h-[60px] flex items-center">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-4 text-2xl font-semibold text-[var(--fg)] mr-6"
          >
            <div className="h-10 w-10 rounded-full bg-[var(--primary)]/90" />
            <span className="ml-2">Mini SIS</span>
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
                className="text-base text-[var(--fg)]/90 hover:underline ml-4"
              >
                Students
              </Link>
              <Link
                href="/courses"
                className="text-base text-[var(--fg)]/90 hover:underline ml-4"
              >
                Courses
              </Link>
              <Link
                href="/grades"
                className="text-base text-[var(--fg)]/90 hover:underline ml-4"
              >
                Grades
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <ShadButton
              variant="ghost"
              className="border-[#ffffff] border-1 px-[10px] py-[4px] cursor-pointer"
              onClick={handleSignOut}
            >
              Sign out
            </ShadButton>
          ) : (
            <ShadButton
              variant="ghost"
              className="border-[#ffffff] border-1 px-[10px] py-[4px] cursor-pointer"
              onClick={() => router.replace("/login")}
            >
              Sign in
            </ShadButton>
          )}
        </div>
      </div>
    </header>
  );
}
