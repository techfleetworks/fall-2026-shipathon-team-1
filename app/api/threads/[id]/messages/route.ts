import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import type { MessageType } from "@/lib/types";

// POST /api/threads/:id/messages  — send a chat message in a thread.
// Body: { body: string, type?: "text" | "quick" | "system" }
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = getSupabaseAdmin();
  const payload = (await request.json().catch(() => ({}))) as {
    body?: string;
    type?: MessageType;
  };
  const text = (payload.body ?? "").trim();
  const type: MessageType = payload.type ?? "text";

  if (!text) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  if (!db) {
    return NextResponse.json(
      { mock: true, message: "Supabase not configured — message kept client-side." },
      { status: 200 },
    );
  }

  const { data, error } = await db
    .from("messages")
    .insert({ thread_id: params.id, sender: "giver", body: text, type })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data }, { status: 201 });
}
