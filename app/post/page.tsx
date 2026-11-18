"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
import { TextInput, TextArea } from "@/components/TextInput";
import { Tag } from "@/components/Tag";
import { StatusBadge } from "@/components/StatusBadge";
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
    setStep("categories");
  };

  const addMorePhoto = () =>
    setPhotos((p) => [...p, itemPhoto("more-" + Math.random(), "clothing")]);
  const removeCategory = (draftId: string) =>
    setDrafts((d) => d.filter((x) => x.id !== draftId));
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
  };
  const patchDraft = (idx: number, patch: Partial<DraftItem>) =>
    setDrafts((d) => d.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const publish = () => {
    publishBundle(drafts, photos, pickupAddress.trim());
    setStep("done");
  };

  // ---------- Done ----------
  if (step === "done") {
    return (
      <>
        <TopBar title="All done" showBell={false} />
        <main className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand text-ink-on-brand">
            <CheckCircle2 size={32} aria-hidden />
          </span>
          <div>
            <h1 className="text-heading-1 text-ink">Your listing is live</h1>
            <p className="text-body text-ink-muted mt-1">
              {drafts.length} {drafts.length === 1 ? "listing" : "listings"} published as{" "}
              <span className="text-ink">available</span>. We&apos;ll let you know the moment
              someone&apos;s interested.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button fullWidth onClick={() => router.push("/inbox")}>Go to inbox</Button>
            <Button variant="secondary" fullWidth onClick={() => router.push("/")}>Back to home</Button>
          </div>
        </main>
      </>
    );
  }

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
          <div className="rounded-lg border border-border-subtle bg-surface-100 p-4 shadow-sm">
            <p className="text-heading-3 text-center text-ink">One photo. Every item listed.</p>
            <ol className="mt-5 flex flex-col gap-5">
              <IntroStep n={1} text="Snap all items in one photo" category="clothing" />
              <IntroStep n={2} text="Individual item categories get detected" category="shoes" />
              <IntroStep n={3} text="Each item becomes its own listing" category="toys" />
            </ol>
          </div>
        </main>
        <div className="sticky bottom-0 flex items-center gap-3 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
          {step === "intro" ? (
            <>
              <button type="button" onClick={() => router.push("/")} className="text-button text-ink-muted px-2">Cancel</button>
              <Button fullWidth onClick={() => setStep("source")} leftIcon={<Camera size={18} aria-hidden />}>Add Photo to start</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" fullWidth onClick={() => setStep("camera")} leftIcon={<Camera size={18} aria-hidden />}>Use Camera</Button>
              <Button variant="secondary" fullWidth onClick={addPhotosAndDetect} leftIcon={<ImagePlus size={18} aria-hidden />}>Add from Photos</Button>
            </>
          )}
        </div>
      </>
    );
  }

  // ---------- Categories / Details (shared chrome) ----------
  const onDetails = step === "details";
  return (
    <>
      <TopBar title="Create a Give-away Listing" showBack backHref="/" showBell={false} />

      {/* Photos strip */}
      <div className="border-b border-border-subtle px-4 py-3">
        <p className="text-label text-ink-muted mb-2">Photos</p>
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

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border-subtle px-4">
        <TabHead active={!onDetails} label="1. Item Category" />
        <TabHead active={onDetails} label="2. Details" />
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {onDetails ? (
          <DetailsEditor
            draft={drafts[detailIdx]}
            index={detailIdx}
            total={drafts.length}
            onChange={(patch) => patchDraft(detailIdx, patch)}
          />
        ) : addingCategory ? (
          <AddCategoryView
            existing={drafts.map((d) => (d.categoryLabel ?? CATEGORY_LABEL[d.category]).toLowerCase())}
            onBack={() => setAddingCategory(false)}
            onAdd={addNewCategory}
          />
        ) : (
          <div className="animate-fade-in flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-md border border-brand/30 bg-brand-subtle p-3">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
              <p className="text-caption text-ink">
                We identified <span className="font-semibold">{drafts.length}</span>{" "}
                {drafts.length === 1 ? "category" : "categories"}. Edit before adding details — nothing posts until you publish.
              </p>
            </div>
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
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
        {addingCategory ? (
          <>
            <button type="button" onClick={() => setAddingCategory(false)} className="text-button text-ink-muted px-2">Back</button>
            <Button variant="secondary" fullWidth onClick={() => setAddingCategory(false)}>Done</Button>
          </>
        ) : !onDetails ? (
          <>
            <button type="button" onClick={() => setStep("intro")} className="text-button text-ink-muted px-2">Back</button>
            <Button fullWidth disabled={drafts.length === 0} onClick={() => { setDetailIdx(0); setStep("details"); }}>Confirm</Button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => (detailIdx > 0 ? setDetailIdx(detailIdx - 1) : setStep("categories"))}
              className="text-button text-ink-muted px-2"
            >
              Back
            </button>
            <Button
              fullWidth
              disabled={!drafts[detailIdx]?.condition}
              onClick={() => (detailIdx < drafts.length - 1 ? setDetailIdx(detailIdx + 1) : setStep("address"))}
            >
              {detailIdx < drafts.length - 1 ? "Confirm & Add" : "Confirm & Continue"}
            </Button>
          </>
        )}
      </div>

      {step === "address" && (
        <AddressSheet
          drafts={drafts}
          value={pickupAddress}
          onChange={setPickupAddress}
          onBack={() => setStep("details")}
          onPublish={publish}
        />
      )}
    </>
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

function TabHead({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`text-body-medium -mb-px border-b-2 pb-2 ${active ? "border-brand text-ink" : "border-transparent text-ink-muted"}`}>
      {label}
    </span>
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
    <div className="animate-fade-in flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Tag tone="outline">{draft.categoryLabel ?? CATEGORY_LABEL[draft.category]}</Tag>
        <span className="text-caption text-ink-subtle">Category: {index + 1}/{total}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label text-ink">Condition<span className="text-error"> *</span></span>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <Chip key={c} label={c} selected={draft.condition === c} onClick={() => onChange({ condition: c })} />
          ))}
        </div>
      </div>

      <TextInput
        label="Size/Fit"
        placeholder="e.g. 2T, Boy 2-3 yr old, Kids US 8"
        value={draft.sizeFit}
        onChange={(e) => onChange({ sizeFit: e.target.value })}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-label text-ink">Boy/Girl <span className="text-ink-subtle font-normal">(optional)</span></span>
        <div className="flex flex-wrap gap-2">
          {(["boy", "girl", "neutral"] as Gender[]).map((g) => (
            <Chip key={g} label={g === "neutral" ? "No preference" : g[0].toUpperCase() + g.slice(1)} selected={draft.gender === g} onClick={() => onChange({ gender: g })} />
          ))}
        </div>
      </div>

      <TextArea
        label="Notes (optional)"
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
  // Build lightweight preview items from the drafts.
  const previews: Item[] = drafts.map((d) => ({
    id: d.id,
    bundleId: "preview",
    name: d.name,
    category: d.category,
    sizeFit: d.sizeFit,
    gender: d.gender,
    condition: d.condition,
    flaws: d.flaws,
    photos: [d.photo],
    status: "available",
    interests: [],
  }));

  return (
    <div className="fixed inset-0 z-40 mx-auto flex w-full max-w-content flex-col bg-surface-100">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <button type="button" onClick={onBack} className="text-heading-3 inline-flex items-center gap-1 text-ink">
          <X size={18} aria-hidden /> Give-away Listing
        </button>
        <span className="text-label text-ink-muted inline-flex items-center gap-1"><ImageIcon size={14} aria-hidden /> Save progress</span>
      </div>
      <main className="flex-1 overflow-y-auto px-4 pb-28">
        <h2 className="text-heading-3 text-ink">Pick-up Location (Not address)</h2>
        <p className="text-caption text-ink-muted mt-1">
          This information will be public as it helps users in search. Please avoid adding a
          residential address.
        </p>
        <div className="mt-3">
          <TextInput
            aria-label="Pickup location"
            placeholder="Enter street name, landmark"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        <h3 className="text-heading-3 text-ink mt-6">Listing Preview</h3>
        <div className="mt-3 flex flex-col gap-3">
          {previews.map((p) => (
            <div key={p.id} className="flex gap-3 rounded-md border border-border-subtle bg-surface-100 p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photos[0]} alt={p.name} className="size-16 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-heading-3 truncate text-ink">{p.name}</p>
                  <StatusBadge item={p} />
                </div>
                <p className="text-caption text-ink-muted mt-1">Condition: {p.condition || "—"}</p>
                <p className="text-caption text-ink-muted">Size/Fit: {p.sizeFit || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
        <button type="button" onClick={onBack} className="text-button text-ink-muted px-2">Back</button>
        <Button fullWidth disabled={!value.trim()} onClick={onPublish}>Confirm &amp; Publish</Button>
      </div>
    </div>
  );
}
