"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CircleHelp,
  PackageCheck,
  SendHorizontal,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { Button } from "@/components/Button";
import { ClockTime } from "@/components/TimeText";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Low-effort quick replies so the giver rarely has to type.
const QUICK_REPLIES: Record<string, string | null> = {
  "Say hi": "Hi! Thanks so much for your interest.",
  "Share pickup address":
    "You can pick up from 14 Rosewood Lane. Let me know what time suits you.",
  "Ask for pickup availability": "When are you free to pick up this week?",
  "something else": null, // focuses the text field
};

export default function ChatPage() {
  const params = useParams<{ threadId: string }>();
  const router = useRouter();
  const { getThread, getItem, sendMessage, markGone } = useStore();
  const thread = getThread(params.threadId);
  const item = thread ? getItem(thread.itemId) : undefined;

  const [text, setText] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  if (!thread || !item) {
    return (
      <>
        <TopBar title="Chat" showBack backHref="/messages" showBell={false} />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-heading-3 text-ink">This chat isn&apos;t available</p>
          <Button variant="secondary" onClick={() => router.push("/messages")}>
            Back to messages
          </Button>
        </main>
      </>
    );
  }

  const isGone = item.status === "gone";

  const handleQuick = (label: string) => {
    const preset = QUICK_REPLIES[label];
    if (preset === null) {
      inputRef.current?.focus();
      return;
    }
    if (preset) sendMessage(thread.id, preset, "quick");
  };

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(thread.id, text);
    setText("");
  };

  return (
    <>
      <TopBar title={thread.participant.name} showBack backHref="/messages" showBell={false} />

      {/* Item header */}
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photos[0]}
          alt={item.name}
          className="size-10 shrink-0 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-heading-3 truncate text-ink">{item.name}</p>
          <p className="text-caption text-success">
            {isGone ? "Picked up — gone" : "Accepted — coordinating pickup"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowHelp((s) => !s)}
          aria-expanded={showHelp}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-ink-muted hover:bg-surface-200"
        >
          <CircleHelp size={18} aria-hidden />
          <span className="text-caption">How it works</span>
        </button>
      </div>

      {showHelp && (
        <div className="animate-fade-in border-b border-border-subtle bg-surface-200 px-4 py-3">
          <p className="text-body text-ink-muted">
            Agree a pickup time and place here. Once they&apos;ve collected the
            item, mark it <span className="text-ink">gone</span> so everyone knows
            it&apos;s no longer available.
          </p>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {thread.messages.map((m) => {
            if (m.type === "system") {
              return (
                <p
                  key={m.id}
                  className="text-caption mx-auto max-w-[80%] rounded-full bg-surface-200 px-3 py-1 text-center text-ink-subtle"
                >
                  {m.text}
                </p>
              );
            }
            const mine = m.from === "giver";
            return (
              <div
                key={m.id}
                className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}
              >
                {!mine && (
                  <Avatar
                    src={thread.participant.avatar}
                    name={thread.participant.name}
                    size={28}
                  />
                )}
                <div
                  className={cn(
                    "max-w-[76%] rounded-xl px-3 py-2",
                    mine
                      ? "rounded-br-sm bg-brand text-ink-on-brand"
                      : "rounded-bl-sm bg-surface-200 text-ink",
                  )}
                >
                  <p className="text-body">{m.text}</p>
                  <p
                    className={cn(
                      "text-[11px] leading-4 mt-0.5",
                      mine ? "text-ink-on-brand/70" : "text-ink-subtle",
                    )}
                  >
                    <ClockTime iso={m.createdAt} />
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </main>

      {/* Mark-as-gone nudge */}
      {!isGone && (
        <div className="flex items-center gap-3 border-t border-border-subtle bg-brand-subtle/50 px-4 py-2.5">
          <PackageCheck size={18} className="shrink-0 text-ink-muted" aria-hidden />
          <p className="text-caption text-ink-muted flex-1">
            Did {thread.participant.name} pick this up?
          </p>
          <button
            type="button"
            onClick={() => markGone(item.id)}
            className="text-label rounded-full bg-brand px-3 py-1.5 text-ink-on-brand hover:bg-brand-hover"
          >
            Yes, mark it gone
          </button>
        </div>
      )}

      {/* Composer */}
      {isGone ? (
        <div className="border-t border-border-subtle bg-surface-100 p-4 text-center">
          <p className="text-body text-ink-muted">
            This item is marked gone. Thanks for closing the loop.
          </p>
        </div>
      ) : (
        <div className="sticky bottom-0 border-t border-border-subtle bg-surface-100/95 backdrop-blur">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3">
            {thread.quickReplies.map((q) => (
              <Chip
                key={q}
                label={q}
                dashed
                onClick={() => handleQuick(q)}
                className="shrink-0 whitespace-nowrap"
              />
            ))}
          </div>
          <div className="flex items-center gap-2 p-4">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write a message"
              aria-label="Message"
              className="text-body flex-1 rounded-full border border-border bg-surface-100 px-4 py-2.5 text-ink placeholder:text-ink-subtle focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim()}
              aria-label="Send message"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-ink-on-brand hover:bg-brand-hover disabled:bg-surface-300 disabled:text-ink-subtle"
            >
              <SendHorizontal size={20} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
