import { CheckCircle2, PackageCheck, Sparkles, Users } from "lucide-react";
import type { Item } from "@/lib/types";
import { Tag } from "@/components/Tag";
import { queueOf } from "@/lib/store";

/**
 * Item status is the single source of truth, always paired with an
 * icon + label. Mirrors the Figma badges on cards and item detail.
 */
export function StatusBadge({ item, userJoined, className }: { item: Item; userJoined?: boolean; className?: string }) {
  const waiting = queueOf(item).length;

  if (item.status === "gone") {
    return (
      <Tag tone="gray" icon={<PackageCheck size={13} aria-hidden />} className={className}>
        Gone
      </Tag>
    );
  }
  if (item.status === "accepted") {
    return (
      <Tag tone="green" icon={<CheckCircle2 size={13} aria-hidden />} className={className}>
        {userJoined ? "Your interest accepted" : "Accepted"}
      </Tag>
    );
  }
  if (waiting > 0) {
    const others = userJoined ? waiting - 1 : waiting;
    return (
      <Tag tone="outline" icon={<Users size={13} aria-hidden />} className={className}>
        {userJoined
          ? others > 0
            ? `You + ${others} more interested`
            : "You are interested"
          : `${waiting} ${waiting === 1 ? "person" : "people"} interested`}
      </Tag>
    );
  }
  return (
    <Tag tone="outline" icon={<Sparkles size={13} aria-hidden />} className={className}>
      First one to claim
    </Tag>
  );
}
