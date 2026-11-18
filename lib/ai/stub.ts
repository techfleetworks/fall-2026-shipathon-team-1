import type { Category, DraftItem } from "@/lib/types";
import { itemPhoto } from "@/lib/media";
import { id } from "@/lib/utils";

// ------------------------------------------------------------
// Deterministic AI-extraction stub.
// Stands in for a multimodal LLM / image-classification API that
// detects and categorizes children's items from a pile photo and
// drafts one listing per item. Shared by the server route
// (app/api/ai/extract) and used as a client fallback so the flow
// works with no backend. Every draft is EDITABLE and never
// auto-published. Low confidence => manual review hint.
// ------------------------------------------------------------

interface Template {
  name: string;
  category: Category;
  sizeFit: string;
  condition: string;
  flaws: string;
  confidence: number;
}

const CANDIDATES: Template[] = [
  { name: "Puffer jacket", category: "clothing", sizeFit: "Girl 3-4 yr old", condition: "Used like new", flaws: "", confidence: 0.94 },
  { name: "Striped long-sleeve tee", category: "clothing", sizeFit: "2-3 yr old", condition: "Gently used", flaws: "", confidence: 0.89 },
  { name: "Denim dungarees", category: "clothing", sizeFit: "18-24 months", condition: "Gently used", flaws: "Faded knees", confidence: 0.82 },
  { name: "Canvas sneakers", category: "shoes", sizeFit: "Kids US 8", condition: "Used", flaws: "Slight scuff on toe", confidence: 0.77 },
  { name: "Rain boots", category: "shoes", sizeFit: "Toddler US 6", condition: "Used like new", flaws: "", confidence: 0.86 },
  { name: "Wooden stacking toy", category: "toys", sizeFit: "1+ yrs", condition: "Like new", flaws: "", confidence: 0.91 },
  { name: "Soft plush bunny", category: "toys", sizeFit: "All ages", condition: "Good", flaws: "", confidence: 0.6 },
  { name: "Assorted item", category: "clothing", sizeFit: "", condition: "", flaws: "", confidence: 0.41 },
];

/**
 * Produce one draft listing per detected item. Count scales a little
 * with the number of photos the giver added (bundle-first: many items,
 * one action).
 */
export function generateDrafts(photoCount: number): DraftItem[] {
  const count = Math.min(CANDIDATES.length, Math.max(3, photoCount + 2));
  return CANDIDATES.slice(0, count).map((t) => ({
    id: id("draft"),
    name: t.name,
    category: t.category,
    sizeFit: t.sizeFit,
    condition: t.condition,
    flaws: t.flaws,
    photo: itemPhoto(t.name + Math.random(), t.category),
    confidence: t.confidence,
    aiGenerated: true,
  }));
}

export const LOW_CONFIDENCE = 0.7;
