"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox as InboxIcon, MessageSquare } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { Avatar } from "@/components/Avatar";
import { InterestQueue } from "@/components/InterestQueue";
import { PostedAgo, TimeAgo } from "@/components/TimeText";
import { useStore, queueOf, type SentRequest } from "@/lib/store";
import { cn, remaining } from "@/lib/utils";

type Tab = "requests" | "messages";

export default function InboxPage() {
  const [tab, setTab] = useState<Tab>("requests");

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-24">
        <h1 className="text-heading-1 text-ink px-4 pt-2">Inbox</h1>

        {/* Top tabs */}
        <div className="mt-2 flex gap-6 border-b border-border-subtle px-4" role="tablist">
          {(["requests", "messages"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "text-body-medium -mb-px border-b-2 pb-2 capitalize transition-colors",
                tab === t ? "border-brand text-ink" : "border-transparent text-ink-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-4 pt-4">
          {tab === "requests" ? <RequestsTab /> : <MessagesTab />}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

// -------------------- Requests (Sent / Received) --------------------
function RequestsTab() {
  const { mySentRequests, myReceivedItems } = useStore();
  const [side, setSide] = useState<"sent" | "received">("sent");

  return (
    <>
      <div className="flex gap-1 rounded-md border border-border-subtle bg-surface-200 p-1">
        <SideButton active={side === "sent"} onClick={() => setSide("sent")} label={`Sent (${mySentRequests.length})`} />
        <SideButton active={side === "received"} onClick={() => setSide("received")} label={`Received (${myReceivedItems.length})`} />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {side === "sent" ? <SentList /> : <ReceivedList />}
      </div>
    </>
  );
}

function SideButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "text-label flex-1 rounded-sm py-1.5 transition-colors",
        active ? "bg-surface-100 text-ink shadow-sm" : "text-ink-muted",
      )}
    >
      {label}
    </button>
  );
}

function SentList() {
  const { mySentRequests } = useStore();
  const router = useRouter();

  if (mySentRequests.length === 0) {
    return <EmptyState icon={<InboxIcon size={26} aria-hidden />} title="No sent requests" body="Items you ask for will show up here." actionLabel="Search items" href="/search" />;
  }

  return (
    <>
      {mySentRequests.map((r) => (
        <SentCard key={r.interest.id} req={r} onBrowse={() => router.push("/search")} />
      ))}
    </>
  );
}

function SentCard({ req, onBrowse }: { req: SentRequest; onBrowse: () => void }) {
  const { item, interest, poster } = req;
  const router = useRouter();
  const { getThreadByItem, withdrawInterest } = useStore();
  const thread = getThreadByItem(item.id);
  const rem = interest.expiresAt ? remaining(interest.expiresAt) : "";

  let tag = <Tag tone="gray">—</Tag>;
  let actions: React.ReactNode = null;

  if (interest.state === "accepted") {
    tag = <Tag tone="green">Accepted request</Tag>;
    actions = (
      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={() => withdrawInterest(item.id)}>Withdraw request</Button>
        <Button fullWidth onClick={() => thread && router.push(`/inbox/${thread.id}`)}>Start a chat</Button>
      </div>
    );
  } else if (interest.state === "active" || interest.state === "waiting") {
    tag = <Tag tone="amber">Waiting · {rem ? `${rem} left` : "in queue"}</Tag>;
    actions = (
      <Button variant="secondary" fullWidth onClick={() => withdrawInterest(item.id)}>Withdraw request</Button>
    );
  } else if (interest.state === "declined" || item.status === "gone") {
    tag = <Tag tone="gray">This bundle found a home</Tag>;
    actions = (
      <button type="button" onClick={onBrowse} className="text-label text-brand self-start">Browse similar</button>
    );
  } else if (interest.state === "expired") {
    tag = <Tag tone="gray">This request timed out</Tag>;
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-pure p-3">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.photos[0]} alt={item.name} className="size-12 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-body-medium text-ink">{item.name} · {item.sizeFit}</p>
          <div className="mt-1">{tag}</div>
          <p className="text-caption text-ink-subtle mt-1">From {poster.name}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}

function ReceivedList() {
  const { myReceivedItems, getBundleOf } = useStore();

  if (myReceivedItems.length === 0) {
    return <EmptyState icon={<InboxIcon size={26} aria-hidden />} title="No requests yet" body="When someone is interested in your listing, their request will show up here." actionLabel="Post a give-away" href="/post" />;
  }

  return (
    <>
      {myReceivedItems.map((item) => {
        const bundle = getBundleOf(item.id);
        const interested = queueOf(item).length;
        if (item.status === "gone") {
          const given = item.interests.filter((i) => i.state === "accepted").length;
          const declined = item.interests.filter((i) => i.state === "declined").length;
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-200/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.photos[0]} alt={item.name} className="size-12 shrink-0 rounded-md object-cover opacity-70" />
              <div className="min-w-0 flex-1">
                <p className="text-body-medium text-ink-muted">{item.name}</p>
                <p className="text-caption text-ink-subtle">{bundle ? <PostedAgo iso={bundle.createdAt} /> : ""}</p>
              </div>
              <span className="text-caption text-ink-subtle">{given} Given · {declined} Declined</span>
            </div>
          );
        }
        return (
          <section key={item.id} className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-pure p-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.photos[0]} alt={item.name} className="size-12 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-body-medium text-ink">{item.name} · {item.sizeFit}</p>
                <p className="text-caption text-ink-subtle">{bundle ? <PostedAgo iso={bundle.createdAt} /> : ""}</p>
                {item.status !== "accepted" && (
                  <p className="text-caption text-ink-muted mt-0.5">{interested} people interested</p>
                )}
              </div>
            </div>
            <InterestQueue item={item} />
          </section>
        );
      })}
    </>
  );
}

// -------------------- Messages --------------------
function MessagesTab() {
  const { myThreads, getItem, otherParty } = useStore();

  if (myThreads.length === 0) {
    return <EmptyState icon={<MessageSquare size={26} aria-hidden />} title="No messages yet" body="Start a conversation by showing interest in an item. Messages with givers appear here." actionLabel="Browse items nearby" href="/search" />;
  }

  return (
    <ul className="flex flex-col">
      {myThreads.map((t) => {
        const item = getItem(t.itemId);
        const other = otherParty(t);
        const last = t.messages[t.messages.length - 1];
        const unread = last?.from === "them";
        return (
          <li key={t.id}>
            <Link
              href={`/inbox/${t.id}`}
              className="flex items-center gap-3 border-b border-border-subtle py-3 hover:bg-surface-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item?.photos[0]} alt={item?.name} className="size-11 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-medium text-ink truncate">{other.name} · {item?.name}</p>
                  <span className="text-caption text-ink-subtle shrink-0">{last && <TimeAgo iso={last.createdAt} />}</span>
                </div>
                <p className={cn("text-caption truncate", unread ? "text-ink" : "text-ink-subtle")}>
                  {last?.type === "system" ? last.text : last?.from === "me" ? `You: ${last.text}` : last?.text}
                </p>
              </div>
              {unread && <span className="size-2 shrink-0 rounded-full bg-accent" aria-label="unread" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyState({ icon, title, body, actionLabel, href }: { icon: React.ReactNode; title: string; body: string; actionLabel: string; href: string }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-subtle text-ink-muted">{icon}</span>
      <p className="text-heading-3 text-ink">{title}</p>
      <p className="text-body text-ink-muted max-w-xs">{body}</p>
      <Link href={href}>
        <Button variant="secondary">{actionLabel}</Button>
      </Link>
    </div>
  );
}
