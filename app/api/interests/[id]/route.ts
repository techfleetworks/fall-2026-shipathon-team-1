import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";

// PATCH /api/interests/:id  — act on the current #1 in an item's queue.
// Body: { action: "accept" | "decline" }
//
// accept  -> interest.accepted, item.accepted, (a thread is opened elsewhere)
// decline -> interest.declined, promote the next person to active, reindex.
// The ordered FIFO rule (only #1 can be actioned) is enforced client-side in
// the mock store (lib/store.tsx) and should be enforced here via a Postgres
// function / trigger in production.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = getSupabaseAdmin();
  const body = (await request.json().catch(() => ({}))) as {
    action?: "accept" | "decline";
  };
  const action = body.action;

  if (action !== "accept" && action !== "decline") {
    return NextResponse.json(
      { error: 'action must be "accept" or "decline"' },
      { status: 400 },
    );
  }

  if (!db) {
    return NextResponse.json(
      { mock: true, message: "Supabase not configured — queue kept client-side." },
      { status: 200 },
    );
  }

  // Minimal reference implementation; wrap in an RPC/transaction for production.
  const { data: interest, error } = await db
    .from("interests")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !interest) {
    return NextResponse.json({ error: "interest not found" }, { status: 404 });
  }
  if (interest.state !== "active") {
    return NextResponse.json(
      { error: "only the current #1 in the queue can be actioned" },
      { status: 409 },
    );
  }

  if (action === "accept") {
    await db.from("interests").update({ state: "accepted" }).eq("id", interest.id);
    await db.from("items").update({ status: "accepted" }).eq("id", interest.item_id);
    return NextResponse.json({ ok: true, action });
  }

  // decline: mark declined, promote next
  await db.from("interests").update({ state: "declined" }).eq("id", interest.id);
  const { data: rest } = await db
    .from("interests")
    .select("*")
    .eq("item_id", interest.item_id)
    .eq("state", "waiting")
    .order("position", { ascending: true });

  if (rest && rest.length > 0) {
    await db.from("interests").update({ state: "active" }).eq("id", rest[0].id);
    await db.from("items").update({ status: "requested" }).eq("id", interest.item_id);
  } else {
    await db.from("items").update({ status: "available" }).eq("id", interest.item_id);
  }
  return NextResponse.json({ ok: true, action });
}
