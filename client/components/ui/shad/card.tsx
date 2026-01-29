"use client";
import React from "react";

export function ShadCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border p-4 bg-[var(--card-bg)] border-[var(--card-border)] shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default ShadCard;
