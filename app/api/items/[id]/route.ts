import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import type { ItemStatus } from "@/lib/types";

// PATCH /api/items/:id  — change an item's status (available/requested/accepted/gone)
// Status is the single source of truth, so this is the one place it moves.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = getSupabaseAdmin();
  const body = (await request.json().catch(() => ({}))) as { status?: ItemStatus };
  const status = body.status;

  const allowed: ItemStatus[] = ["available", "requested", "accepted", "gone"];
  if (!status || !allowed.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of ${allowed.join(", ")}` },
      { status: 400 },
    );
  }

  if (!db) {
    return NextResponse.json(
      { mock: true, message: "Supabase not configured — status kept client-side." },
      { status: 200 },
    );
  }

  const { data, error } = await db
    .from("items")
    .update({ status })
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
