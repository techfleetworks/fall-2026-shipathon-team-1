"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
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
const GENDERS: { key: Gender | "any"; label: string }[] = [
  { key: "boy", label: "Boy" },
  { key: "girl", label: "Girl" },
  { key: "any", label: "No preference" },
];

export default function SearchPage() {
  const router = useRouter();
  const { search, setSearch } = useStore();
  const [q, setQ] = useState<SearchQuery>(search);

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
            </div>
          </Field>

          <Field label="Size/Fit">
            <TextInput
              aria-label="Size or fit"
              placeholder="e.g. 2T, 2-3 yr old, Kids US 8"
              value={q.sizeFit}
              onChange={(e) => setQ((s) => ({ ...s, sizeFit: e.target.value }))}
            />
          </Field>

          <Field label="Select location">
            <TextInput
              aria-label="Location"
              placeholder="Search by city, neighbourhood or ZIP code"
              value={q.location}
              onChange={(e) => setQ((s) => ({ ...s, location: e.target.value }))}
            />
          </Field>

          <Field label="Select Boy/Girl" optional>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <Chip
                  key={g.key}
                  label={g.label}
                  selected={q.gender === g.key}
                  onClick={() => setQ((s) => ({ ...s, gender: g.key }))}
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
        </div>
      </main>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
        <button type="button" onClick={() => router.push("/")} className="text-button text-ink-muted px-2">
          Cancel
        </button>
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
