"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Info,
  MessageCircle,
  MessageSquare,
  PackageCheck,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { StatusBadge } from "@/components/StatusBadge";
import { PosterRow } from "@/components/PosterRow";
import { TimeAgo } from "@/components/TimeText";
import { useStore, queueOf } from "@/lib/store";
import { CATEGORY_LABEL } from "@/lib/utils";
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
  } = useStore();

  const item = getItem(params.id);
  const [note, setNote] = useState("");
  const [notified, setNotified] = useState(false);

  if (!item) {
    return (
      <>
        <TopBar title="Item" showBack backHref="/browse" showBell={false} />
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
  const joined = mine && (mine.state === "waiting" || mine.state === "active");
  const accepted = mine && mine.state === "accepted";
  const closed = mine && (mine.state === "declined" || mine.state === "expired");
  const photos = item.photos.length >= 2 ? item.photos.slice(0, 2) : item.photos;

  return (
    <>
      <TopBar showBack backHref="/browse" />
      <main className="flex-1 overflow-y-auto pb-28">
        {joined && (
          <div className="flex items-center gap-2 bg-brand-subtle px-4 py-2.5">
            <PackageCheck size={16} className="text-ink" aria-hidden />
            <p className="text-label text-ink">You&apos;ve shown interest to this item!</p>
          </div>
        )}

        <div className="flex flex-col gap-4 px-4 py-4">
          {poster && <PosterRow poster={poster} postedAt={bundle?.createdAt ?? new Date().toISOString()} />}

          <div className="grid grid-cols-2 gap-2">
            {photos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`${item.name} photo ${i + 1}`} className="aspect-[3/4] w-full rounded-md object-cover" />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <h1 className="text-heading-1 text-ink">{item.name}</h1>
            {joined || accepted ? (
              <Tag tone={accepted ? "green" : "outline"}>{accepted ? "Accepted" : "Your interest"}</Tag>
            ) : (
              <StatusBadge item={item} />
            )}
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
          <p className="text-caption text-ink-subtle">Category: {CATEGORY_LABEL[item.category]}</p>

          {!isGone && (
            <section className="flex flex-col gap-3 border-t border-border-subtle pt-4">
              {queue.length === 0 ? (
                <p className="text-body text-ink-subtle text-center py-2">Nobody has shown interest yet</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {mine && joined && <InterestRow interest={mine} youLabel />}
                  {otherInterests.map((i) => (
                    <InterestRow key={i.id} interest={i} />
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Receive updates (optional) — after joining */}
          {joined && (
            <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface-200 p-3">
              <p className="text-body-medium text-ink">Get instant status updates</p>
              <p className="text-caption text-ink-muted">
                Turn on notifications to receive updates on your request status.
              </p>
              {notified ? (
                <Tag tone="green" icon={<CheckCircle2 size={13} aria-hidden />} className="self-start">
                  Notifications on
                </Tag>
              ) : (
                <Button leftIcon={<Bell size={16} aria-hidden />} onClick={() => setNotified(true)} className="self-start">
                  Turn on notifications
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Sticky action area */}
      <div className="sticky bottom-0 border-t border-border-subtle bg-surface-100/95 p-4 backdrop-blur">
        {isGone ? (
          <p className="text-body text-ink-muted text-center">This item has found a home and is marked gone.</p>
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
            <NoteInput value={mine!.note} readOnly placeholder="Your note to the giver" />
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => router.push("/browse")} className="text-button text-ink-muted px-2">Cancel</button>
              <Button variant="secondary" fullWidth onClick={() => withdrawInterest(item.id)}>Withdraw interest</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-body-medium text-ink inline-flex items-center gap-1.5">
              {queue.length > 0
                ? `${queue.length} ${queue.length === 1 ? "person is" : "People are"} interested already. Join them?`
                : "Are you interested in this item?"}
              {queue.length > 0 && <Info size={15} className="text-ink-subtle" aria-hidden />}
            </p>
            <NoteInput value={note} onChange={setNote} placeholder="Add any note or comment" />
            {queue.length > 0 ? (
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => router.push("/browse")} className="text-button text-ink-muted px-2">Cancel</button>
                <Button fullWidth onClick={() => joinInterest(item.id, note)}>Join interest queue</Button>
              </div>
            ) : (
              <Button fullWidth onClick={() => joinInterest(item.id, note)}>I&apos;m interested</Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function InterestRow({ interest, youLabel }: { interest: Interest; youLabel?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <Avatar src={interest.receiver.avatar} name={interest.receiver.name} size={32} />
      <div className="min-w-0 flex-1">
        <p className="text-body text-ink">
          {youLabel ? "You've shown interest!" : `${interest.receiver.name} is interested`}
        </p>
        <p className="text-caption text-ink-subtle"><TimeAgo iso={interest.createdAt} /></p>
      </div>
      <Tag tone="outline">requested</Tag>
    </li>
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
