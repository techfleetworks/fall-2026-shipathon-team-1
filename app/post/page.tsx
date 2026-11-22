"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  ImageIcon,
  ImagePlus,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { TextInput, TextArea, FieldLabel } from "@/components/TextInput";
import { Tag } from "@/components/Tag";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { itemPhoto } from "@/lib/media";
import { CATEGORY_LABEL, id as makeId } from "@/lib/utils";
import type { Category, DraftItem, Gender, Item } from "@/lib/types";

type Step = "intro" | "source" | "camera" | "categories" | "details" | "address" | "done";
const CONDITIONS = ["Used like new", "New", "Gently used", "Good", "Used"];
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
    s.toLowerCase().includes((search || value).toLowerCase())
  );

  const showCustom = search.trim() && !SIZE_OPTIONS.some((s) => s.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <FieldLabel label="Size/Fit" required />
      <div className="relative">
        <input
          type="text"
          placeholder="Search and Select"
          value={open ? search : value}
          onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => { setOpen(true); setSearch(""); }}
          className={`text-body w-full rounded-md border border-border px-3 py-2.5 pr-9 text-ink placeholder:text-ink-subtle transition-colors duration-150 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-brand/40 ${value && !open ? "bg-brand-subtle border-brand" : "bg-surface-100"}`}
        />
        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-3 text-ink-subtle" aria-hidden />
      </div>
      {open && (
        <ul className="max-h-48 overflow-y-auto rounded-md border border-border bg-surface-100 shadow-md">
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

function guessCategory(label: string): Category {
  const l = label.toLowerCase();
  if (l.includes("shoe") || l.includes("boot") || l.includes("sneaker") || l.includes("sandal")) return "shoes";
  if (l.includes("toy") || l.includes("game") || l.includes("puzzle") || l.includes("book")) return "toys";
  return "clothing";
}

export default function PostPage() {
  const router = useRouter();
  const { publishBundle } = useStore();

  const [step, setStep] = useState<Step>("intro");
  const [photos, setPhotos] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [detailIdx, setDetailIdx] = useState(0);
  const [pickupAddress, setPickupAddress] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  const addPhotosAndDetect = () => {
    const pics = [itemPhoto("pile-" + Math.random(), "clothing"), itemPhoto("pile-" + Math.random(), "shoes")];
    setPhotos((p) => [...p, ...pics]);
    // "AI" detects a few children's categories from the pile.
    const detected: Category[] = ["clothing", "shoes", "toys"];
    setDrafts(
      detected.map((c) => ({
        id: makeId("draft"),
        name: CATEGORY_LABEL[c],
        category: c,
        sizeFit: "",
        gender: "neutral" as Gender,
        condition: "",
        flaws: "",
        photo: itemPhoto("item-" + c, c),
        confidence: 0.9,
        aiGenerated: true,
      })),
    );
    setDetectedCount(detected.length);
    setShowBanner(true);
    setStep("categories");
  };

  const addMorePhoto = () =>
    setPhotos((p) => [...p, itemPhoto("more-" + Math.random(), "clothing")]);
  const removeCategory = (draftId: string) => {
    setDrafts((d) => d.filter((x) => x.id !== draftId));
    setShowBanner(false);
  };
  const addNewCategory = (label: string, category: Category = "clothing") => {
    const clean = label.trim();
    if (!clean) return;
    setDrafts((d) => [
      ...d,
      {
        id: makeId("draft"),
        name: clean,
        category,
        categoryLabel: clean,
        sizeFit: "",
        gender: "neutral",
        condition: "",
        flaws: "",
        photo: itemPhoto("item-" + clean + Math.random(), category),
        confidence: 1,
        aiGenerated: false,
      },
    ]);
    setAddingCategory(false);
    setShowBanner(false);
  };
  const patchDraft = (idx: number, patch: Partial<DraftItem>) =>
    setDrafts((d) => d.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const publish = () => {
    publishBundle(drafts, photos, pickupAddress.trim());
    setStep("done");
  };

  // ---------- Camera ----------
  if (step === "camera") {
    return (
      <>
        <TopBar title="New Give-away Post" showBack backHref="/" showBell={false} />
        <main className="flex flex-1 flex-col">
          <div className="relative flex flex-1 items-center justify-center bg-black">
            <ImageIcon size={56} className="text-white/40" aria-hidden />
            <div className="absolute bottom-24 left-1/2 w-[85%] -translate-x-1/2 rounded-md bg-surface-100/90 px-3 py-2 text-center">
              <p className="text-caption text-ink-muted inline-flex items-center gap-1">
                <Info size={13} aria-hidden /> Lay items flat so each one is visible in the frame.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-around bg-black py-5">
            <ImageIcon size={26} className="text-white/70" aria-hidden />
            <button
              type="button"
              onClick={addPhotosAndDetect}
              aria-label="Take photo"
              className="size-16 rounded-full border-4 border-white bg-white/90"
            />
            <RefreshCw size={24} className="text-white/70" aria-hidden />
          </div>
        </main>
      </>
    );
  }

  // ---------- Intro / source ----------
  if (step === "intro" || step === "source") {
    return (
      <>
        <TopBar title="New Give-away Post" showBack backHref="/" showBell={false} />
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-md border border-border-subtle bg-surface-pure p-4">
            <p className="text-heading-3 text-center text-ink">One photo. Every item listed.</p>
            <ol className="mt-5 flex flex-col gap-5">
              <IntroStep n={1} text="Snap all items in one photo" category="clothing" />
              <IntroStep n={2} text="Individual item categories get detected" category="shoes" />
              <IntroStep n={3} text="Each item becomes its own listing" category="toys" />
            </ol>
          </div>
        </main>
        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
          {step === "intro" ? (
            <Button fullWidth onClick={() => setStep("source")} leftIcon={<Camera size={18} aria-hidden />}>Add Photo to start</Button>
          ) : (
            <>
              <Button variant="secondary" fullWidth onClick={() => setStep("camera")} leftIcon={<Camera size={18} aria-hidden />}>Use Camera</Button>
              <Button variant="secondary" fullWidth onClick={addPhotosAndDetect} leftIcon={<ImagePlus size={18} aria-hidden />}>From Gallery</Button>
            </>
          )}
        </div>
      </>
    );
  }

  // ---------- Categories / Details (shared chrome) ----------
  const onDetails = step === "details";
  return (
    <div className="flex h-dvh flex-col">
      <TopBar title="New Give-away Post" showBack backHref="/" showBell={false} />

      {/* Photos strip */}
      <div className="shrink-0 bg-surface-200 px-4 py-3">
        <p className="text-label text-ink mb-2">Photos</p>
        <div className="grid grid-cols-2 gap-3">
          {photos.slice(0, 1).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={`Pile ${i + 1}`} className="aspect-[4/3] w-full rounded-md object-cover" />
          ))}
          <button
            type="button"
            onClick={addMorePhoto}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-strong text-ink-muted hover:bg-surface-200"
          >
            <Plus size={22} aria-hidden />
            <span className="text-caption">Add more</span>
          </button>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="relative -mt-3 flex min-h-0 flex-1 flex-col rounded-t-2xl bg-surface-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        {/* Drag handle (visual only) */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-border-strong" />
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border-subtle px-4">
          <TabHead active={!onDetails} label="1. Category" onClick={() => setStep("categories")} />
          <TabHead active={onDetails} label="2. Details" onClick={() => setStep("details")} />
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          {onDetails ? (
            <div className="flex flex-col gap-4">
              {drafts.map((d, i) => (
                <DetailsEditor
                  key={d.id}
                  draft={d}
                  index={i}
                  total={drafts.length}
                  onChange={(patch) => patchDraft(i, patch)}
                />
              ))}
            </div>
          ) : addingCategory ? (
            <AddCategoryView
              existing={drafts.map((d) => (d.categoryLabel ?? CATEGORY_LABEL[d.category]).toLowerCase())}
              onBack={() => setAddingCategory(false)}
              onAdd={addNewCategory}
            />
          ) : (
            <div className="animate-fade-in flex flex-col gap-3">
              {showBanner && (
                <div className="flex items-start gap-2 rounded-md border border-brand/20 bg-brand-subtle/40 p-3">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
                  <p className="text-caption text-ink flex-1">
                    We identified <span className="font-semibold">{detectedCount}</span>{" "}
                    {detectedCount === 1 ? "category" : "categories"} from the image posted.
                  </p>
                  <button type="button" onClick={() => setShowBanner(false)} aria-label="Dismiss" className="shrink-0 rounded-full p-0.5 text-ink-muted hover:text-ink">
                    <X size={14} aria-hidden />
                  </button>
                </div>
              )}
              <p className="text-label text-ink-muted">Identified Categories ({drafts.length})</p>
              <div className="flex flex-wrap gap-2">
                {drafts.map((d) => (
                  <Chip
                    key={d.id}
                    label={d.categoryLabel ?? CATEGORY_LABEL[d.category]}
                    selected
                    onDismiss={() => removeCategory(d.id)}
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
            </div>
          )}
        </main>

        {/* Footer */}
        <div className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
        {addingCategory ? (
          <>
            <Button variant="secondary" fullWidth onClick={() => setAddingCategory(false)}>Back</Button>
            <Button fullWidth onClick={() => setAddingCategory(false)}>Done</Button>
          </>
        ) : !onDetails ? (
          <>
            <Button variant="secondary" fullWidth onClick={() => setStep("intro")}>Back</Button>
            <Button fullWidth disabled={drafts.length === 0} onClick={() => { setDetailIdx(0); setStep("details"); }}>Confirm</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" fullWidth onClick={() => setStep("categories")}>Back</Button>
            <Button
              fullWidth
              disabled={drafts.some((d) => !d.condition || !d.sizeFit)}
              onClick={() => setStep("address")}
            >
              Continue
            </Button>
          </>
        )}
      </div>
      </div>{/* end bottom sheet */}

      {(step === "address" || step === "done") && (
        <AddressSheet
          drafts={drafts}
          value={pickupAddress}
          onChange={setPickupAddress}
          onBack={() => setStep("details")}
          onPublish={publish}
        />
      )}
      {step === "done" && <DoneScreen drafts={drafts} />}
    </div>
  );
}

function IntroStep({ n, text, category }: { n: number; text: string; category: Category }) {
  return (
    <li className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-body-medium text-ink">{n}.</p>
        <p className="text-body text-ink-muted">{text}</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={itemPhoto("intro-" + n, category)} alt="" className="size-20 shrink-0 rounded-md object-cover" aria-hidden />
    </li>
  );
}

function TabHead({ active, label, onClick }: { active: boolean; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`text-body-medium -mb-px border-b-2 pb-2 ${active ? "border-brand text-ink" : "border-transparent text-ink-muted"}`}>
      {label}
    </button>
  );
}

function DetailsEditor({
  draft,
  index,
  total,
  onChange,
}: {
  draft: DraftItem;
  index: number;
  total: number;
  onChange: (patch: Partial<DraftItem>) => void;
}) {
  if (!draft) return null;
  return (
    <div className="animate-fade-in rounded-md border border-border bg-surface-pure p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-heading-3 text-ink">{draft.categoryLabel ?? CATEGORY_LABEL[draft.category]}</span>
        <span className="text-caption text-ink-subtle">Category: {index + 1}/{total}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Condition" required />
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <Chip key={c} label={c} selected={draft.condition === c} onClick={() => onChange({ condition: c })} />
          ))}
        </div>
      </div>

      <SizeFitInput
        value={draft.sizeFit}
        onChange={(val) => onChange({ sizeFit: val })}
      />

      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Boy/Girl" optional />
        <div className="flex flex-wrap gap-2">
          {(["boy", "girl"] as Gender[]).map((g) => (
            <Chip key={g} label={g[0].toUpperCase() + g.slice(1)} selected={draft.gender === g} onClick={() => onChange({ gender: draft.gender === g ? "neutral" : g })} />
          ))}
        </div>
      </div>

      <TextArea
        label="Notes"
        optional
        placeholder="Any flaws or issues worth mentioning"
        value={draft.flaws}
        onChange={(e) => onChange({ flaws: e.target.value })}
      />
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
          className="pr-9"
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
    <div className="flex flex-col gap-1.5" ref={ref}>
      <FieldLabel label="Pick-up Location (Not address)" required />
      <p className="text-caption text-ink-muted -mt-1">
        This information will be public as it helps users in search. Please avoid adding a residential address.
      </p>
      <div className="relative">
        <input
          type="text"
          placeholder="Enter street name, landmark"
          value={open ? search : value}
          onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => { setOpen(true); setSearch(""); }}
          className={`text-body w-full rounded-md border px-3 py-2.5 pr-9 text-ink placeholder:text-ink-subtle transition-colors duration-150 focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-brand/40 ${value && !open ? "bg-brand-subtle border-brand" : "bg-surface-100 border-border"}`}
        />
        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-3 text-ink-subtle" aria-hidden />
      </div>
      {open && (
        <ul className="max-h-48 overflow-y-auto rounded-md border border-border bg-surface-100 shadow-md">
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

function ListingPreviewCard({ draft }: { draft: DraftItem }) {
  const { me } = useStore();
  const preview: Item = {
    id: draft.id,
    bundleId: "preview",
    name: draft.name,
    category: draft.category,
    sizeFit: draft.sizeFit,
    gender: draft.gender,
    condition: draft.condition,
    flaws: draft.flaws,
    photos: [draft.photo],
    status: "available",
    interests: [],
  };

  return (
    <article className="flex flex-col gap-2.5 rounded-md border border-border-subtle bg-surface-pure p-3">
      <div className="flex items-center gap-3">
        <Avatar src={me.avatar} name={me.name} size={32} />
        <div className="min-w-0 flex-1">
          <p className="text-body-medium text-ink leading-tight">{me.name}</p>
          <p className="text-caption text-ink-subtle">Posted 1 min ago</p>
        </div>
        <span className="text-caption text-ink-subtle">x miles away</span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={preview.photos[0]}
        alt={preview.name}
        className="aspect-[4/3] w-full rounded-md object-cover"
      />

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-heading-3 truncate text-ink">{preview.name}</h3>
        <StatusBadge item={preview} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <p className="text-caption text-ink-subtle">Condition</p>
          <p className="text-body-medium text-ink truncate">{preview.condition || "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-caption text-ink-subtle">Size/Fit</p>
          <p className="text-body-medium text-ink truncate">
            {preview.gender !== "neutral" ? `${preview.gender === "boy" ? "Boy" : "Girl"} ` : ""}
            {preview.sizeFit || "—"}
          </p>
        </div>
      </div>
    </article>
  );
}

function AddressSheet({
  drafts,
  value,
  onChange,
  onBack,
  onPublish,
}: {
  drafts: DraftItem[];
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 mx-auto flex w-full max-w-content flex-col bg-surface-100">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface-100/95 px-4 backdrop-blur">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="-ml-2 flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface-200"
          >
            <ArrowLeft size={22} aria-hidden />
          </button>
          <h1 className="text-heading-2 truncate text-ink">New Give-away Post</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="flex flex-col gap-6">
          <LocationInput value={value} onChange={onChange} />

          <div className="flex flex-col gap-3">
            <p className="text-heading-3 text-ink">Listing Preview</p>
            {drafts.map((d) => (
              <ListingPreviewCard key={d.id} draft={d} />
            ))}
          </div>
        </div>
      </main>
      <div className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
        <Button variant="secondary" fullWidth onClick={onBack}>Back</Button>
        <Button fullWidth disabled={!value.trim()} onClick={onPublish}>Confirm &amp; Publish</Button>
      </div>
    </div>
  );
}

// ---------- Done / Notification Prompt ----------
function DoneScreen({ drafts }: { drafts: DraftItem[] }) {
  const router = useRouter();
  const [notified, setNotified] = useState(false);

  const goHome = useCallback(() => router.push("/"), [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="mx-auto flex w-full max-w-content flex-col items-center gap-5 rounded-t-xl bg-surface-pure px-6 pb-8 pt-5 animate-fade-in">
        <div className="h-1 w-10 rounded-full bg-border" />

        <span className="flex size-14 items-center justify-center rounded-full bg-brand-subtle">
          <CheckCircle2 size={28} className="text-brand" aria-hidden />
        </span>

        <div className="text-center">
          <h2 className="text-heading-2 text-ink">
            {drafts.length === 1 ? "Listing" : `${drafts.length} Listings`} published!
          </h2>
          <p className="text-body text-ink-muted mt-1">
            Your give-away is now live. We&apos;ll notify you when someone shows interest.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex w-full flex-col gap-4 rounded-md border border-border-subtle bg-surface-100 p-4">
            <p className="text-heading-3 text-ink text-center">Stay updated on your post</p>
            <p className="text-body text-ink-muted text-center">
              Turn on notifications to know when someone shows interest in your listing.
            </p>
            <Button
              fullWidth
              onClick={() => setNotified(true)}
              disabled={notified}
            >
              <Bell size={18} aria-hidden />
              {notified ? "Notifications on" : "Turn on notifications"}
            </Button>
          </div>

          <button type="button" onClick={goHome} className="text-label text-ink-muted py-2">
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
