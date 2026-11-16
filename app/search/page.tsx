"use client";

import { Search as SearchIcon } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ItemCard } from "@/components/ItemCard";
import { useStore } from "@/lib/store";

export default function SearchPage() {
  const { allItems } = useStore();
  // Receiver-side discovery is a later release; this tab is a visual teaser
  // on the giver app and is intentionally inert.
  const browse = allItems.filter((i) => i.status !== "gone").slice(0, 4);

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <h1 className="text-heading-1 text-ink">Search</h1>

        <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-surface-100 px-3 py-2.5 text-ink-subtle">
          <SearchIcon size={18} aria-hidden />
          <span className="text-body">Search children&apos;s items nearby</span>
        </div>

        <p className="text-caption text-ink-subtle mt-2">
          Needs-based discovery for receivers is coming in a later release. Here&apos;s
          a preview of what neighbours are giving away.
        </p>

        <div className="mt-4 flex flex-col gap-3 opacity-80">
          {browse.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
