"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/Button";
import { Badge } from "@/components/StatusBadge";
import { InterestQueue } from "@/components/InterestQueue";
import { PostedAgo } from "@/components/TimeText";
import { useStore, queueOf } from "@/lib/store";
import { cn } from "@/lib/utils";

type Filter = "all" | "sent" | "received";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
];

export default function MessagesPage() {
  const { bundles, allItems, getThreadByItem } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  const groups = useMemo(() => {
    return allItems
      .filter((item) => {
        const hasInterest = item.interests.some(
          (i) => i.state === "active" || i.state === "waiting",
        );
        const hasThread = Boolean(getThreadByItem(item.id));
        if (item.status === "gone") return false;
        if (filter === "received") return hasInterest && item.status === "requested";
        if (filter === "sent") return hasThread;
        return hasInterest || hasThread;
      })
      .map((item) => ({
        item,
        bundle: bundles.find((b) => b.id === item.bundleId),
      }));
  }, [allItems, bundles, filter, getThreadByItem]);

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <h1 className="text-heading-1 text-ink">Messages</h1>

        {/* Filter tabs */}
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Message filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "text-label rounded-full px-4 py-1.5 transition-colors",
                filter === f.key
                  ? "bg-brand text-ink-on-brand"
                  : "bg-surface-200 text-ink-muted hover:bg-surface-300/60",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {groups.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-surface-200 text-ink-muted">
              <Inbox size={26} aria-hidden />
            </span>
            <p className="text-heading-3 text-ink">No messages here yet</p>
            <p className="text-body text-ink-muted max-w-xs">
              When someone&apos;s interested in your give-aways, they&apos;ll line
              up here in the order they asked.
            </p>
            <Link href="/post">
              <Button>Give something away</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-5">
            {groups.map(({ item, bundle }) => {
              const waiting = queueOf(item).length;
              const inChat = Boolean(getThreadByItem(item.id));
              return (
                <section
                  key={item.id}
                  className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-100 p-3 shadow-sm"
                >
                  <Link
                    href={`/listing/${item.id}`}
                    className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photos[0]}
                      alt={item.name}
                      className="size-14 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-heading-3 truncate text-ink">{item.name}</p>
                      <p className="text-caption text-ink-subtle">
                        {bundle ? <PostedAgo iso={bundle.createdAt} /> : ""}
                      </p>
                    </div>
                    {item.status === "accepted" ? (
                      <Badge tone="success">In chat</Badge>
                    ) : (
                      <Badge tone="info">
                        {waiting} interested
                      </Badge>
                    )}
                  </Link>

                  <InterestQueue item={item} />

                  {inChat && item.status === "accepted" && (
                    <p className="text-caption text-ink-subtle">
                      Pickup in progress — open the chat to coordinate.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
