"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
  /** Dashed quick-reply style used in chat. */
  dashed?: boolean;
  className?: string;
}

export function Chip({
  label,
  selected,
  onClick,
  onDismiss,
  dashed,
  className,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "text-label inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        dashed
          ? "border border-dashed border-border-strong bg-surface-100 text-ink hover:bg-surface-200"
          : selected
            ? "border border-brand bg-brand-subtle text-ink"
            : "border border-border bg-surface-100 text-ink hover:bg-surface-200",
        className,
      )}
    >
      {label}
      {selected && onDismiss && (
        <span
          role="button"
          tabIndex={-1}
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="-mr-1 rounded-full p-0.5 hover:bg-brand-muted"
        >
          <X size={14} aria-hidden />
        </span>
      )}
    </button>
  );
}
