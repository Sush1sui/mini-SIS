"use client";
import React from "react";
import { cn } from "../../../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "discord";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
};

export default function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  icon,
  ...props
}: ButtonProps) {
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none";

  const variants: Record<string, string> = {
    primary:
      "text-white bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] shadow-lg hover:brightness-95",
    outline:
      "bg-transparent border border-[var(--card-border)] text-[var(--fg)] hover:bg-[var(--card-bg)]/60",
    ghost: "bg-transparent text-[var(--fg)] hover:bg-[var(--card-bg)]/40",
    discord:
      "text-white bg-[#111214] border border-[#2c2f33] hover:bg-[#1b1d20] shadow-[0_6px_18px_rgba(2,6,23,0.5)]",
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      {...props}
      className={cn(
        base,
        sizeClass,
        variants[variant] || variants.primary,
        className,
      )}
    >
      {icon ? <span className="flex items-center">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
