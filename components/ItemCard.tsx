import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Item } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CATEGORY_LABEL } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
  distance?: string;
  href?: string;
  showStatus?: boolean;
}

/** Whole card is the tap target. */
export function ItemCard({
  item,
  distance = "1.2 km away",
  href,
  showStatus = true,
}: ItemCardProps) {
  const content = (
    <article className="flex gap-3 rounded-md border border-border-subtle bg-surface-200 p-3 shadow-sm transition-colors duration-150 hover:bg-surface-300/50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.photos[0]}
        alt={`${item.name} — ${CATEGORY_LABEL[item.category]}`}
        className="size-20 shrink-0 rounded-md object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-heading-3 truncate text-ink">{item.name}</h3>
        </div>
        <p className="text-caption text-ink-muted mt-0.5">
          {item.sizeFit} · {item.condition}
        </p>
        <p className="text-caption text-ink-subtle mt-0.5 inline-flex items-center gap-1">
          <MapPin size={13} aria-hidden /> {distance}
        </p>
        {showStatus && (
          <div className="mt-2">
            <StatusBadge item={item} />
          </div>
        )}
      </div>
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {content}
      </Link>
    );
  }
  return content;
}
