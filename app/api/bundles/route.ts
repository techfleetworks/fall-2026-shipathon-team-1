import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";

// GET  /api/bundles        — list bundles with their items
// POST /api/bundles        — publish a new bundle (creates N item listings)
//
// These handlers use Supabase when configured; otherwise the app runs on
// the in-memory mock store (lib/store.tsx) and these return a mock notice.

export async function GET() {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json(
      { mock: true, message: "Supabase not configured — using mock store." },
      { status: 200 },
    );
  }
  const { data, error } = await db
    .from("bundles")
    .select("*, items(*, interests(*))")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bundles: data });
}

export async function POST(request: Request) {
  const db = getSupabaseAdmin();
  const body = await request.json().catch(() => ({}));
  const { giverId, photos = [], items = [] } = body as {
    giverId?: string;
    photos?: string[];
    items?: Array<Record<string, unknown>>;
  };

  if (!db) {
    return NextResponse.json(
      { mock: true, message: "Supabase not configured — bundle kept client-side." },
      { status: 200 },
    );
  }
  if (!giverId || items.length === 0) {
    return NextResponse.json(
      { error: "giverId and at least one item are required." },
      { status: 400 },
    );
  }

  const { data: bundle, error: bErr } = await db
    .from("bundles")
    .insert({ giver_id: giverId, photos, status: "published" })
    .select()
    .single();
  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });

  const rows = items.map((it) => ({ ...it, bundle_id: bundle.id, status: "available" }));
  const { data: created, error: iErr } = await db.from("items").insert(rows).select();
  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

  return NextResponse.json({ bundle, items: created }, { status: 201 });
}
