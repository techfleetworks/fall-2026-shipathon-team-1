"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  PackageCheck,
  X,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { StatusBadge } from "@/components/StatusBadge";
import { PosterRow } from "@/components/PosterRow";
import { TimeAgo } from "@/components/TimeText";
import { useStore, queueOf } from "@/lib/store";
import type { Interest } from "@/lib/types";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    me,
    getItem,
    getBundleOf,
    getPosterOf,
    getMyInterest,
    getThreadByItem,
    joinInterest,
    withdrawInterest,
    notificationsEnabled,
    enableNotifications,
  } = useStore();

  const item = getItem(params.id);
  const [note, setNote] = useState("");
  const [localNotified, setLocalNotified] = useState(false);
  const notified = notificationsEnabled || localNotified;
  const [showNotifySheet, setShowNotifySheet] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (!showBanner) return;
    const timer = setTimeout(() => setShowBanner(false), 4000);
    return () => clearTimeout(timer);
  }, [showBanner]);

  if (!item) {
    return (
      <>
        <TopBar title="Item" showBack showBell={false} />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-heading-3 text-ink">This item isn&apos;t available</p>
          <Button variant="secondary" onClick={() => router.push("/browse")}>Back to results</Button>
        </main>
      </>
    );
  }

  const bundle = getBundleOf(item.id);
  const poster = getPosterOf(item.id);
  const mine = getMyInterest(item.id);
  const queue = queueOf(item);
  const otherInterests = queue.filter((i) => i.receiver.id !== me.id);
  const thread = getThreadByItem(item.id);
  const isGone = item.status === "gone";
  const isTaken = item.status === "accepted" && (!mine || mine.state !== "accepted");
  const joined = mine && (mine.state === "waiting" || mine.state === "active");
  const accepted = mine && mine.state === "accepted";
  const closed = mine && (mine.state === "declined" || mine.state === "expired");
  const photo = item.photos[0];

  return (
    <>
      <TopBar showBack />
      <main className={`flex-1 overflow-y-auto ${joined && notified ? "pb-8" : "pb-28"}`}>
        {joined && showBanner && (
          <div className="bg-brand-subtle px-4 py-2.5 transition-opacity duration-500">
            <div className="flex items-center gap-2">
              <PackageCheck size={16} className="text-ink shrink-0" aria-hidden />
              <p className="text-label text-ink flex-1">You&apos;ve shown interest to this item!</p>
              <button type="button" onClick={() => setShowBanner(false)} aria-label="Dismiss" className="shrink-0 rounded-full p-0.5 text-ink-muted hover:text-ink">
                <X size={16} aria-hidden />
              </button>
            </div>
            {mine?.note && (
              <p className="text-body text-ink-muted mt-1.5 pl-6">&ldquo;{mine.note}&rdquo;</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 px-4 py-4">
          {poster && <PosterRow poster={poster} postedAt={bundle?.createdAt ?? new Date().toISOString()} />}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt={item.name} className="aspect-[4/3] w-full rounded-md object-cover" />

          <div className="flex items-center justify-between gap-2">
            <h1 className="text-heading-1 text-ink">{item.name}</h1>
            <StatusBadge item={item} userJoined={!!(joined || accepted)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Meta label="Size/Fit" value={item.sizeFit} />
            <Meta label="Condition" value={item.condition} />
          </div>
          {item.flaws && (
            <div>
              <p className="text-caption text-ink-subtle">Flaws</p>
              <p className="text-body text-ink mt-0.5">{item.flaws}</p>
            </div>
          )}
          {!isGone && (
            <section className="flex flex-col gap-3 border-t border-border-subtle pt-4">
              {queue.length === 0 && !accepted ? (
                <p className="text-body text-ink-subtle text-center py-2">Nobody has shown interest yet</p>
              ) : (
                <div className="flex flex-col">
                  {otherInterests.map((i, idx) => (
                    <div key={i.id}>
                      {idx > 0 && <div className="my-3 border-t border-border-subtle" />}
                      <InterestRow interest={i} />
                    </div>
                  ))}
                  {mine && (joined || accepted) && (
                    <>
                      {otherInterests.length > 0 && <div className="my-3 border-t border-border-subtle" />}
                      <InterestRow interest={mine} youLabel state={accepted ? "accepted" : "requested"} onWithdraw={joined ? () => withdrawInterest(item.id) : undefined} />
                    </>
                  )}
                </div>
              )}
            </section>
          )}

        </div>
      </main>

      {/* Bottom sheet */}
      {!(joined && notified) && (
      <div className="sticky bottom-0 z-10 rounded-t-2xl border-t border-border-subtle bg-surface-pure px-4 pb-6 pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        {isGone || isTaken ? (
          <p className="text-body text-ink-muted text-center">This item has found a home.</p>
        ) : accepted ? (
          <Button fullWidth leftIcon={<MessageCircle size={18} aria-hidden />} onClick={() => thread && router.push(`/inbox/${thread.id}`)}>
            Start chat with {poster?.name}
          </Button>
        ) : closed ? (
          <div className="rounded-md bg-surface-200 p-3 text-center">
            <p className="text-body-medium text-ink">
              {mine?.state === "expired" ? "This request timed out." : "This went to someone ahead of you."}
            </p>
            <p className="text-caption text-ink-subtle mt-0.5">Keep searching — new items are posted every day.</p>
          </div>
        ) : joined ? (
          <div className="flex flex-col gap-3">
            <p className="text-body-medium text-ink">Get instant status updates</p>
            <p className="text-caption text-ink-muted">
              Turn on notifications to receive updates on your request status.
            </p>
            <Button fullWidth leftIcon={<Bell size={16} aria-hidden />} onClick={() => { enableNotifications(); setLocalNotified(true); }}>
              Turn on notifications
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-body-medium text-ink">
              {queue.length > 0
                ? `${queue.length} ${queue.length === 1 ? "Person is" : "People are"} interested already. Join them?`
                : "Are you interested in this item?"}
            </p>
            <NoteInput value={note} onChange={setNote} placeholder="Add any note or comment" />
            {queue.length > 0 ? (
              <div className="grid grid-cols-[auto_1fr] gap-3">
                <button type="button" onClick={() => router.push("/browse")} className="text-button text-ink-muted px-4 py-2.5">Cancel</button>
                <Button fullWidth onClick={() => joinInterest(item.id, note)}>Join interest queue</Button>
              </div>
            ) : (
              <Button fullWidth onClick={() => joinInterest(item.id, note)}>I&apos;m interested</Button>
            )}
          </div>
        )}
      </div>
      )}
    </>
  );
}

function InterestRow({ interest, youLabel, state, onWithdraw }: { interest: Interest; youLabel?: boolean; state?: "requested" | "accepted"; onWithdraw?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="flex items-center gap-3">
      <Avatar src={interest.receiver.avatar} name={interest.receiver.name} size={32} />
      <div className="min-w-0 flex-1">
        <p className="text-body text-ink">
          {youLabel ? "You’ve shown interest!" : `${interest.receiver.name} is interested`}
        </p>
        <p className="text-caption text-ink-subtle"><TimeAgo iso={interest.createdAt} /></p>
      </div>
      <div className="flex items-center gap-1.5">
        <Tag tone={state === "accepted" ? "green" : "outline"}>{state === "accepted" ? "accepted" : "requested"}</Tag>
        {youLabel && onWithdraw && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
              className="flex size-7 items-center justify-center rounded-full text-ink-muted hover:bg-surface-200"
            >
              <MoreHorizontal size={18} aria-hidden />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-border bg-surface-100 py-1 shadow-lg">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-body text-ink hover:bg-surface-200"
                  onClick={() => { onWithdraw(); setMenuOpen(false); }}
                >
                  Withdraw interest
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteInput({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-100 px-3 py-2.5">
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="text-body flex-1 bg-transparent text-ink placeholder:text-ink-subtle focus:outline-none"
      />
      <MessageSquare size={16} className="text-ink-subtle" aria-hidden />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-caption text-ink-subtle">{label}</p>
      <p className="text-body-medium text-ink mt-0.5">{value}</p>
    </div>
  );
}
