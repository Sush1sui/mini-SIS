import React from "react";
import { cn } from "../../lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-md border border-[var(--card-border)] bg-transparent px-3 py-2 text-sm placeholder:opacity-60 text-[var(--fg)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-0",
          props.className,
        )}
      />
    );
  },
);

Input.displayName = "Input";
