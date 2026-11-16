"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Plus,
  Sparkles,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { TextInput, TextArea } from "@/components/TextInput";
import { StepIndicator } from "@/components/StepIndicator";
import { useStore } from "@/lib/store";
import { generateDrafts, LOW_CONFIDENCE } from "@/lib/ai/stub";
import { itemPhoto } from "@/lib/media";
import type { Category, DraftItem } from "@/lib/types";
import { id as makeId } from "@/lib/utils";

const STEPS = ["Photos", "Details", "Review"];
const CATEGORIES: Category[] = ["clothing", "shoes", "toys"];
const CATEGORY_LABEL: Record<Category, string> = {
  clothing: "Clothing",
  shoes: "Shoes",
  toys: "Toys",
};
const CONDITIONS = ["Used like new", "Gently used", "Good", "Used"];

export default function PostPage() {
  const { publishBundle } = useStore();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultSize, setDefaultSize] = useState("");
  const [defaultCondition, setDefaultCondition] = useState("");
  const [publishedCount, setPublishedCount] = useState(0);

  const addPhoto = () => {
    // Simulated capture — a real build uploads to Supabase Storage.
    setPhotos((p) => [...p, itemPhoto("pile-" + Math.random(), "clothing")]);
  };
  const removePhoto = (i: number) =>
    setPhotos((p) => p.filter((_, idx) => idx !== i));

  const runExtraction = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ photoCount: photos.length }),
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setDrafts(data.drafts as DraftItem[]);
    } catch {
      setDrafts(generateDrafts(photos.length)); // offline fallback
    } finally {
      setLoading(false);
      setStep(1);
    }
  };

  const updateDraft = (draftId: string, patch: Partial<DraftItem>) =>
    setDrafts((d) => d.map((x) => (x.id === draftId ? { ...x, ...patch } : x)));
  const removeDraft = (draftId: string) =>
    setDrafts((d) => d.filter((x) => x.id !== draftId));
  const addManualItem = () =>
    setDrafts((d) => [
      ...d,
      {
        id: makeId("draft"),
        name: "",
        category: "clothing",
        sizeFit: defaultSize,
        condition: defaultCondition,
        flaws: "",
        photo: itemPhoto("manual-" + Math.random(), "clothing"),
        confidence: 1,
        aiGenerated: false,
      },
    ]);

  const applyDefaults = () =>
    setDrafts((d) =>
      d.map((x) => ({
        ...x,
        sizeFit: defaultSize || x.sizeFit,
        condition: defaultCondition || x.condition,
      })),
    );

  const publish = () => {
    publishBundle(drafts, photos);
    setPublishedCount(drafts.length);
    setStep(3);
  };

  const detailsValid =
    drafts.length > 0 && drafts.every((d) => d.name.trim() && d.sizeFit.trim());

  // ---- Loading (AI reading) ----
  if (loading) {
    return (
      <>
        <TopBar title="New give-away" showBack backHref="/" showBell={false} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="relative flex size-16 items-center justify-center rounded-full bg-brand-subtle">
            <Sparkles size={28} className="animate-pulse text-brand" aria-hidden />
          </span>
          <div>
            <p className="text-heading-2 text-ink">Reading your photos</p>
            <p className="text-body text-ink-muted mt-1">
              We&apos;re sorting your pile into separate listings. You can edit
              everything next.
            </p>
          </div>
        </main>
      </>
    );
  }

  // ---- Done ----
  if (step === 3) {
    return (
      <>
        <TopBar title="All done" showBell={false} />
        <main className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand text-ink-on-brand">
            <CheckCircle2 size={32} aria-hidden />
          </span>
          <div>
            <h1 className="text-heading-1 text-ink">Your bundle is live</h1>
            <p className="text-body text-ink-muted mt-1">
              {publishedCount} {publishedCount === 1 ? "listing" : "listings"}{" "}
              published and marked <span className="text-ink">available</span>.
              We&apos;ll let you know the moment someone&apos;s interested.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Link href="/messages" className="w-full">
              <Button fullWidth>Go to messages</Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="secondary" fullWidth>
                Back to home
              </Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="New give-away"
        showBack
        backHref={step === 0 ? "/" : undefined}
        showBell={false}
      />

      <div className="border-b border-border-subtle px-4 py-4">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {/* STEP 0 — Photos */}
        {step === 0 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 className="text-heading-2 text-ink">Add photos of your pile</h2>
              <p className="text-body text-ink-muted mt-1">
                Snap everything together — one or a few photos is plenty.
                We&apos;ll turn the pile into a separate listing for each item.
              </p>
            </div>

            <button
              type="button"
              onClick={addPhoto}
              className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-strong bg-surface-200 text-ink-muted transition-colors hover:bg-surface-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Camera size={28} aria-hidden />
              <span className="text-body-medium">Take or add a photo</span>
              <span className="text-caption text-ink-subtle">
                Tap to add to your pile
              </span>
            </button>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Pile photo ${i + 1}`}
                      className="size-full rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label={`Remove photo ${i + 1}`}
                      className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-surface-100/90 text-ink shadow-sm"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPhoto}
                  aria-label="Add another photo"
                  className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-200 text-ink-muted hover:bg-surface-300/60"
                >
                  <ImagePlus size={22} aria-hidden />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1 — Details (AI drafts, editable) */}
        {step === 1 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-md border border-brand/30 bg-brand-subtle p-3">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
              <p className="text-body text-ink">
                We found <span className="font-semibold">{drafts.length}</span>{" "}
                {drafts.length === 1 ? "item" : "items"}. These are drafts — edit
                anything that&apos;s off. Nothing is posted until you publish.
              </p>
            </div>

            {/* Bundle-level defaults */}
            <details className="rounded-md border border-border-subtle bg-surface-200 p-3">
              <summary className="text-heading-3 cursor-pointer text-ink">
                Bundle defaults
              </summary>
              <p className="text-caption text-ink-subtle mt-1">
                Set one size and condition, then apply to every item at once.
              </p>
              <div className="mt-3 flex flex-col gap-3">
                <TextInput
                  label="Size / fit for all"
                  placeholder="e.g. 2-3 yr old"
                  value={defaultSize}
                  onChange={(e) => setDefaultSize(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-label text-ink-muted">Condition for all</span>
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS.map((c) => (
                      <Chip
                        key={c}
                        label={c}
                        selected={defaultCondition === c}
                        onClick={() =>
                          setDefaultCondition(defaultCondition === c ? "" : c)
                        }
                      />
                    ))}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={applyDefaults}
                  disabled={!defaultSize && !defaultCondition}
                >
                  Apply to all items
                </Button>
              </div>
            </details>

            <div className="flex flex-col gap-3">
              {drafts.map((draft, i) => (
                <DraftEditor
                  key={draft.id}
                  draft={draft}
                  index={i}
                  onChange={(patch) => updateDraft(draft.id, patch)}
                  onRemove={() => removeDraft(draft.id)}
                />
              ))}
            </div>

            <Button
              variant="tertiary"
              leftIcon={<Plus size={18} aria-hidden />}
              onClick={addManualItem}
              className="self-start"
            >
              Add an item manually
            </Button>
          </div>
        )}

        {/* STEP 2 — Review */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div>
              <h2 className="text-heading-2 text-ink">Review your bundle</h2>
              <p className="text-body text-ink-muted mt-1">
                {drafts.length} {drafts.length === 1 ? "listing" : "listings"} will
                go live as <span className="text-ink">available</span>. You can
                edit or remove any before publishing.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {drafts.map((d) => (
                <li
                  key={d.id}
                  className="flex gap-3 rounded-md border border-border-subtle bg-surface-200 p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.photo}
                    alt={d.name || "Item"}
                    className="size-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-heading-3 truncate text-ink">
                      {d.name || "Untitled item"}
                    </p>
                    <p className="text-caption text-ink-muted mt-0.5">
                      {CATEGORY_LABEL[d.category]}
                      {d.sizeFit ? ` · ${d.sizeFit}` : ""}
                      {d.condition ? ` · ${d.condition}` : ""}
                    </p>
                    {d.flaws && (
                      <p className="text-caption text-ink-subtle mt-0.5">
                        Note: {d.flaws}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDraft(d.id)}
                    aria-label={`Remove ${d.name || "item"}`}
                    className="self-start rounded-full p-1.5 text-ink-muted hover:bg-surface-300"
                  >
                    <Trash2 size={18} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Sticky footer actions */}
      <div className="sticky bottom-0 flex gap-3 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
        {step === 0 && (
          <Button fullWidth disabled={photos.length === 0} onClick={runExtraction}>
            Continue
          </Button>
        )}
        {step === 1 && (
          <>
            <Button variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              fullWidth
              disabled={!detailsValid}
              onClick={() => setStep(2)}
            >
              Review {drafts.length} {drafts.length === 1 ? "listing" : "listings"}
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button fullWidth onClick={publish}>
              Publish {drafts.length}{" "}
              {drafts.length === 1 ? "listing" : "listings"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}

function DraftEditor({
  draft,
  index,
  onChange,
  onRemove,
}: {
  draft: DraftItem;
  index: number;
  onChange: (patch: Partial<DraftItem>) => void;
  onRemove: () => void;
}) {
  const lowConfidence = draft.aiGenerated && draft.confidence < LOW_CONFIDENCE;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-200 p-3">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={draft.photo}
          alt={draft.name || `Item ${index + 1}`}
          className="size-16 shrink-0 rounded-md object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            {draft.aiGenerated ? (
              lowConfidence ? (
                <span className="text-caption inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-0.5 text-warning">
                  <TriangleAlert size={12} aria-hidden /> Please add details
                </span>
              ) : (
                <span className="text-caption inline-flex items-center gap-1 rounded-full bg-brand-subtle px-2 py-0.5 text-ink">
                  <Sparkles size={12} aria-hidden /> AI suggested
                </span>
              )
            ) : (
              <span className="text-caption text-ink-subtle">Manual item</span>
            )}
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${draft.name || "item"}`}
              className="rounded-full p-1 text-ink-muted hover:bg-surface-300"
            >
              <Trash2 size={16} aria-hidden />
            </button>
          </div>
          <TextInput
            aria-label="Item name"
            placeholder="Item name"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            error={!draft.name.trim() ? "Add a name" : undefined}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_LABEL[c]}
            selected={draft.category === c}
            onClick={() => onChange({ category: c })}
          />
        ))}
      </div>

      <TextInput
        label="Size / fit"
        placeholder="e.g. Boy 2-3 yr old"
        value={draft.sizeFit}
        onChange={(e) => onChange({ sizeFit: e.target.value })}
        error={!draft.sizeFit.trim() ? "Add a size or fit" : undefined}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-label text-ink-muted">Condition</span>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={draft.condition === c}
              onClick={() => onChange({ condition: c })}
            />
          ))}
        </div>
      </div>

      <TextArea
        label="Flaws or notes (optional)"
        placeholder="e.g. Slightly torn sole around the edge"
        value={draft.flaws}
        onChange={(e) => onChange({ flaws: e.target.value })}
      />
    </div>
  );
}
