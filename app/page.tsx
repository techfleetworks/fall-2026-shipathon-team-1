"use client";

import { HandHeart, PackageOpen, Search as SearchIcon } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ActionCard } from "@/components/ActionCard";
import { ItemCard } from "@/components/ItemCard";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { giver, bundles, unreadMessages, allItems } = useStore();

  const hasNews = unreadMessages > 0 || allItems.some((i) => i.status === "requested");
  const recent = bundles
    .flatMap((b) => b.items)
    .filter((i) => i.status !== "gone")
    .slice(0, 3);

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <div className="animate-fade-in flex flex-col gap-5">
          <div>
            <h1 className="text-heading-2 text-ink">
              Hi {giver.name}, welcome to My Village
            </h1>
            <p className="text-body text-ink-muted mt-1">
              Pass on what your little ones have outgrown.
            </p>
          </div>

          {hasNews && (
            <ActionCard
              accent
              icon={<PackageOpen size={20} aria-hidden />}
              title="Your post has got new interests"
              description="People are waiting to hear from you."
              actionLabel="View messages"
              href="/messages"
            />
          )}

          <ActionCard
            icon={<HandHeart size={20} aria-hidden />}
            title="Declutter children's items?"
            description="Snap a pile of outgrown clothes, shoes, or toys and give them away in one go."
            actionLabel="Give away"
            href="/post"
          />

          {/* Receiver-side teaser — visible but inert on the giver app. */}
          <ActionCard
            icon={<SearchIcon size={20} aria-hidden />}
            title="Looking for children's items?"
            description="Browse what neighbours are giving away nearby."
            actionLabel="Search"
            href="/search"
          />

          {recent.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-heading-3 text-ink">Your active give-aways</h2>
              </div>
              <div className="flex flex-col gap-3">
                {recent.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    href={`/listing/${item.id}`}
                    distance={giver.location.replace("Rosewood, ", "")}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
