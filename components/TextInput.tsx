"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    FieldProps {}

const fieldBase =
  "text-body w-full rounded-md border bg-surface-100 px-3 py-2.5 text-ink placeholder:text-ink-subtle transition-colors duration-150 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-brand/40";

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={fieldId} className="text-label text-ink-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={cn(
            fieldBase,
            error ? "border-error focus:border-error" : "border-border",
            className,
          )}
          {...rest}
        />
        {error ? (
          <p className="text-caption text-error">{error}</p>
        ) : hint ? (
          <p className="text-caption text-ink-subtle">{hint}</p>
        ) : null}
      </div>
    );
  },
);
TextInput.displayName = "TextInput";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldProps {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={fieldId} className="text-label text-ink-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={cn(
            fieldBase,
            "min-h-[80px] resize-none",
            error ? "border-error focus:border-error" : "border-border",
            className,
          )}
          {...rest}
        />
        {error ? (
          <p className="text-caption text-error">{error}</p>
        ) : hint ? (
          <p className="text-caption text-ink-subtle">{hint}</p>
        ) : null}
      </div>
    );
  },
);
TextArea.displayName = "TextArea";
