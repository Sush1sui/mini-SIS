import React from "react";

export const Card: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className = "" }) => {
  return (
    <div
      className={`card p-6 ${className}`}
      style={{ transform: "translateY(0)", opacity: 1 }}
    >
      {children}
    </div>
  );
};
