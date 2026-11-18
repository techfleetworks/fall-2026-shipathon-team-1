"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "tertiary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

const base =
  "text-button inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-100 disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-ink-on-brand hover:bg-brand-hover active:bg-brand-hover disabled:bg-surface-300 disabled:text-ink-subtle",
  secondary:
    "bg-surface-100 text-ink border border-border hover:bg-surface-200 active:bg-surface-200 disabled:bg-surface-300 disabled:text-ink-subtle disabled:border-border-subtle",
  tertiary:
    "bg-transparent text-ink hover:bg-surface-200 active:bg-surface-200 disabled:text-ink-subtle px-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", fullWidth, leftIcon, className, children, ...rest },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          base,
          variants[variant],
          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {leftIcon}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
