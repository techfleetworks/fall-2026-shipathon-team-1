import { NextResponse } from "next/server";
import { generateDrafts } from "@/lib/ai/stub";

// POST /api/ai/extract
// Body: { photoCount: number }
// Returns: { drafts: DraftItem[], provider: "stub" | "<provider>" }
//
// When AI_PROVIDER + a key are configured, this is where you'd send the
// uploaded photos to a multimodal LLM / image-classification API and map
// its response into DraftItem[]. It must ALWAYS return editable drafts and
// never auto-publish. We fall back to the deterministic stub otherwise.
export async function POST(request: Request) {
  let photoCount = 3;
  try {
    const body = await request.json();
    if (typeof body?.photoCount === "number") photoCount = body.photoCount;
  } catch {
    /* use default */
  }

  const provider = process.env.AI_PROVIDER;

  if (provider) {
    // Integration seam — real provider call goes here, e.g. Anthropic:
    //
    //   const res = await fetch("https://api.anthropic.com/v1/messages", {
    //     method: "POST",
    //     headers: {
    //       "x-api-key": process.env.ANTHROPIC_API_KEY!,
    //       "anthropic-version": "2023-06-01",
    //       "content-type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       model: process.env.AI_MODEL ?? "claude-opus-4-8",
    //       max_tokens: 1024,
    //       messages: [{ role: "user", content: [ ...images, promptText ] }],
    //     }),
    //   });
    //   const drafts = mapResponseToDrafts(await res.json());
    //   return NextResponse.json({ drafts, provider });
    //
    // Not wired in this build — fall through to the stub so the flow works.
  }

  // Simulate a little model latency for a realistic "reading your photos" state.
  await new Promise((r) => setTimeout(r, 650));

  return NextResponse.json({ drafts: generateDrafts(photoCount), provider: "stub" });
}
