import { CheckCircle2, PackageCheck, Users, Sparkles } from "lucide-react";
import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";
import { queueOf } from "@/lib/store";

type Tone = "highlight" | "info" | "success" | "muted" | "neutral";

const toneClass: Record<Tone, string> = {
  highlight: "bg-brand-subtle text-ink border border-brand/40",
  info: "bg-surface-200 text-ink-muted border border-border-subtle",
  success: "bg-surface-200 text-success border border-border-subtle",
  muted: "bg-surface-300 text-ink-subtle border border-border-subtle",
  neutral: "bg-surface-100 text-ink-muted border border-border",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-caption inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium",
        toneClass[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * Status is the single source of truth and always paired with an
 * icon + label (never color alone). Labels are specific where possible.
 */
export function StatusBadge({ item, className }: { item: Item; className?: string }) {
  const waiting = queueOf(item).length;

  if (item.status === "gone") {
    return (
      <Badge tone="muted" icon={<PackageCheck size={14} aria-hidden />} className={className}>
        Gone
      </Badge>
    );
  }
  if (item.status === "accepted") {
    return (
      <Badge tone="success" icon={<CheckCircle2 size={14} aria-hidden />} className={className}>
        Accepted — pickup pending
      </Badge>
    );
  }
  if (item.status === "requested" || waiting > 0) {
    return (
      <Badge tone="info" icon={<Users size={14} aria-hidden />} className={className}>
        {waiting} {waiting === 1 ? "person" : "people"} interested
      </Badge>
    );
  }
  // available, nobody yet
  return (
    <Badge tone="highlight" icon={<Sparkles size={14} aria-hidden />} className={className}>
      First one to claim
    </Badge>
  );
}
