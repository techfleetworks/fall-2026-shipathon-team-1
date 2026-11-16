import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  /** 0-based index of the current step. */
  current: number;
}

/** Horizontal numbered steps with labels and connecting lines; linear. */
export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <ol className="flex items-start" aria-label="Progress">
      {steps.map((label, i) => {
        const complete = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            className={cn("flex flex-1 flex-col items-center", i === 0 && "items-start", i === steps.length - 1 && "items-end")}
          >
            <div className="flex w-full items-center">
              {i > 0 && (
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i <= current ? "bg-brand" : "bg-surface-300",
                  )}
                  aria-hidden
                />
              )}
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "text-caption flex size-7 items-center justify-center rounded-full border font-semibold",
                  complete && "bg-brand border-brand text-ink-on-brand",
                  active && "bg-brand-subtle border-brand text-ink",
                  !complete && !active && "bg-surface-100 border-border text-ink-subtle",
                )}
              >
                {complete ? <Check size={15} aria-hidden /> : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i < current ? "bg-brand" : "bg-surface-300",
                  )}
                  aria-hidden
                />
              )}
            </div>
            <span
              className={cn(
                "text-caption mt-1.5 text-center",
                active ? "text-ink font-medium" : "text-ink-subtle",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
