"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  href?: string;
  onClick?: () => void;
  /** Warm accent treatment for "you have news" banners. */
  accent?: boolean;
  className?: string;
}

export function ActionCard({
  icon,
  title,
  description,
  actionLabel,
  href,
  onClick,
  accent,
  className,
}: ActionCardProps) {
  const inner = (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-md p-3 text-left shadow-sm transition-colors duration-150",
        accent
          ? "bg-brand-subtle border border-brand/30 hover:bg-brand-muted"
          : "bg-surface-200 border border-border-subtle hover:bg-surface-300/60",
        className,
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md",
          accent ? "bg-brand text-ink-on-brand" : "bg-surface-100 text-brand border border-border-subtle",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-heading-3 text-ink">{title}</span>
        {description && (
          <span className="text-body text-ink-muted mt-0.5">{description}</span>
        )}
        {actionLabel && (
          <span className="text-label text-brand mt-2 inline-flex items-center gap-0.5">
            {actionLabel}
            <ChevronRight size={16} aria-hidden />
          </span>
        )}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md">
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md"
    >
      {inner}
    </button>
  );
}
