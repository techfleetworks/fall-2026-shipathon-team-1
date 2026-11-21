"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox as InboxIcon, MessageSquare, MoreHorizontal } from "lucide-react";
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
  const searchParams = useSearchParams();
  const paramTab = searchParams.get("tab");

  const [tab, setTab] = useState<Tab>("requests");
  const [initialSide] = useState<"sent" | "received">(paramTab === "received" ? "received" : "sent");
  const [side, setSide] = useState<"sent" | "received">(initialSide);

  return (
    <>
      <TopBar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-2">
          <h1 className="text-heading-1 text-ink">Inbox</h1>

          {/* Top tabs */}
          <div className="mt-2 flex gap-6 border-b border-border-subtle" role="tablist">
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
        </div>

        {tab === "requests" && <RequestsToggle initialSide={initialSide} onSideChange={setSide} />}
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-3">
          {tab === "requests" ? <RequestsList side={side} /> : <MessagesTab />}
        </main>
      </div>
      <BottomNav />
    </>
  );
}

// -------------------- Requests (Sent / Received) --------------------
function RequestsToggle({ initialSide, onSideChange }: { initialSide: "sent" | "received"; onSideChange: (s: "sent" | "received") => void }) {
  const { mySentRequests, myReceivedItems } = useStore();
  const [side, setSide] = useState<"sent" | "received">(initialSide);

  const change = (s: "sent" | "received") => { setSide(s); onSideChange(s); };

  return (
    <div className="shrink-0 border-b border-border-subtle px-4 pb-3 pt-3">
      <div className="flex gap-1 rounded-md border border-border-subtle bg-surface-200 p-1">
        <SideButton active={side === "sent"} onClick={() => change("sent")} label={`Sent (${mySentRequests.length})`} />
        <SideButton active={side === "received"} onClick={() => change("received")} label={`Received (${myReceivedItems.length})`} />
      </div>
    </div>
  );
}

function RequestsList({ side }: { side: "sent" | "received" }) {
  return (
    <div className="flex flex-col gap-4">
      {side === "sent" ? <SentList /> : <ReceivedList />}
    </div>
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

  const canWithdraw = interest.state === "accepted" || interest.state === "active" || interest.state === "waiting";

  let tag = <Tag tone="gray">—</Tag>;
  let actions: React.ReactNode = null;

  if (interest.state === "accepted") {
    tag = <Tag tone="green">Accepted request</Tag>;
    actions = (
      <Button fullWidth onClick={() => thread && router.push(`/inbox/${thread.id}`)}>Start a chat</Button>
    );
  } else if (interest.state === "active" || interest.state === "waiting") {
    const others = queueOf(item).filter((i) => i.receiver.id !== interest.receiver.id);
    tag = <Tag tone="gray">{others.length > 0 ? "Waiting in queue" : "Waiting"}{rem ? ` · ${rem} left` : ""}</Tag>;
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
      <Link href={`/item/${item.id}`} className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.photos[0]} alt={item.name} className="size-12 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <p className="text-body-medium text-ink truncate">{item.name}</p>
              <div className="shrink-0">{tag}</div>
            </div>
            {canWithdraw && (
              <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.preventDefault()}>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
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
                      onClick={(e) => { e.preventDefault(); withdrawInterest(item.id); setMenuOpen(false); }}
                    >
                      Withdraw request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-caption text-ink-subtle mt-1">From {poster.name}</p>
        </div>
      </Link>
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
            <Link key={item.id} href={`/item/${item.id}`} className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-200/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.photos[0]} alt={item.name} className="size-12 shrink-0 rounded-md object-cover opacity-70" />
              <div className="min-w-0 flex-1">
                <p className="text-body-medium text-ink-muted">{item.name}</p>
                <p className="text-caption text-ink-subtle">{bundle ? <PostedAgo iso={bundle.createdAt} /> : ""}</p>
              </div>
              <span className="text-caption text-ink-subtle">{given} Given · {declined} Declined</span>
            </Link>
          );
        }
        return (
          <section key={item.id} className="flex flex-col rounded-md border border-border-subtle bg-surface-pure p-3">
            <Link href={`/item/${item.id}`} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.photos[0]} alt={item.name} className="size-12 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-medium text-ink truncate">{item.name}</p>
                  <span className="text-caption text-ink-subtle shrink-0">{bundle ? <PostedAgo iso={bundle.createdAt} /> : ""}</span>
                </div>
                {item.status !== "accepted" && (
                  <p className="text-caption text-ink-muted mt-0.5">{interested} people interested</p>
                )}
              </div>
            </Link>
            <div className="my-3 border-t border-border-subtle" />
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
