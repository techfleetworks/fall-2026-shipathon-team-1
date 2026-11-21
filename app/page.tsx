"use client";

import Link from "next/link";
import { HandHeart, Search as SearchIcon } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { Tag } from "@/components/Tag";
import { PostedAgo, TimeAgo } from "@/components/TimeText";
import { useStore, queueOf } from "@/lib/store";
import type { Item } from "@/lib/types";

export default function HomePage() {
  const { me, myReceivedItems, myPostedBundles, getBundleOf } = useStore();

  const activePostItems = myPostedBundles.flatMap((bundle) =>
    bundle.items
      .filter((item) => item.status !== "gone")
      .map((item) => ({ item, bundle })),
  );


  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-24 pt-4">
        <div className="animate-fade-in flex flex-col gap-4 px-4">
          <div>
            <h1 className="text-heading-2 text-ink">Hi {me.name}</h1>
            <p className="text-body text-ink-muted mt-0.5">Welcome to My Village</p>
          </div>

          {activePostItems.length > 0 && (
            <section>
              <h2 className="text-heading-3 text-ink mb-2">Your Posts</h2>
            </section>
          )}
        </div>

        {activePostItems.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2 px-4 no-scrollbar">
            {activePostItems.map(({ item, bundle }) => (
              <Link
                key={item.id}
                href="/inbox?tab=received"
                className="flex w-[300px] shrink-0 items-center gap-3 rounded-md border border-border-subtle bg-surface-pure p-4 shadow-sm hover:bg-surface-200 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photos[0]}
                  alt={item.name}
                  className="size-14 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-body-medium text-ink truncate">{item.name}</p>
                    <span className="text-[11px] text-ink-subtle shrink-0">
                      <TimeAgo iso={bundle.createdAt} />
                    </span>
                  </div>
                  {queueOf(item).length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <AvatarStack people={queueOf(item).map((q) => q.receiver)} />
                      <span className="text-caption text-ink-muted">
                        {queueOf(item).length} {queueOf(item).length === 1 ? "Person" : "People"} interested
                      </span>
                    </div>
                  )}
                  <div className="mt-1.5">
                    <PostStatusLabel item={item} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4 px-4">
          <ActionTile
            icon={<HandHeart size={22} aria-hidden />}
            title="Declutter children's items?"
            description="Snap a pile of outgrown clothes, shoes, or toys and give them all away in one go."
            actionLabel="Give away"
            actionIcon={<HandHeart size={18} aria-hidden />}
            href="/post"
          />

          <ActionTile
            icon={<SearchIcon size={22} aria-hidden />}
            title="Looking for children's items?"
            description="Tell us what you need and we'll show only what fits — nearby and relevant."
            actionLabel="Search"
            actionIcon={<SearchIcon size={18} aria-hidden />}
            href="/search"
          />
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function ActionTile({
  title,
  description,
  actionLabel,
  actionIcon,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-pure p-4 shadow-sm transition-colors hover:bg-surface-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div>
        <h2 className="text-heading-3 text-ink">{title}</h2>
        <p className="text-body text-ink-muted mt-1">{description}</p>
      </div>
      <span className="text-button inline-flex items-center justify-center gap-2 self-stretch rounded-lg border border-border py-2.5 text-ink">
        {actionIcon}
        {actionLabel}
      </span>
    </Link>
  );
}

function PostStatusLabel({ item }: { item: Item }) {
  const hasAccepted = item.interests.some((i) => i.state === "accepted");

  if (queueOf(item).length === 0 && !hasAccepted) {
    return <Tag tone="gray">No interests yet</Tag>;
  }
  return null;
}

function AvatarStack({ people }: { people: { name: string; avatar: string }[] }) {
  return (
    <div className="flex -space-x-1.5">
      {people.slice(0, 3).map((p, i) => (
        <span key={i} className="ring-2 ring-surface-100 rounded-full">
          <Avatar src={p.avatar} name={p.name} size={20} />
        </span>
      ))}
    </div>
  );
}
