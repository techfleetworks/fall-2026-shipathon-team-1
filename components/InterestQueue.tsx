"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, X } from "lucide-react";
import type { Interest, Item } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { TimeAgo } from "@/components/TimeText";
import { useStore } from "@/lib/store";
import { remaining } from "@/lib/utils";

export function InterestQueue({ item }: { item: Item }) {
  const router = useRouter();
  const { acceptTop, declineTop, undoAccept, getThreadByItem } = useStore();
  const [showBanner, setShowBanner] = useState(true);

  const accepted = item.interests.find((i) => i.state === "accepted");
  const queue = item.interests
    .filter((i) => ["active", "waiting", "accepted"].includes(i.state))
    .sort((a, b) => a.position - b.position);

  const defaultExpanded = queue[0]?.id ?? null;
  const [expandedId, setExpandedId] = useState<string | null>(defaultExpanded);

  const openChat = () => {
    const id = getThreadByItem(item.id)?.id;
    if (id) router.push(`/inbox/${id}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {accepted && showBanner && (
        <div className="flex items-start gap-2 rounded-md bg-positive-subtle p-3">
          <div className="min-w-0 flex-1">
            <p className="text-body-medium text-positive">Request accepted</p>
            <p className="text-caption text-ink-muted mt-0.5">
              {accepted.receiver.name} will be notified. Start a chat to arrange pickup.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss"
            className="text-positive"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-border-subtle">
        {queue.map((interest) => (
          <QueueRow
            key={interest.id}
            interest={interest}
            itemAccepted={Boolean(accepted)}
            expanded={expandedId === interest.id}
            onToggle={() => setExpandedId(expandedId === interest.id ? null : interest.id)}
            onAccept={() => acceptTop(item.id)}
            onDecline={() => declineTop(item.id)}
            onUndo={() => undoAccept(item.id)}
            onStartChat={openChat}
          />
        ))}
      </ul>
    </div>
  );
}

function QueueRow({
  interest,
  itemAccepted,
  expanded,
  onToggle,
  onAccept,
  onDecline,
  onUndo,
  onStartChat,
}: {
  interest: Interest;
  itemAccepted: boolean;
  expanded: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onUndo: () => void;
  onStartChat: () => void;
}) {
  const isAccepted = interest.state === "accepted";
  const isQueued = interest.state === "active" || interest.state === "waiting";
  const rem = interest.expiresAt ? remaining(interest.expiresAt) : "";
  const showActions = expanded && (isQueued || isAccepted);

  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0">
      <div
        className="flex cursor-pointer items-start gap-3"
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(); }}
      >
        <Avatar src={interest.receiver.avatar} name={interest.receiver.name} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-body-medium text-ink">{interest.receiver.name}</p>
            <span className="text-caption text-ink-subtle shrink-0">
              #{interest.position}
            </span>
            {isAccepted ? (
              <Tag tone="green" icon={<CheckCircle2 size={12} aria-hidden />}>Accepted</Tag>
            ) : itemAccepted ? (
              <Tag tone="gray">Wait-listed</Tag>
            ) : rem ? (
              <Tag tone="gray" icon={<Clock size={11} aria-hidden />}>{rem} remaining</Tag>
            ) : null}
          </div>
          {expanded && isQueued && interest.note && (
            <p className="text-body text-ink-muted mt-1.5">&ldquo;{interest.note}&rdquo;</p>
          )}
        </div>
      </div>

      {showActions && isQueued && (
        <div className="flex gap-2 pl-12">
          <Button variant="secondary" fullWidth onClick={onDecline}>Decline</Button>
          <Button fullWidth onClick={onAccept}>Accept</Button>
        </div>
      )}
      {showActions && isAccepted && (
        <div className="flex gap-2 pl-12">
          <Button variant="secondary" fullWidth onClick={onUndo}>Undo</Button>
          <Button fullWidth onClick={onStartChat}>Start chat</Button>
        </div>
      )}
    </li>
  );
}
