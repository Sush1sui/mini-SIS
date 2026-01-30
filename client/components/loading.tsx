"use client";
import React from "react";

type LoadingProps = {
  message?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function Loading({
  message = "Loading",
  size = "md",
  className = "",
}: LoadingProps) {
  const dotSize = size === "sm" ? 6 : size === "lg" ? 12 : 8;

  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="text-sm text-[var(--muted)] mb-[20px]">{message}</div>

      <div
        className="loading-dots inline-flex items-end"
        aria-hidden
        style={{ gap: 6 }}
      >
        <span
          className="dot"
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: 9999,
            background: "var(--fg)",
            display: "inline-block",
          }}
        />
        <span
          className="dot"
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: 9999,
            background: "var(--fg)",
            display: "inline-block",
          }}
        />
        <span
          className="dot"
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: 9999,
            background: "var(--fg)",
            display: "inline-block",
          }}
        />
      </div>

      <style>{`
        .loading-dots .dot { opacity: 0.25; transform: translateY(0); }
        .loading-dots .dot:nth-child(1) { animation: ld 900ms infinite; animation-delay: 0ms; }
        .loading-dots .dot:nth-child(2) { animation: ld 900ms infinite; animation-delay: 120ms; }
        .loading-dots .dot:nth-child(3) { animation: ld 900ms infinite; animation-delay: 240ms; }

        @keyframes ld {
          0% { opacity: 0.25; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-6px); }
          60% { opacity: 0.5; transform: translateY(0); }
          100% { opacity: 0.25; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
