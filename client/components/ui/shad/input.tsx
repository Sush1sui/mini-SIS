"use client";
import React from "react";
import { cn } from "../../../lib/utils";

export function ShadInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border px-3 py-2 text-sm bg-transparent placeholder:text-[var(--muted)] text-[var(--fg)] border-[var(--card-border)]",
        props.className || "",
      )}
    />
  );
}

export default ShadInput;
