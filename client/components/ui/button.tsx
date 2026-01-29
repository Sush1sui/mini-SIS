import React from "react";
import ShadButton from "./shad/button";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "primary";
  size?: "sm" | "md" | "lg";
};

// Backwards-compatible wrapper that maps old variants to the new ShadButton variants.
export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  // map old variants to new ShadButton variants
  // map 'default' and 'primary' to the new 'primary' variant
  const map: Record<string, string> = {
    primary: "primary",
    ghost: "ghost",
    default: "primary",
  };
  const v = (map[variant] as "primary" | "outline" | "ghost") || "primary";
  const extra = v === "primary" ? "text-white" : "";
  const finalClass = [extra, className].filter(Boolean).join(" ");
  return (
    <ShadButton variant={v} size={size} className={finalClass} {...props} />
  );
}
