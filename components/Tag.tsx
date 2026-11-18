import { cn } from "@/lib/utils";

export type TagTone = "outline" | "amber" | "green" | "gray";

const tones: Record<TagTone, string> = {
  outline: "border border-brand/70 text-ink bg-transparent",
  amber: "bg-brand-subtle text-ink border border-brand-muted",
  green: "bg-positive-subtle text-positive border border-positive/30",
  gray: "bg-surface-300 text-ink-subtle border border-border-subtle",
};

/** Small status pill. Always pair tone with a label/icon, never colour alone. */
export function Tag({
  tone = "gray",
  icon,
  children,
  className,
}: {
  tone?: TagTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-caption inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
