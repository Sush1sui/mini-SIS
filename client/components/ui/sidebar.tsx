"use client";
import Link from "next/link";
import React from "react";
import ShadCard from "./shad/card";

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <nav className="sticky top-6 space-y-4">
        <ShadCard>
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/"
                className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/students"
                className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Students
              </Link>
            </li>
            <li>
              <Link
                href="/courses"
                className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Courses
              </Link>
            </li>
            <li>
              <Link
                href="/grades"
                className="block rounded px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Grades
              </Link>
            </li>
          </ul>
        </ShadCard>
      </nav>
    </aside>
  );
}
