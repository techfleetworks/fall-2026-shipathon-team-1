"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, MoreHorizontal, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ClockTime } from "@/components/TimeText";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Message, Pickup } from "@/lib/types";

export default function ChatPage() {
  const params = useParams<{ threadId: string }>();
  const router = useRouter();
  const {
    getThread,
    getItem,
    getPosterOf,
    amIGiver,
    otherParty,
    sendMessage,
    sharePickupAddress,
    proposePickupTime,
    markArranged,
    markPickupComplete,
  } = useStore();

  const thread = getThread(params.threadId);
  const item = thread ? getItem(thread.itemId) : undefined;
  const poster = item ? getPosterOf(item.id) : undefined;

  const [text, setText] = useState("");
  const [showNudge, setShowNudge] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  if (!thread || !item) {
    return (
      <>
        <header className="flex h-14 items-center gap-2 border-b border-border-subtle px-4">
          <button onClick={() => router.push("/inbox")} aria-label="Back"><ArrowLeft size={22} /></button>
          <span className="text-heading-3 text-ink">Chat</span>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-heading-3 text-ink">This chat isn&apos;t available</p>
          <Button variant="secondary" onClick={() => router.push("/inbox")}>Back to inbox</Button>
        </main>
      </>
    );
  }

  const iGive = amIGiver(thread);
  const other = otherParty(thread);
  const pickup: Pickup = thread.pickup ?? { status: "none" };
  const complete = pickup.status === "complete" || item.status === "gone";

  const quick: { label: string; run: () => void }[] = iGive
    ? [
        { label: 'Say "Hi"', run: () => sendMessage(thread.id, `Hi ${other.name}! Ready to arrange pickup?`, "quick") },
        { label: "Share pickup address", run: () => sharePickupAddress(thread.id) },
        { label: "Ask for pick-up availability", run: () => sendMessage(thread.id, "When would you like to collect them?", "quick") },
        { label: "Type in custom message", run: () => inputRef.current?.focus() },
      ]
    : [
        { label: 'Say "Hi"', run: () => sendMessage(thread.id, `Hi ${other.name}! Thanks for the ${item.name.toLowerCase()}.`, "quick") },
        { label: 'Say "Thank you"', run: () => sendMessage(thread.id, "Thank you so much!", "quick") },
        { label: "Ask for pickup address", run: () => sendMessage(thread.id, `Where can I pick up the ${item.name.toLowerCase()}?`, "quick") },
        { label: "Propose a time", run: () => proposePickupTime(thread.id, "tomorrow, 5–6 pm") },
        { label: "Type in custom message", run: () => inputRef.current?.focus() },
      ];

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(thread.id, text);
    setText("");
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border-subtle bg-surface-100/95 px-3 backdrop-blur">
        <button onClick={() => router.push("/inbox")} aria-label="Back" className="flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface-200">
          <ArrowLeft size={22} aria-hidden />
        </button>
        <Avatar src={other.avatar} name={other.name} size={30} />
        <span className="text-heading-3 flex-1 truncate text-ink">{other.name}</span>
        <button aria-label="More" className="flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-200">
          <MoreHorizontal size={20} aria-hidden />
        </button>
      </header>

      {/* Item strip */}
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.photos[0]} alt={item.name} className="size-10 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-body-medium truncate text-ink">{item.name}</p>
          <p className="text-caption text-ink-subtle">{poster?.distanceMi ?? 0} miles away</p>
        </div>
        <Link href={`/item/${item.id}`} className="text-label text-brand">View post</Link>
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2.5">
          {thread.messages.map((m) => (
            <MessageBubble key={m.id} message={m} pickup={pickup} otherAvatar={other.avatar} otherName={other.name} />
          ))}
          <div ref={endRef} />
        </div>
      </main>

      {!complete ? (
        <div className="sticky bottom-0 bg-surface-100/95 backdrop-blur">
          {/* Pickup progress / mark complete */}
          {pickup.status !== "none" && showNudge && (
            <div className="flex items-center gap-2 border-t border-border-subtle px-4 py-2">
              <div className="flex-1">
                <p className="text-caption text-ink">Did the pickup happen?</p>
                <div className="flex gap-3">
                  {pickup.status === "time_proposed" && (
                    <button type="button" onClick={() => markArranged(thread.id)} className="text-label text-ink inline-flex items-center gap-1">
                      <CheckCircle2 size={14} aria-hidden /> Confirm time
                    </button>
                  )}
                  <button type="button" onClick={() => markPickupComplete(thread.id)} className="text-label text-brand">Mark as complete</button>
                </div>
              </div>
              <button type="button" onClick={() => setShowNudge(false)} aria-label="Dismiss" className="text-ink-subtle">
                <X size={16} aria-hidden />
              </button>
            </div>
          )}

          {/* Quick replies */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-border-subtle px-4 pt-3">
            {quick.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={q.run}
                className="text-label shrink-0 whitespace-nowrap rounded-full border border-border bg-surface-100 px-3 py-1.5 text-ink hover:bg-surface-200"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 p-4">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write a message..."
              aria-label="Message"
              className="text-body flex-1 rounded-full border border-border bg-surface-100 px-4 py-2.5 text-ink placeholder:text-ink-subtle focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim()}
              aria-label="Send"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-ink-on-brand hover:bg-brand-hover disabled:bg-surface-300 disabled:text-ink-subtle"
            >
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-border-subtle bg-surface-100 p-5 text-center">
          <p className="text-body text-ink-muted">This conversation is complete.</p>
        </div>
      )}
    </>
  );
}

function MessageBubble({
  message: m,
  pickup,
  otherAvatar,
  otherName,
}: {
  message: Message;
  pickup: Pickup;
  otherAvatar: string;
  otherName: string;
}) {
  if (m.type === "system") {
    return <p className="text-caption mx-auto my-1 text-center text-ink-subtle">{m.text}</p>;
  }

  const mine = m.from === "me";

  if (m.type === "pickup") {
    return (
      <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
        <div className="max-w-[80%] rounded-xl bg-surface-200 p-3">
          <p className="text-caption text-ink-subtle inline-flex items-center gap-1"><MapPin size={13} aria-hidden /> Pickup address</p>
          <p className="text-body-medium text-ink mt-1">{m.text}</p>
          {pickup.entrance && <p className="text-caption text-ink-muted">{pickup.entrance}</p>}
          <p className={cn("text-caption mt-0.5", pickup.time ? "text-ink-muted" : "text-accent")}>
            {pickup.time ? `Time: ${pickup.time}` : "Time to be confirmed"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine && <Avatar src={otherAvatar} name={otherName} size={26} />}
      <div
        className={cn(
          "max-w-[76%] rounded-2xl px-3.5 py-2",
          mine ? "rounded-br-sm border border-brand-muted bg-brand-subtle/50 text-ink" : "rounded-bl-sm bg-surface-200 text-ink",
        )}
      >
        <p className="text-body">{m.text}</p>
        <p className="text-[11px] leading-4 mt-0.5 text-ink-subtle"><ClockTime iso={m.createdAt} /></p>
      </div>
    </div>
  );
}
