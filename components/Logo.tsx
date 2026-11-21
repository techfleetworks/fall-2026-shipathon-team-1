import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" aria-hidden className="size-8" />
      <span className="text-heading-2 text-ink">My Village</span>
    </span>
  );
}
