"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  MapPin,
  PackageSearch,
  Plus,
  Search as SearchIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ItemCard } from "@/components/ItemCard";
import { Chip } from "@/components/Chip";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { CATEGORY_LABEL, cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const CATEGORIES: Category[] = ["clothing", "shoes", "toys"];
const CONDITIONS = ["Used like new", "Gently used", "Good", "Used"];
const GENDERS: { key: "boy" | "girl"; label: string }[] = [
  { key: "boy", label: "Boy" },
  { key: "girl", label: "Girl" },
];

const SIZE_OPTIONS = [
  "Newborn", "0-3m", "3-6m", "6-9m", "9-12m", "12-18m", "18-24m",
  "2T", "3T", "4T", "5T",
  "6y", "7y", "8y", "9y", "10y", "12y", "14y", "16y",
  "Youth XS", "Youth S", "Youth M", "Youth L", "Youth XL",
];

const LOCATION_OPTIONS = [
  "Sunset Blvd & Vine St",
  "Sunset District, SF",
  "Richmond District, SF",
  "Mission District, SF",
  "Hayes Valley, SF",
  "Noe Valley, SF",
  "Potrero Hill, SF",
  "Bernal Heights, SF",
  "Inner Sunset, SF",
  "Outer Sunset, SF",
];

export default function BrowsePage() {
  const router = useRouter();
  const { search, setSearch, searchResults, getBundleOf, getPosterOf, getMyInterest } = useStore();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    return [...searchResults].sort((a, b) =>
      (getBundleOf(b.id)?.createdAt ?? "").localeCompare(getBundleOf(a.id)?.createdAt ?? ""),
    );
  }, [searchResults, getBundleOf]);

  const removeCategory = (c: Category) =>
    setSearch({ ...search, categories: search.categories.filter((x) => x !== c) });

  const addCategory = (c: Category) => {
    if (!search.categories.includes(c)) {
      setSearch({ ...search, categories: [...search.categories, c] });
    }
  };

  const filterCount =
    (search.sizeFit ? 1 : 0) +
    (search.gender !== "any" ? 1 : 0) +
    search.conditions.length;

  return (
    <>
      <TopBar title="Search Children's Items" showBack backHref="/search" showBell={false} />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-3">
        {/* Category chips + search icon */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => router.push("/search")}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-surface-200 px-3 py-2.5"
        >
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {search.categories.length === 0 && (
              <span className="text-body text-ink-subtle">Tap to add categories</span>
            )}
            {search.categories.map((c) => (
              <Chip key={c} label={CATEGORY_LABEL[c]} selected onDismiss={() => removeCategory(c)} />
            ))}
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted">
            <SearchIcon size={18} aria-hidden />
          </span>
        </div>

        {/* Filters + Location row */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={cn(
              "text-label inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors",
              filterCount > 0
                ? "border-brand bg-brand-subtle text-ink"
                : "border-border bg-surface-100 text-ink hover:bg-surface-200",
            )}
          >
            <SlidersHorizontal size={15} aria-hidden />
            Filters
            {filterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-ink-on-brand">
                {filterCount}
              </span>
            )}
          </button>
          <LocationButton
            value={search.location}
            onChange={(v) => setSearch({ ...search, location: v })}
          />
        </div>

        {/* Results */}
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
                  userJoined={!!getMyInterest(item.id)}
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

      {/* Filters bottom sheet */}
      {filtersOpen && (
        <FiltersSheet
          sizeFit={search.sizeFit}
          gender={search.gender}
          conditions={search.conditions}
          onApply={(patch) => {
            setSearch({ ...search, ...patch });
            setFiltersOpen(false);
          }}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </>
  );
}

/* ---------- Location button with inline dropdown ---------- */
function LocationButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = LOCATION_OPTIONS.filter((s) =>
    s.toLowerCase().includes((term || "").toLowerCase())
  );
  const showCustom = term.trim() && !LOCATION_OPTIONS.some((s) => s.toLowerCase() === term.trim().toLowerCase());

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setTerm(""); }}
        className={cn(
          "text-label inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors",
          value ? "text-ink" : "text-ink-muted",
        )}
      >
        <MapPin size={15} aria-hidden /> {value || "Location"}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border border-border bg-surface-100 shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search location"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="text-body w-full rounded-md border border-border bg-surface-pure px-3 py-2 text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/40"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {showCustom && (
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-body text-ink hover:bg-surface-200"
                  onClick={() => { onChange(term.trim()); setOpen(false); }}
                >
                  Use &ldquo;{term.trim()}&rdquo;
                </button>
              </li>
            )}
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-body hover:bg-surface-200",
                    value === s ? "bg-brand-subtle text-ink font-medium" : "text-ink",
                  )}
                  onClick={() => { onChange(s); setOpen(false); }}
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={14} className="shrink-0 text-ink-subtle" aria-hidden />
                    {s}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && !showCustom && (
              <li className="px-3 py-2 text-caption text-ink-subtle">No matching locations</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Filters bottom sheet ---------- */
function FiltersSheet({
  sizeFit,
  gender,
  conditions,
  onApply,
  onClose,
}: {
  sizeFit: string;
  gender: string;
  conditions: string[];
  onApply: (patch: { sizeFit: string; gender: "boy" | "girl" | "any"; conditions: string[] }) => void;
  onClose: () => void;
}) {
  const [localSizeFit, setLocalSizeFit] = useState(sizeFit);
  const [localGender, setLocalGender] = useState(gender);
  const [localConditions, setLocalConditions] = useState(conditions);

  const toggleCondition = (c: string) =>
    setLocalConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const clear = () => {
    setLocalSizeFit("");
    setLocalGender("any");
    setLocalConditions([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-auto flex w-full max-w-content flex-col rounded-t-xl bg-surface-pure animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="flex flex-col items-center pt-3 pb-2 px-4">
          <div className="h-1 w-10 rounded-full bg-border" />
          <div className="mt-3 flex w-full items-center justify-between">
            <h2 className="text-heading-2 text-ink">Filters</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-full hover:bg-surface-200">
              <X size={20} className="text-ink-muted" aria-hidden />
            </button>
          </div>
        </div>

        {/* Filter fields */}
        <div className="flex flex-col gap-5 overflow-y-auto px-4 pt-2 pb-4" style={{ maxHeight: "60vh" }}>
          {/* Size/Fit */}
          <FilterField label="Select Size/Fit">
            <SizeFitInput value={localSizeFit} onChange={setLocalSizeFit} />
          </FilterField>

          {/* Boy/Girl */}
          <FilterField label="Select Boy/Girl" optional>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <Chip
                  key={g.key}
                  label={g.label}
                  selected={localGender === g.key}
                  onClick={() => setLocalGender((prev) => (prev === g.key ? "any" : g.key))}
                />
              ))}
            </div>
          </FilterField>

          {/* Condition */}
          <FilterField label="Select Condition" optional>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  selected={localConditions.includes(c)}
                  onClick={() => toggleCondition(c)}
                />
              ))}
            </div>
          </FilterField>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-3 border-t border-border-subtle px-4 py-4">
          <Button variant="secondary" fullWidth onClick={clear}>
            Clear all
          </Button>
          <Button
            fullWidth
            onClick={() =>
              onApply({
                sizeFit: localSizeFit,
                gender: localGender as "boy" | "girl" | "any",
                conditions: localConditions,
              })
            }
          >
            Apply filters
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterField({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label text-ink">
        {label}
        {optional && <span className="text-ink-subtle font-normal"> (optional)</span>}
      </span>
      {children}
    </div>
  );
}

/* ---------- Size/Fit searchable dropdown ---------- */
function SizeFitInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = SIZE_OPTIONS.filter((s) =>
    term ? s.toLowerCase().includes(term.toLowerCase()) : true
  );
  const showCustom = term.trim() && !SIZE_OPTIONS.some((s) => s.toLowerCase() === term.trim().toLowerCase());

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        aria-label="Size or fit"
        placeholder="Search and Select"
        value={open ? term : value}
        onChange={(e) => { setTerm(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => { setOpen(true); setTerm(""); }}
        className={`text-body w-full rounded-md border px-3 py-2.5 pr-9 text-ink placeholder:text-ink-subtle transition-colors duration-150 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-brand/40 ${value && !open ? "bg-brand-subtle border-brand" : "bg-surface-100 border-border"}`}
      />
      <ChevronDown size={18} className="pointer-events-none absolute right-3 top-3 text-ink-subtle" aria-hidden />
      {open && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-surface-100 shadow-md">
          {showCustom && (
            <li>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-body text-ink hover:bg-surface-200"
                onClick={() => { onChange(term.trim()); setOpen(false); setTerm(""); }}
              >
                Use &ldquo;{term.trim()}&rdquo;
              </button>
            </li>
          )}
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-body hover:bg-surface-200",
                  value === s ? "bg-brand-subtle text-ink font-medium" : "text-ink",
                )}
                onClick={() => { onChange(s); setOpen(false); setTerm(""); }}
              >
                {s}
              </button>
            </li>
          ))}
          {filtered.length === 0 && !showCustom && (
            <li className="px-3 py-2 text-caption text-ink-subtle">No matching sizes</li>
          )}
        </ul>
      )}
    </div>
  );
}
