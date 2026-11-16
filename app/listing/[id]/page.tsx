"use client";

import { useParams, useRouter } from "next/navigation";
import { MapPin, PackageCheck } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { InterestQueue } from "@/components/InterestQueue";
import { PostedAgo } from "@/components/TimeText";
import { useStore, queueOf } from "@/lib/store";
import { CATEGORY_LABEL } from "@/lib/utils";

export default function ListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getItem, giver, bundles, markGone } = useStore();
  const item = getItem(params.id);

  if (!item) {
    return (
      <>
        <TopBar title="Listing" showBack backHref="/" showBell={false} />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-heading-3 text-ink">This listing isn&apos;t available</p>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to home
          </Button>
        </main>
      </>
    );
  }

  const bundle = bundles.find((b) => b.id === item.bundleId);
  const postedAt = bundle?.createdAt ?? new Date().toISOString();
  const waiting = queueOf(item).length;
  const canMarkGone = item.status === "accepted" || item.status === "requested";

  return (
    <>
      <TopBar title="Your listing" showBack />
      <main className="flex-1 overflow-y-auto pb-28">
        {/* Poster row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar src={giver.avatar} name={giver.name} />
          <div className="min-w-0 flex-1">
            <p className="text-heading-3 text-ink">{giver.name}</p>
            <p className="text-caption text-ink-subtle">
              <PostedAgo iso={postedAt} />
            </p>
          </div>
          <span className="text-caption text-ink-subtle inline-flex items-center gap-1">
            <MapPin size={13} aria-hidden /> 1.2 km away
          </span>
        </div>

        {/* Horizontal photo gallery */}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-4">
          {item.photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${item.name} photo ${i + 1}`}
              className="aspect-square w-[78%] shrink-0 snap-center rounded-lg object-cover"
            />
          ))}
        </div>

        <div className="flex flex-col gap-5 px-4 py-4">
          {/* Name + status */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-heading-1 text-ink">{item.name}</h1>
            </div>
            <div>
              <StatusBadge item={item} />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <Meta label="Size / fit" value={item.sizeFit} />
            <Meta label="Condition" value={item.condition} />
          </div>
          <Meta
            label="Flaws"
            value={item.flaws || "None noted"}
            full
          />
          <p className="text-caption text-ink-subtle">
            Category: {CATEGORY_LABEL[item.category]}
          </p>

          {/* Interest bar */}
          <section className="flex flex-col gap-3">
            <h2 className="text-heading-2 text-ink">
              {item.status === "accepted"
                ? "Pickup"
                : waiting > 0
                  ? `${waiting} ${waiting === 1 ? "person" : "people"} interested`
                  : "Interest"}
            </h2>
            <InterestQueue item={item} />
          </section>
        </div>
      </main>

      {canMarkGone && (
        <div className="sticky bottom-0 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<PackageCheck size={18} aria-hidden />}
            onClick={() => markGone(item.id)}
          >
            Mark as gone
          </Button>
        </div>
      )}
    </>
  );
}

function Meta({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="text-caption text-ink-subtle">{label}</p>
      <p className="text-body-medium text-ink mt-0.5">{value}</p>
    </div>
  );
}
