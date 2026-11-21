"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  MapPin,
  Plus,
  Search as SearchIcon,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { TextInput } from "@/components/TextInput";
import { useStore } from "@/lib/store";
import type { Category, Gender, SearchQuery } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/utils";

const CATEGORIES: Category[] = ["clothing", "shoes", "toys"];
const CONDITIONS = ["Used like new", "Gently used", "Good", "Used"];
const GENDERS: { key: Gender; label: string }[] = [
  { key: "boy", label: "Boy" },
  { key: "girl", label: "Girl" },
];

const CATEGORY_SUGGESTIONS: { label: string; category: Category }[] = [
  { label: "Towels", category: "clothing" },
  { label: "Winter-clothes", category: "clothing" },
  { label: "Coats", category: "clothing" },
  { label: "Accessories", category: "clothing" },
  { label: "Clothing", category: "clothing" },
  { label: "Shoes", category: "shoes" },
  { label: "Toys", category: "toys" },
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

function guessCategory(label: string): Category {
  const l = label.toLowerCase();
  if (l.includes("shoe") || l.includes("boot") || l.includes("sneaker") || l.includes("sandal")) return "shoes";
  if (l.includes("toy") || l.includes("game") || l.includes("puzzle") || l.includes("book")) return "toys";
  return "clothing";
}

export default function SearchPage() {
  const router = useRouter();
  const { search, setSearch } = useStore();
  const [q, setQ] = useState<SearchQuery>(search);
  const [addingCategory, setAddingCategory] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const toggleCategory = (c: Category) =>
    setQ((s) => ({
      ...s,
      categories: s.categories.includes(c)
        ? s.categories.filter((x) => x !== c)
        : [...s.categories, c],
    }));
  const toggleCondition = (c: string) =>
    setQ((s) => ({
      ...s,
      conditions: s.conditions.includes(c)
        ? s.conditions.filter((x) => x !== c)
        : [...s.conditions, c],
    }));

  const addCustomCategory = (label: string, category: Category) => {
    const clean = label.trim();
    if (!clean || customCategories.includes(clean)) return;
    setCustomCategories((prev) => [...prev, clean]);
    if (!q.categories.includes(category)) {
      setQ((s) => ({ ...s, categories: [...s.categories, category] }));
    }
    setAddingCategory(false);
  };

  const removeCustomCategory = (label: string) => {
    setCustomCategories((prev) => prev.filter((c) => c !== label));
  };

  const valid = q.categories.length > 0;
  const run = () => {
    setSearch(q);
    router.push("/browse");
  };

  return (
    <>
      <TopBar title="Search Children's Items" showBack backHref="/" showBell={false} />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
        <div className="animate-fade-in flex flex-col gap-5">
          <h1 className="text-heading-1 text-ink">What are you looking for?</h1>

          {addingCategory ? (
            <AddCategoryView
              existing={[
                ...q.categories.map((c) => CATEGORY_LABEL[c].toLowerCase()),
                ...customCategories.map((c) => c.toLowerCase()),
              ]}
              onBack={() => setAddingCategory(false)}
              onAdd={addCustomCategory}
            />
          ) : (
            <Field label="Select Category" required>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    label={CATEGORY_LABEL[c]}
                    selected={q.categories.includes(c)}
                    onClick={() => toggleCategory(c)}
                    onDismiss={() => toggleCategory(c)}
                  />
                ))}
                {customCategories.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    selected
                    onDismiss={() => removeCustomCategory(c)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  className="text-label inline-flex items-center gap-1 rounded-sm border border-border-strong bg-surface-100 px-3 py-1.5 text-ink hover:bg-surface-200"
                >
                  <Plus size={14} aria-hidden /> Add new
                </button>
              </div>
            </Field>
          )}

          {!addingCategory && (
            <>
              <Field label="Select Size/Fit">
                <SizeFitInput
                  value={q.sizeFit}
                  onChange={(v) => setQ((s) => ({ ...s, sizeFit: v }))}
                />
              </Field>

              <Field label="Select location">
                <LocationInput
                  value={q.location}
                  onChange={(v) => setQ((s) => ({ ...s, location: v }))}
                />
              </Field>

              <Field label="Select Boy/Girl" optional>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <Chip
                      key={g.key}
                      label={g.label}
                      selected={q.gender === g.key}
                      onClick={() =>
                        setQ((s) => ({
                          ...s,
                          gender: s.gender === g.key ? "any" : g.key,
                        }))
                      }
                    />
                  ))}
                </div>
              </Field>

              <Field label="Select Condition" optional>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      selected={q.conditions.includes(c)}
                      onClick={() => toggleCondition(c)}
                    />
                  ))}
                </div>
              </Field>
            </>
          )}
        </div>
      </main>

      <div className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
        <Button variant="secondary" fullWidth onClick={() => router.push("/")}>
          Cancel
        </Button>
        <Button fullWidth disabled={!valid} onClick={run} leftIcon={<SearchIcon size={18} aria-hidden />}>
          Next
        </Button>
      </div>
    </>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label text-ink">
        {label}
        {required && <span className="text-error"> *</span>}
        {optional && <span className="text-ink-subtle font-normal"> (optional)</span>}
      </span>
      {children}
    </div>
  );
}

function SizeFitInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = SIZE_OPTIONS.filter((s) =>
    search ? s.toLowerCase().includes(search.toLowerCase()) : true
  );

  const showCustom = search.trim() && !SIZE_OPTIONS.some((s) => s.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        aria-label="Size or fit"
        placeholder="Search and Select"
        value={open ? search : value}
        onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => { setOpen(true); setSearch(""); }}
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
                onClick={() => { onChange(search.trim()); setOpen(false); setSearch(""); }}
              >
                Use &ldquo;{search.trim()}&rdquo;
              </button>
            </li>
          )}
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-body hover:bg-surface-200 ${value === s ? "bg-brand-subtle text-ink font-medium" : "text-ink"}`}
                onClick={() => { onChange(s); setOpen(false); setSearch(""); }}
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

function LocationInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = LOCATION_OPTIONS.filter((s) =>
    s.toLowerCase().includes((search || "").toLowerCase())
  );

  const showCustom = search.trim() && !LOCATION_OPTIONS.some((s) => s.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        aria-label="Location"
        placeholder="Search by city, neighbourhood or ZIP code"
        value={open ? search : value}
        onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => { setOpen(true); setSearch(""); }}
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
                onClick={() => { onChange(search.trim()); setOpen(false); setSearch(""); }}
              >
                Use &ldquo;{search.trim()}&rdquo;
              </button>
            </li>
          )}
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-body hover:bg-surface-200 ${value === s ? "bg-brand-subtle text-ink font-medium" : "text-ink"}`}
                onClick={() => { onChange(s); setOpen(false); setSearch(""); }}
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
      )}
    </div>
  );
}

function AddCategoryView({
  existing,
  onBack,
  onAdd,
}: {
  existing: string[];
  onBack: () => void;
  onAdd: (label: string, category: Category) => void;
}) {
  const [term, setTerm] = useState("");
  const suggestions = CATEGORY_SUGGESTIONS.filter((s) => !existing.includes(s.label.toLowerCase()));

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <button type="button" onClick={onBack} className="text-heading-3 inline-flex items-center gap-1.5 self-start text-ink">
        <ArrowLeft size={18} aria-hidden /> Add new item category
      </button>

      <div className="relative">
        <TextInput
          aria-label="Search and select a category"
          placeholder="Search and Select"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && term.trim()) onAdd(term, guessCategory(term));
          }}
          className="pr-9 bg-surface-200"
        />
        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-3 text-ink-subtle" aria-hidden />
      </div>

      {term.trim() && (
        <button
          type="button"
          onClick={() => onAdd(term, guessCategory(term))}
          className="text-label inline-flex items-center gap-1 self-start rounded-sm border border-dashed border-border-strong bg-surface-100 px-3 py-1.5 text-ink hover:bg-surface-200"
        >
          <Plus size={14} aria-hidden /> Add &ldquo;{term.trim()}&rdquo;
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onAdd(s.label, s.category)}
            className="text-label inline-flex items-center gap-1 rounded-sm border border-dashed border-border-strong bg-surface-100 px-3 py-1.5 text-ink hover:bg-surface-200"
          >
            <Plus size={14} aria-hidden /> {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
