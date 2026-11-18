import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { Item } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { TimeAgo } from "@/components/TimeText";

interface ItemCardProps {
  item: Item;
  distance?: string;
  href?: string;
  timeIso?: string;
}

/**
 * Browse-result card (matches Figma): time + distance header, a two-photo
 * gallery, title with status badge, then condition / size columns.
 */
export function ItemCard({ item, distance, href, timeIso }: ItemCardProps) {
  const photos = item.photos.length >= 2 ? item.photos.slice(0, 2) : [item.photos[0], item.photos[0]];

  const content = (
    <article className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-surface-100 p-3 shadow-sm transition-colors duration-150 hover:bg-surface-200">
      {(timeIso || distance) && (
        <div className="flex items-center justify-between text-caption text-ink-subtle">
          <span className="inline-flex items-center gap-1">
            {timeIso && (
              <>
                <Clock size={12} aria-hidden /> <TimeAgo iso={timeIso} />
              </>
            )}
          </span>
          {distance && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} aria-hidden /> {distance}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`${item.name} photo ${i + 1}`}
            className="aspect-[4/3] w-full rounded-md object-cover"
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-heading-3 truncate text-ink">{item.name}</h3>
        <StatusBadge item={item} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Meta label="Condition" value={item.condition} />
        <Meta label="Size/Fit" value={item.sizeFit} />
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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-caption text-ink-subtle">{label}</p>
      <p className="text-body-medium text-ink truncate">{value}</p>
    </div>
  );
}
