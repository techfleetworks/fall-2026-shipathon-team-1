import { HandHeart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-brand text-ink-on-brand">
        <HandHeart size={18} aria-hidden />
      </span>
      <span className="text-heading-2 text-ink">My Village</span>
    </span>
  );
}
