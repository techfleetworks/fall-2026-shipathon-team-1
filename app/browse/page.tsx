"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, PackageSearch, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ItemCard } from "@/components/ItemCard";
import { Chip } from "@/components/Chip";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { CATEGORY_LABEL, cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const GENDER_LABEL: Record<string, string> = { boy: "Boy", girl: "Girl", any: "No preference" };

export default function BrowsePage() {
  const router = useRouter();
  const { search, setSearch, searchResults, getBundleOf, getPosterOf } = useStore();
  const [nearest, setNearest] = useState(true);

  const results = useMemo(() => {
    const items = [...searchResults];
    if (!nearest) {
      items.sort((a, b) =>
        (getBundleOf(b.id)?.createdAt ?? "").localeCompare(getBundleOf(a.id)?.createdAt ?? ""),
      );
    }
    return items;
  }, [searchResults, nearest, getBundleOf]);

  const removeCategory = (c: Category) =>
    setSearch({ ...search, categories: search.categories.filter((x) => x !== c) });
  const removeCondition = (c: string) =>
    setSearch({ ...search, conditions: search.conditions.filter((x) => x !== c) });

  const hasChips =
    search.categories.length > 0 ||
    search.sizeFit ||
    search.location ||
    search.gender !== "any" ||
    search.conditions.length > 0;

  return (
    <>
      <TopBar title="Search Results" showBack backHref="/search" showBell={false} />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-3">
        {/* Active filter chips + search icon */}
        {hasChips && (
          <div className="flex items-start gap-2">
            <div className="flex flex-1 flex-wrap gap-2">
              {search.categories.map((c) => (
                <Chip key={c} label={CATEGORY_LABEL[c]} selected onDismiss={() => removeCategory(c)} />
              ))}
              {search.sizeFit && (
                <Chip label={search.sizeFit} selected onDismiss={() => setSearch({ ...search, sizeFit: "" })} />
              )}
              {search.gender !== "any" && (
                <Chip label={GENDER_LABEL[search.gender]} selected onDismiss={() => setSearch({ ...search, gender: "any" })} />
              )}
              {search.conditions.map((c) => (
                <Chip key={c} label={c} selected onDismiss={() => removeCondition(c)} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push("/search")}
              aria-label="Edit search"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-ink-muted hover:bg-surface-200"
            >
              <SearchIcon size={18} aria-hidden />
            </button>
          </div>
        )}

        {/* Filters + Location controls */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="text-label inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-100 px-3 py-1.5 text-ink hover:bg-surface-200"
          >
            <SlidersHorizontal size={15} aria-hidden /> Filters
          </button>
          <button
            type="button"
            onClick={() => setNearest((v) => !v)}
            aria-pressed={nearest}
            className={cn(
              "text-label inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors",
              nearest ? "text-ink" : "text-ink-muted",
            )}
          >
            <MapPin size={15} aria-hidden /> {nearest ? "Location" : "Newest"}
          </button>
        </div>

        {results.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {results.map((item) => {
              const poster = getPosterOf(item.id);
              const bundle = getBundleOf(item.id);
              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  href={`/item/${item.id}`}
                  distance={`${poster?.distanceMi ?? "?"} miles away`}
                  timeIso={bundle?.createdAt}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-surface-200 text-ink-muted">
              <PackageSearch size={26} aria-hidden />
            </span>
            <p className="text-heading-3 text-ink">Nothing matches yet</p>
            <p className="text-body text-ink-muted max-w-xs">
              Try widening your filters — remove a size or condition to see more of what
              neighbours are giving away.
            </p>
            <Button variant="secondary" onClick={() => router.push("/search")}>Adjust search</Button>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
